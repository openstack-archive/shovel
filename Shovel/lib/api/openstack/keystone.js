/* keystone authentication */
var config = require('./../../../config.json');
var client = require('./../../../client');
var Promise = require('bluebird');
Promise.promisifyAll(client);

var request = {
    host: config.keystone.httpHost,
    path: '/' + config.keystone.version + '/tokens',
    port: config.keystone.httpPort,
    token: '',
    data: {},
    api: {},
    useragent: ''
};

var KeystoneAuthentication = {
    authenticatePassword: function (tenantName, username, password) {
        request.data = JSON.stringify(
            {
                'auth': {
                    'tenantName': tenantName,
                    'passwordCredentials': {
                        'username': username,
                        'password': password
                    }
                }
            });
        return (client.PostAsync(request));
    },

    authenticateToken: function (tenantName, username, token) {
       request.data = JSON.stringify(
            {
                "auth": {
                    "tenantName": tenantName,
                    "token": {
                        "id": token
                    }
                }
            });
        return (client.PostAsync(request));
    }
}
module.exports = Object.create(KeystoneAuthentication);