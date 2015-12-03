var app = require('connect')();
var http = require('http');
var swaggerTools = require('swagger-tools');

var options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};
var swaggerDoc = require('./../api/swagger.json');

module.exports.startServer = function startServer() {
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        app.use(middleware.swaggerMetadata());
        app.use(middleware.swaggerRouter(options));
        http.createServer(app).listen(9008, 'localhost');
    });
};
module.exports.stopServer = function stopServer() {
    var net = require('net');
    var socket = net.createConnection(9008);
    socket.end();
};




