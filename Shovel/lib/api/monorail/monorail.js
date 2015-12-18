var config = require('./../../../config.json');
var client = require('./../client');
var Promise = require('bluebird');
var _ = require('underscore');
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
    },
    lookupCatalog: function lookupCatalog(node) {
        var self = this;
        return self.get_catalog_data_by_source(node.id, 'dmi')
        .then(function (dmi) {
            if (!_.has(JSON.parse(dmi), 'data')) {
                return false;
            }
        })
        .then(function () {
            return self.get_catalog_data_by_source(node.id, 'lsscsi')
        })
        .then(function (lsscsi) {
            if (!_.has(JSON.parse(lsscsi), 'data')) {
                return false;
            }
        })
            .then(function () {
                return self.get_catalog_data_by_source(node.id, 'bmc')
            })
        .then(function (bmc) {
            if (!_.has(JSON.parse(bmc), 'data')) {
                return false;
            }
            else {
                return true;
            }
        })
        .catch(function (err) {
            return false;
        })
    },
    nodeDiskSize: function nodeDiskSize(node) {
        var local_gb = 0;
        var self = this;
        return self.get_catalog_data_by_source(node.id, 'lsscsi').
            then(function (scsi) {
                scsi = JSON.parse(scsi);
                if (scsi.data) {
                    for (var elem in scsi.data) {
                        var item = (scsi.data[elem]);
                        if (item['peripheralType'] == 'disk') {
                            local_gb += parseFloat(item['size'].replace('GB', '').trim());
                        }
                    }
                }
                return Promise.resolve(local_gb);
            })
        .catch(function (err) {
            throw err;
        })
    },
    get_node_memory_cpu: function get_node_memory_cpu(computeNode) {
        var self = this;
        var dmiData = { cpus: 0, memory: 0 };
        return self.get_catalog_data_by_source(computeNode.id, 'dmi').
        then(function (dmi) {
            dmi = JSON.parse(dmi);
            if (dmi.data) {
                var dmi_total = 0;
                if (dmi.data['Memory Device']) {
                    var memory_device = dmi.data['Memory Device'];
                    for (var elem in memory_device) {
                        var item = memory_device[elem];
                        //logger.info(item['Size']);
                        if (item['Size'].indexOf('GB') > -1) {
                            dmi_total += parseFloat(item['Size'].replace('GB', '').trim()) * 1000;
                        }
                        if (item['Size'].indexOf('MB') > -1) {
                            dmi_total += parseFloat(item['Size'].replace('MB', '').trim());
                        }
                    }
                    dmiData.memory = dmi_total;
                }
                if (dmi['data'].hasOwnProperty('Processor Information')) {
                    dmiData.cpus = dmi['data']['Processor Information'].length;
                }
            }
            return Promise.resolve(dmiData);
        })
        .catch(function (err) {
            throw err;
        })
    }

};
module.exports = Object.create(MonorailWrapper);