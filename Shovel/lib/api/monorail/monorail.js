var config = require('./../../../config.json');
var client = require('./../../../client');
var Promise = require('bluebird');
Promise.promisifyAll(client);

var pfx = '/api/' + config.monorail.version;
var request = {
    host: config.monorail.httpHost,
    port: config.monorail.httpPort,
    path: pfx,
    token: '',
    data: '',
    api: ''
};

/*
 * Monorail wrapper functions 
 */
var MonorailWrapper = {
    request_nodes_get: function (ret) {
        request.path = pfx + '/nodes';
        return client.GetAsync(request);
    },
    request_node_get: function (identifier, ret) {
        request.path = pfx + '/nodes/' + identifier;
        return client.GetAsync(request);
    },
    request_whitelist_set: function (hwaddr, ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/dhcp/whitelist';
        return client.PostAsync(request);
    },
    request_whitelist_del: function (hwaddr, ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/dhcp/whitelist';
        return client.DeleteAsync(request);
    },
    request_catalogs_get: function (hwaddr, ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/catalogs';
        return client.GetAsync(request);
    },
    get_catalog_data_by_source: function (hwaddr, source, ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/catalogs/' + source;
        return client.GetAsync(request);
    },
    request_poller_get: function (identifier, ret) {
        request.path = pfx + '/nodes/' + identifier + '/pollers';
        return client.GetAsync(request);
    },
    request_poller_data_get: function (identifier, ret) {
        request.path = pfx + '/pollers/' + identifier + '/data/current';
        return client.GetAsync(request);
    }
};
module.exports = Object.create(MonorailWrapper);