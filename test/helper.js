// Copyright 2015, EMC, Inc.

var app = require('express')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var sinon = require('sinon');
var winston = require('winston');
var logger = require('./../lib/services/logger');
var loggerVar = new (winston.Logger)({
    levels: { verbose: 5, debug: 4, info: 3, warn: 2, error: 1, mask: 0 },
    colors: { verbose: 'cyan', debug: 'blue', info: 'green', warn: 'yellow', error: 'red' }
})
.add(winston.transports.Console, { level: 'mask' });
var options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};
var swaggerDoc = require('./../api/swagger.json');

module.exports.maskLogger = function maskLogger() {
    sinon.stub(logger, 'Logger').returns(loggerVar);
};

module.exports.restoreLogger = function restoreLogger() {
    logger['Logger'].restore();
};

module.exports.startServer = function startServer() {
    this.maskLogger();
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        app.use(middleware.swaggerMetadata());
        app.use(middleware.swaggerRouter(options));
        http.createServer(app).listen(9008, 'localhost');
    });
};
module.exports.stopServer = function stopServer() {
    this.restoreLogger();
    var net = require('net');
    var socket = net.createConnection(9008);
    socket.end();
};