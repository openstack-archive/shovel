// Copyright 2015, EMC, Inc.

/*eslint-env node*/
/* keystone authentication */
var config = require('./../../../config.json');
var client = require('./../client');
var Promise = require('bluebird');
var encryption = require('./../../services/encryption');
var logger = require('./../../services/logger').Logger;

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
        'use strict';
        var decrypted;
        try {
            decrypted = encryption.decrypt(password);
        } catch (err) {
            logger.error(err);
            //return empty promise
            return Promise.resolve();
        }
        request.data = JSON.stringify(
            {
                auth: {
                    tenantName: tenantName,
                    passwordCredentials: {
                        username: username,
                        password: decrypted

                    }
                }
            });
        return client.PostAsync(request);
    },

    authenticateToken: function (tenantName, username, token) {
        'use strict';
        request.data = JSON.stringify(
            {
                auth: {
                    tenantName: tenantName,
                    token: {
                        id: token
                    }
                }
            });
        return client.PostAsync(request);
    },
    getStatus: function () {
        'use strict';
        return client.getStatus();
    }
};
module.exports = Object.create(KeystoneAuthentication);
