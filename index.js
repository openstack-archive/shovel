/* global process */
'use strict';

var app = require('express')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var config = require('./config.json');
var Poller = require('./lib/services/poller');
var serverPort = config.shovel.httpPort;

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var swaggerDoc = require('./api/swagger.json');

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(config.shovel.httpPort, config.shovel.hostname, function () {
      console.log('Your server is listening on port %d ', config.shovel.httpPort);
      console.log('Swagger-ui is available on http://%s:%d/docs', config.shovel.hostname, config.shovel.httpPort);
      var pollerInstance = new Poller(5000);//timeInterval to 5s
      pollerInstance.startServer();
  });
});
