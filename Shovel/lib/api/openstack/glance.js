var config = require('./../../../config.json');
var client = require('./../../../client');
var keystone = require('./keystone');
var pfx = config.glance.version;
var request = {
    host: config.glance.httpHost,
    port: config.glance.httpPort,
    path: pfx,
    token: '',
    data: ''
};

/*
 *  glance client object
 */
var glanceClient = {
    get_client: function (ret) {
        keystone.authenticate('password', function (token) {
            request.token = token;
            ret(glanceWrapper);
        });
    }
};
module.exports = Object.create(glanceClient);


/*
 * glance wrapper functions 
 */
var glanceWrapper = {
    get_images: function (ret) {
        request.path = pfx + '/images';
        client.Get(request, function (images) {
            ret(images);
        });
    }
};