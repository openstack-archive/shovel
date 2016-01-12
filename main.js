var cp = require('child_process');
var fs = require('fs');

var server = cp.fork('index.js');
console.log('Server started');

fs.watchFile('config.json', function (event, filename) {
    server.kill();
    console.log('Server stopped');
    server = cp.fork('index.js');
    console.log('Server started');
});

process.on('SIGINT', function () {
    server.kill();
    fs.unwatchFile('config.json');
    console.info('found an error in the server');
    process.exit();    
});