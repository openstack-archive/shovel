/* http client */
var HttpClient = {
    Get: function( msg, output ) {
        var http = require('http');
        var options = { 
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'GET',
            headers: {}
        }; 
        
        if( Buffer.byteLength(msg.token) )
        {
            options.headers['X-Auth-Token'] = msg.token;
        };
        
        cb = function( response ) {
            var body = '';
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                output(body);
            });
        };
        
        request = http.request(options, cb);
        request.on('error', function(e) {
            console.log("Error: " + msg.host + "\n" + e.message); 
            console.log(e.stack);
        });
        
        request.end();
    },
    Post: function (msg, output) {
        var http = require('http');      
        var options = { 
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'POST',
            headers: { 'Content-type': 'application/json', 
                       'Accept': 'application/json',
                       'Content-Length': Buffer.byteLength(msg.data),
                       'User-Agent': 'shovel-client' }
        }; 
        
        /*Update the request header with special fields*/
        if( Buffer.byteLength(msg.token) )
        {
            options.headers['X-Auth-Token'] = msg.token;
        };
        if( Buffer.byteLength(JSON.stringify(msg.api)) )
        {
            options.headers[msg.api.name] = msg.api.version;
        };
        
        cb = function( response ) {
            var body = '';
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                output(body);
            });            
        };
        
        request = http.request(options, cb);
        request.on('error', function(e) {
            console.log("Error: " + msg.host + "\n" + e.message); 
            console.log(e.stack);
        });
            
        if( Buffer.byteLength(msg.data) )
        {
            request.write(msg.data);
        };
        request.end();      
    },
    Delete: function( msg, output ) {
        var http = require('http');
        var options = { 
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'DELETE',
            headers: {}
        }; 
        
        if( Buffer.byteLength(msg.token) )
        {
            options.headers['X-Auth-Token'] = msg.token;
        };
        
        if( Buffer.byteLength(JSON.stringify(msg.api)) )
        {
            options.headers[msg.api.name] = msg.api.version;
        };
        
        cb = function( response ) {
            var body = '';
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                output(body);
            });
        };
        
        request = http.request(options, cb);
        request.on('error', function(e) {
            console.log("Error: " + msg.host + "\n" + e.message); 
            console.log(e.stack);
        });
        
        request.end();
    },
    Put: function( msg, output ) { 
        var http = require('http');      
        var options = { 
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'PUT',
            headers: { 'Content-type': 'application/json', 
                       'Accept': 'application/json',
                       'Content-Length': Buffer.byteLength(msg.data),
                       'User-Agent': 'shovel-client' }
        }; 
        
        if( Buffer.byteLength(msg.token) )
        {
            options.headers['X-Auth-Token'] = msg.token;
        };
        
        if( Buffer.byteLength(JSON.stringify(msg.api)) )
        {
            options.headers[msg.api.name] = msg.api.version;
        };
        
        cb = function( response ) {
            var body = '';
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                output(body);
            });            
        };
        
        request = http.request(options, cb);
        request.on('error', function(e) {
            console.log("Error: " + msg.host + "\n" + e.message); 
            console.log(e.stack);
        });
            
        request.write(msg.data);
        request.end();      
    },
    Patch: function (msg, output) {
        var http = require('http');      
        var options = { 
            hostname: msg.host,
            path: msg.path,
            port: msg.port,
            method: 'PATCH',
            headers: { 'Content-type': 'application/json', 
                       'Accept': 'application/json',
                       'Content-Length': Buffer.byteLength(msg.data),
                       'User-Agent': 'shovel-client' }
        }; 
        
        /*Update the request header with special fields*/
        if( Buffer.byteLength(msg.token) )
        {
            options.headers['X-Auth-Token'] = msg.token;
        };
        if( Buffer.byteLength(JSON.stringify(msg.api)) )
        {
            options.headers[msg.api.name] = msg.api.version;
        };
        
        cb = function( response ) {
            var body = '';
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                output(body);
            });            
        };
                
        request = http.request(options, cb);
        request.on('error', function(e) {
            console.log("Error: " + msg.host + "\n" + e.message); 
            console.log(e.stack);
        });
            
        if( Buffer.byteLength(msg.data) )
        {
            request.write(msg.data);
        };
        request.end();      
    },
};
module.exports = Object.create(HttpClient);

