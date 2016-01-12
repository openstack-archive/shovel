// Copyright 2015, EMC, Inc.

/*eslint-env node*/

/* http client */
var HttpClient = {
    Get: function (msg, output) {
        'use strict';
        var http = require('http');
        var options = {
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'GET',
            headers: {}
        };
        if (Buffer.byteLength(msg.token)) {
            options.headers['X-Auth-Token'] = msg.token;
        }

        var cb = function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('error', function (err) {
                var errorMessage = { errorMessage: { hostname: msg.host, message: err } };
                output(errorMessage);
            });
            response.on('end', function () {
                output(null, body);
            });
        };

        var request = http.request(options, cb);
        request.on('error', function (e) {
            var errorMessage = { errorMessage: { hostname: msg.host, message: e } };
            output(errorMessage);
        });

        request.end();
    },
    Post: function (msg, output) {
        'use strict';
        var http = require('http');
        var options = {
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(msg.data),
                'User-Agent': 'shovel-client'
            }
        };

        /*Update the request header with special fields*/
        if (Buffer.byteLength(msg.token)) {
            options.headers['X-Auth-Token'] = msg.token;
        }
        if (Buffer.byteLength(JSON.stringify(msg.api))) {
            options.headers[msg.api.name] = msg.api.version;
        }

        var cb = function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('error', function (e) {
                var errorMessage = { errorMessage: { hostname: msg.host, message: e } };
                output(errorMessage);
            });
            response.on('end', function () {
                output(null, body);
            });
        };

        var request = http.request(options, cb);
        request.on('error', function (e) {
            var errorMessage = { errorMessage: { hostname: msg.host, message: e } };
            output(errorMessage);
        });

        if (Buffer.byteLength(msg.data)) {
            request.write(msg.data);
        }
        request.end();
    },
    Delete: function (msg, output) {
        'use strict';
        var http = require('http');
        var options = {
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'DELETE',
            headers: {}
        };

        if (Buffer.byteLength(msg.token)) {
            options.headers['X-Auth-Token'] = msg.token;
        }

        if (Buffer.byteLength(JSON.stringify(msg.api))) {
            options.headers[msg.api.name] = msg.api.version;
        }

        var cb = function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('error', function (err) {
                var errorMessage = { errorMessage: { hostname: msg.host, message: err } };
                output(errorMessage);
            });
            response.on('end', function () {
                output(null, body);
            });
        };

        var request = http.request(options, cb);
        request.on('error', function (e) {
            var errorMessage = { errorMessage: { hostname: msg.host, message: e } };
            output(errorMessage);
        });

        request.end();
    },
    Put: function (msg, output) {
        'use strict';
        var http = require('http');
        var options = {
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(msg.data),
                'User-Agent': 'shovel-client'
            }
        };

        if (Buffer.byteLength(msg.token)) {
            options.headers['X-Auth-Token'] = msg.token;
        }

        if (Buffer.byteLength(JSON.stringify(msg.api))) {
            options.headers[msg.api.name] = msg.api.version;
        }

        var cb = function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('error', function (err) {
                var errorMessage = { errorMessage: { hostname: msg.host, message: err } };
                output(errorMessage);
            });
            response.on('end', function () {
                output(null, body);
            });
        };

        var request = http.request(options, cb);
        request.on('error', function (e) {
            var errorMessage = { errorMessage: { hostname: msg.host, message: e } };
            output(errorMessage);
        });

        request.write(msg.data);
        request.end();
    },
    Patch: function (msg, output) {
        'use strict';
        var http = require('http');
        var options = {
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(msg.data),
                'User-Agent': 'shovel-client'
            }
        };

        /*Update the request header with special fields*/
        if (Buffer.byteLength(msg.token)) {
            options.headers['X-Auth-Token'] = msg.token;
        }
        if (Buffer.byteLength(JSON.stringify(msg.api))) {
            options.headers[msg.api.name] = msg.api.version;
        }

        var cb = function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('error', function (err) {
                var errorMessage = { errorMessage: { hostname: msg.host, message: err } };
                output(errorMessage);
            });
            response.on('end', function () {
                output(null, body);
            });
        };

        var request = http.request(options, cb);
        request.on('error', function (e) {
            var errorMessage = { errorMessage: { hostname: msg.host, message: e } };
            output(errorMessage);
        });

        if (Buffer.byteLength(msg.data)) {
            request.write(msg.data);
        }
        request.end();
    }
};
module.exports = Object.create(HttpClient);

