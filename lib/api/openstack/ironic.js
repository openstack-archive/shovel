// Copyright 2015, EMC, Inc.

/*eslint-env node*/
var config = require('./../../../config.json');
var client = require('./../client');
var Promise = require('bluebird');
Promise.promisifyAll(client);
var pfx = config.ironic.version;
var request = {
    host: config.ironic.httpHost,
    port: config.ironic.httpPort,
    path: pfx,
    token: '',
    data: '',
    api: {
        'name': 'X-OpenStack-Ironic-API-Version',
        'version': '1.6'
    }
};

/*
 * Ironic wrapper functions
 */
var ironicWrapper = {
    get_chassis: function (token) {
        'use strict';
        request.token = token;
        request.path = pfx + '/chassis';
        return client.GetAsync(request);

    },
    get_chassis_by_id: function (token, identifier) {
        'use strict';
        request.token = token;
        request.path = pfx + '/chassis/' + identifier;
        return client.GetAsync(request);
    },
    get_node_list: function (token) {
        'use strict';
        request.token = token;
        request.path = pfx + '/nodes/detail';
        return client.GetAsync(request);
    },
    get_node: function (token, identifier) {
        'use strict';
        request.token = token;
        request.path = pfx + '/nodes/' + identifier;
        return client.GetAsync(request);
    },
    create_node: function (token, node) {
        'use strict';
        request.token = token;
        request.path = pfx + '/nodes';
        request.data = node;
        return client.PostAsync(request);
    },
    patch_node: function (token, identifier, data) {
        'use strict';
        request.token = token;
        request.path = pfx + '/nodes/' + identifier;
        request.data = data;
        return client.PatchAsync(request);
    },
    delete_node: function (token, identifier) {
        'use strict';
        request.token = token;
        request.path = pfx + '/nodes/' + identifier;
        return client.DeleteAsync(request);
    },
    get_port_list: function (token) {
        'use strict';
        request.token = token;
        request.path = pfx + '/ports';
        return client.GetAsync(request);
    },
    get_port: function (token, identifier) {
        'use strict';
        request.token = token;
        request.path = pfx + '/ports/' + identifier;
        return client.GetAsync(request);
    },
    create_port: function (token, port) {
        'use strict';
        request.token = token;
        request.path = pfx + '/ports';
        request.data = port;
        return client.PostAsync(request);
    },
    set_power_state: function (token, identifier, state) {
        'use strict';
        request.token = token;
        request.path = pfx + '/nodes/' + identifier + '/states/power';
        if (state === 'off' || state === 'on') {
            request.data = JSON.stringify({ target: 'power ' + state });
        }
        if (state === 'reboot') {
            request.data = JSON.stringify({ target: 'rebooting' });
        }
        return client.PutAsync(request);
    },
    get_driver_list: function (token) {
        'use strict';
        request.token = token;
        request.path = pfx + '/drivers';
        return client.GetAsync(request);
    }
};

module.exports = Object.create(ironicWrapper);
