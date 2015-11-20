var config = require('./../../../config.json');
var client = require('./../../../client');
var keystone = require('./keystone');
var pfx = config.ironic.version;
var request = {
    host: config.ironic.httpHost,
    port: config.ironic.httpPort,
    path: pfx,
    token: '',
    data: '',
    api: { 'name': 'X-OpenStack-Ironic-API-Version', 'version': '1.6' } /* TODO: set version from ironic */
};

/*
 *  Ironic client object
 */
var ironicClient = {
    get_client: function (ret) {
        keystone.authenticate('password', function (token) {
            request.token = token;
            ret(ironicWrapper);
        });
    }
};
module.exports = Object.create(ironicClient);


/*
 * Ironic wrapper functions 
 */
var ironicWrapper = {
    get_chassis: function (ret) {
        request.path = pfx + '/chassis';
        client.Get(request, function (chassis) {
            ret(chassis);
        });
    },
    get_chassis_by_id: function (identifier, ret) {
        request.path = pfx + '/chassis/' + identifier;
        client.Get(request, function (chassis) {
            ret(chassis);
        });
    },
    get_node_list: function (ret) {
        request.path = pfx + '/nodes/detail';
        client.Get(request, function (node) {
            ret(node);
        });
    },
    get_node: function (identifier, ret) {
        request.path = pfx + '/nodes/' + identifier;
        client.Get(request, function (node) {
            ret(node);
        });
    },
    create_node: function (node, ret) {
        request.path = pfx + '/nodes';
        request.data = node;
        client.Post(request, function (body) {
            ret(body);
        });
    },
    patch_node: function (identifier, data, ret) {
        request.path = pfx + '/nodes/' + identifier;
        request.data = data;
        client.Patch(request, function (body) {
            ret(body);
        });
    },
    delete_node: function (identifier, ret) {
        request.path = pfx + '/nodes/' + identifier;
        client.Delete(request, function (body) {
            ret(body);
        });
    },
    get_port_list: function (ret) {
        request.path = pfx + '/ports';
        client.Get(request, function (ports) {
            ret(ports);
        });
    },
    get_port: function (identifier, ret) {
        request.path = pfx + '/ports/' + identifier;
        client.Get(request, function (port) {
            ret(port);
        });
    },
    create_port: function (port, ret) {
        request.path = pfx + '/ports';
        request.data = port;
        client.Post(request, function (body) {
            ret(body);
        });
    },
    set_power_state: function (identifier, state, ret) {
        request.path = pfx + '/nodes/' + identifier + '/states/power';
        if (state === 'off' || state === 'on') {
            request.data = { target: 'power ' + state }
        }
        if (state === 'reboot') {
            request.data = { target: 'rebooting' };
        }
        request.data = JSON.stringify(request.data);
        client.Put(request, function (node) {
            ret(node);
        });
    },
    get_driver_list: function (ret) {
        request.path = pfx + '/drivers';
        client.Get(request, function (node) {
            ret(node);
        });
    }
};




