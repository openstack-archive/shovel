var config = require('./../../../config.json');
var client = require('./../../../client');
var pfx = '/api/' + config.monorail.version;
var request = { 
    host: config.monorail.httpHost, 
    port: config.monorail.httpPort,
    path: pfx,
    token: '',
    data: '',
    api:''
}; 

/*
 * Monorail wrapper functions 
 */
var MonorailWrapper = {
    request_nodes_get: function( ret ) {
        request.path = pfx + '/nodes';
        client.Get(request, function(body) { 
            ret(body);
        });
    },
    request_node_get: function( identifier, ret ) {
        request.path = pfx + '/nodes/' + identifier;
        client.Get(request, function(body) { 
            ret(body);
        });
    },
    request_whitelist_set: function (hwaddr,ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/dhcp/whitelist';
        client.Post(request,function(body){
            ret (body);
        });
    },
    request_whitelist_del: function (hwaddr, ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/dhcp/whitelist';
        client.Delete(request, function (body) {
            ret(body);
        });
    },
    request_catalogs_get: function (hwaddr,ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/catalogs';
        client.Get(request, function (body) {
            ret(body);
        });
    },
    get_catalog_data_by_source: function (hwaddr, source, ret) {
        request.path = pfx + '/nodes/' + hwaddr + '/catalogs/' + source;
        client.Get(request, function (body) {
            ret(body);
        });       
    },
    request_poller_get: function( identifier, ret ) {
        request.path = pfx + '/nodes/' + identifier + '/pollers';
        client.Get(request, function(body) { 
            ret(body);
        });
    },
    request_poller_data_get: function( identifier, ret ) {
        request.path = pfx + '/pollers/' + identifier + '/data/current';
        client.Get(request, function(body) { 
            ret(body);
        });
    }
};
module.exports = Object.create(MonorailWrapper);