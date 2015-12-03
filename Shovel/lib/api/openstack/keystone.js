/* keystone authentication */
var config = require('./../../../config.json');
var client = require('./../../../client');
var Promise = require('bluebird');
Promise.promisifyAll(client);

var KeystoneAuthentication = {
    authenticate: function (authType) {
        var request = {
            host: config.keystone.httpHost,
            path: '/' + config.keystone.version + '/tokens',
            port: config.keystone.httpPort,
            token: '',
            data: {},
            api: {},
            useragent: ''
        };
        if (authType == 'password') {
            request.data = JSON.stringify(
                {
                    'auth': {
                        'tenantName': config.ironic.os_tenant_name,
                        'passwordCredentials': {
                            'username': config.ironic.os_username,
                            'password': config.ironic.os_password
                        }
                    }
                });
        };
        if (authType == 'token') {
            request.data = JSON.stringify(
                {
                    "auth": {
                        "tenantName": config.ironic.os_tenant_name,
                        "token": {
                            "id": config.ironic.os_auth_token
                        }
                    }
                });
        };
        return (client.PostAsync(request));
    }
};
module.exports = Object.create(KeystoneAuthentication);