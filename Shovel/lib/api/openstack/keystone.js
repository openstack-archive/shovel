/* keystone authentication */
var config = require('./../../../config.json');
var client = require('./../../../client');
var Promise = require('bluebird');
Promise.promisifyAll(client);
var encryption = require('./../../../controllers/encryption');

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
        var decrypted = encryption.decrypt(password, 'random-key', 'aes-256-cbc', 'utf8', 'base64');
        request.data = JSON.stringify(
            {
                'auth': {
                    'tenantName': tenantName,
                    'passwordCredentials': {
                        'username': username,
                        'password': decrypted

                    }
                }
            });
        console.log ("the password is :", password);
        console.log ("the password is :", decrypted);
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