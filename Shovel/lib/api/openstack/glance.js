var config = require('./../../../config.json');
var client = require('./../../../client');
var Promise = require('bluebird');
Promise.promisifyAll(client);

var pfx = config.glance.version;
var request = {
    host: config.glance.httpHost,
    port: config.glance.httpPort,
    path: pfx,
    token: '',
    data: ''
};

/*
 * glance wrapper functions 
 */
var glanceWrapper = {
    get_images: function (token) {
        request.token = token;
        request.path = pfx + '/images';
        return client.GetAsync(request);
    }
};
module.exports = Object.create(glanceWrapper);