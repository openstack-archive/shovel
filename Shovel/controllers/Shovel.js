'use strict';

var url = require('url');
var monorail = require('./../lib/api/monorail/monorail');
var ironic = require('./../lib/api/openstack/ironic');
var config = require('./../config.json');
var promise = require('bluebird')
var glance = require('./../lib/api/openstack/glance');

/*
* @api {get} /api/1.1/info / GET /
* @apiDescription get shovel information
* @apiVersion 1.1.0
*/
module.exports.infoGet = function infoGet(req, res, next) {
    var info = {
        name: 'shovel',
        description: 'onrack-ironic agent',
        appversion: config.appver,
        apiversion: config.apiver
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(info));
};

/*
* @api {get} /api/1.1/ironic/drivers / GET /
* @apiDescription get ironic drivers
* @apiVersion 1.1.0
*/
module.exports.driversGet = function driversGet(req, res, next) {
    ironic.get_client(function (client) {
        client.get_driver_list(function (result) {
            if (typeof result !== 'undefined') {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
            }
            else
                res.end();
        });
    });
};

/*
* @api {get} /api/1.1/ironic/nodes / GET /
* @apiDescription get ironic nodes
* @apiVersion 1.1.0
*/
module.exports.ironicnodesGet = function ironicnodesGet(req, res, next) {
    var ironic_client;
    return new promise(function (resolve, reject) {
        ironic.get_client(function (client) {
            resolve(client);
            ironic_client = client;
        });
    }).then(function () {
        ironic_client.get_node_list(function (result) {
            if (typeof result !== 'undefined') {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
            }
            else
                res.end();
        });
    });

};

/*
* @api {get} /api/1.1/ironic/chassis / GET /
* @apiDescription get ironic chassis
* @apiVersion 1.1.0
*/
module.exports.ironicchassisGet = function ironicchassisGet(req, res, next) {
    ironic.get_client(function (client) {
        client.get_chassis_by_id(req.swagger.params.identifier.value, function (result) {
            if (typeof result !== 'undefined') {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
            }
            else
                res.end();
        });
    });
};

/*
* @api {get} /api/1.1/ironic/nodes / GET /
* @apiDescription get ironic node
* @apiVersion 1.1.0
*/
module.exports.ironicnodeGet = function ironicnodeGet(req, res, next) {
    ironic.get_client(function (client) {
        client.get_node(req.swagger.params.identifier.value, function (result) {
            if (typeof result !== 'undefined') {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
            }
            else
                res.end();
        });
    });
};

/*
* @api {patch} /api/1.1/ironic/node/identifier / PATCH /
* @apiDescription patch ironic node info
* @apiVersion 1.1.0
*/
module.exports.ironicnodePatch = function ironicnodePatch(req, res, next) {
    ironic.get_client(function (client) {
        var data = JSON.stringify(req.body);
        client.patch_node(req.swagger.params.identifier.value, data, function (result) {
            console.info('\r\patched node:\r\n' + result);
            if (result) {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
                return;
            }
        });
    });
};


/*
* @api {get} /api/1.1/catalogs/identifier / GET /
* @apiDescription get catalogs
* @apiVersion 1.1.0
*/
module.exports.catalogsGet = function catalogsGet(req, res, next) {
    monorail.request_catalogs_get(req.swagger.params.identifier.value, function (catalogs) {
        if (typeof catalogs !== 'undefined') {
            res.setHeader('Content-Type', 'application/json');
            res.end(catalogs);
        }
        else
            res.end();
    });
};

/*
* @api {get} /api/1.1/catalogs/identifier / GET /
* @apiDescription get catalogs by source
* @apiVersion 1.1.0
*/
module.exports.catalogsbysourceGet = function catalogsbysourceGet(req, res, next) {
    monorail.get_catalog_data_by_source(req.swagger.params.identifier.value, req.swagger.params.source.value, function (catalogs) {
        if (typeof catalogs !== 'undefined') {
            res.setHeader('Content-Type', 'application/json');
            res.end(catalogs);
        }
        else
            res.end();
    });
};

/*
* @api {get} /api/1.1/nodes/identifier / GET /
* @apiDescription get specific node by id
* @apiVersion 1.1.0
*/
module.exports.nodeGet = function nodeGet(req, res, next) {
    monorail.request_node_get(req.swagger.params.identifier.value, function (node) {
        if (typeof node !== 'undefined') {
            res.setHeader('Content-Type', 'application/json');
            res.end(node);
        }
        else
            res.end();
    });
};

/*
* @api {get} /api/1.1/nodes / GET /
* @apiDescription get list of monorail nodes
* @apiVersion 1.1.0
*/
module.exports.nodesGet = function nodesGet(req, res, next) {
    monorail.request_nodes_get(function (nodes) {
        if (typeof nodes !== 'undefined') {
            res.setHeader('Content-Type', 'application/json');
            res.end(nodes);
        }
        else
            res.end();
    });
};


/*
* @api {get} /api/1.1/nodes/identifier/sel / GET /
* @apiDescription get specific node by id
* @apiVersion 1.1.0
*/
module.exports.GetSELData = function nodeGet(req, res, next) {
    monorail.request_poller_get(req.swagger.params.identifier.value, function (pollers) {
        if (typeof pollers !== 'undefined') {
            pollers = JSON.parse(pollers);
            for( var i in pollers ) {
                if( pollers[i]['config']['command'] === 'sel' ) {
                    monorail.request_poller_data_get(pollers[i]['id'], function (data) {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(data);
                    });
                }
            }
        }
        else {
            res.end();
        }
    });
};

/* 
* @api register: node
* @apiDescription register a node in Ironic
* @apiVersion 1.1.0
*/
module.exports.registerpost = function registerpost(req, res, next) {
    var info = {};
    var node = {};
    var propreties = {};
    var local_gb = {};
    var extra = {};
    var port = {}
    var ironic_client;
    var ironic_node;
    var onrack_node;
    var user_entry = req.body;
    if (user_entry.driver == 'pxe_ipmitool') {
        info = { 'ipmi_address': user_entry.ipmihost, 'ipmi_username': user_entry.ipmiuser, 'ipmi_password': user_entry.ipmipass, 'deploy_kernel': user_entry.kernel, 'deploy_ramdisk': user_entry.ramdisk };
    }
    else if (user_entry.driver == 'pxe_ssh') {
        info = { 'ssh_address': user_entry.sshhost, 'ssh_username': user_entry.sshuser, 'ssh_password': user_entry.sshpass, 'ssh_port': user_entry.sshport, 'deploy_kernel': user_entry.kernel, 'deploy_ramdisk': user_entry.ramdisk };
    }
    else {
        info = {};
    }
    
    /* Fill in the extra meta data with some failover and event data */
    extra = { 'nodeid': user_entry.uuid, 'name': user_entry.name, 'events':{'time':'0'}, 'eventcnt': '0' };
    if ( typeof user_entry.failovernode !== 'undefined' ) {
        extra['failover'] = user_entry.failovernode;
    }
    if ( typeof user_entry.eventre !== 'undefined' ) {
        extra['eventre'] = user_entry.eventre;
    }

    local_gb = 0.0;
    return new promise(function (resolve, reject) {
        monorail.request_node_get(user_entry.uuid, function (result) {
            if (!JSON.parse(result).name) {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
                return;
            }
            resolve(onrack_node);
            onrack_node = JSON.parse(result);
        });
    }).then(function () {
        monorail.get_catalog_data_by_source(user_entry.uuid, 'lsscsi', function (scsi) {
            scsi = JSON.parse(scsi);
            if (scsi.data) {
                for (var elem in scsi.data) {
                    var item = (scsi.data[elem]);
                    if (item['peripheralType'] == 'disk') {
                        local_gb += parseFloat(item['size'].replace('GB', '').trim());
                    }
                }
            }
        });
        return;

    }).then(function () {
        monorail.get_catalog_data_by_source(user_entry.uuid, 'dmi', function (dmi) {
            dmi = JSON.parse(dmi);
            if (dmi.data) {
                var dmi_total = 0;
                if (dmi.data['Memory Device']) {
                    var memory_device = dmi.data['Memory Device'];
                    for (var elem in memory_device) {
                        var item = memory_device[elem];
                        //console.info(item['Size']);
                        if (item['Size'].indexOf('GB') > -1) {
                            dmi_total += parseFloat(item['Size'].replace('GB', '').trim()) * 1000;
                        }
                        if (item['Size'].indexOf('MB') > -1) {
                            dmi_total += parseFloat(item['Size'].replace('MB', '').trim());

                        }
                    }
                }
                propreties = {
                    'cpus': dmi['data']['Processor Information'].length,
                    'memory_mb': dmi_total,
                    'local_gb': local_gb
                };
            }

            node = { 
                'name': user_entry.uuid, 
                'driver': user_entry.driver, 
                'driver_info': info, 
                'properties': propreties, 
                'extra': extra 
            };
        });
        return;
    }).then(function () {
        return new promise(function (resolve, reject) {
            ironic.get_client(function (client) {
                resolve(client);
                ironic_client = client;
            });
        });
    }).then(function () {
        return new promise(function (resolve, reject) {
            ironic_client.create_node(JSON.stringify(node), function (ret) {
                console.info('\r\ncreate node:\r\n' + ret);
                if (ret && JSON.parse(ret).error_message) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(ret);
                    return;
                }
                resolve(ret);
                ironic_node = JSON.parse(ret);
            });
        });
    }).then(function () {
        port = { 'address': user_entry.port, 'node_uuid': ironic_node.uuid };
        console.info('\r\nCreate port:\r\n' + JSON.stringify(port));
        ironic_client.create_port(JSON.stringify(port), function (create_port) {
        });
    }).then(function () {
        return new promise(function (resolve, reject) {
            ironic_client.set_power_state(ironic_node.uuid, "on", function (pwr_state) {
                console.info('\r\npwr_state: on');
                if (pwr_state && JSON.parse(pwr_state).error_message) {
                    console.error(JSON.parse(pwr_state).error_message);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(pwr_state);
                    return;
                }
                resolve(pwr_state);
            });
        });
    }).then(function () {
        monorail.request_whitelist_set(user_entry.port, function (whitelist) {
            console.info('\r\nmonorail whitelist:\r\n' + JSON.stringify(whitelist));
            res.setHeader('Content-Type', 'application/json');
            res.end(whitelist);
            return;
        });
    });
};
/* 
* @api unregister: node
* @apiDescription unregister a node from Ironic
* @apiVersion 1.1.0
*/
module.exports.unregisterdel = function unregisterdel(req, res, next) {
    ironic.get_client(function (client) {
        client.delete_node(req.swagger.params.identifier.value, function (del_node) {
            if (del_node && JSON.parse(del_node).error_message) {
                console.info(del_node);
                res.setHeader('Content-Type', 'application/json');
                res.end(del_node);
                return;
            }
            monorail.request_node_get(req.swagger.params.identifier.value, function (onrack_node) {
                if (onrack_node && !JSON.parse(onrack_node).name) {
                    console.info(onrack_node);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(onrack_node);
                    return;
                }
                monorail.request_whitelist_del(JSON.parse(onrack_node).name, function (whitelist) {
                    res.setHeader('Content-Type', 'application/json');
                    var success = {
                        result: 'success'
                    };
                    res.end(JSON.stringify(success));
                });
            });
        });
    });
};

/* 
* @api config.json: modify shovel-monorail
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetmono = function configsetmono(req, res, next) {
    var fs = require('fs');
    var path = require('path');
    var is_changed = false;
    var appDir = path.dirname(require.main.filename);
    var file_content = fs.readFileSync(appDir + '/config.json');
    var output = JSON.parse(file_content);
    var content = output.monorail;
    var entry = req.body;
    //console.info(entry);
    for (var initem in Object.keys(entry)) {
        //console.info(Object.keys(entry)[initem]);
        for (var orgitem in Object.keys(content)) {
            //console.info(Object.keys(content)[orgitem]);
            if (Object.keys(entry)[initem] == Object.keys(content)[orgitem]) {
                var key = Object.keys(content)[orgitem];
                //console.info(content[Object.keys(content)[orgitem]]);
                content[key] = entry[key];
                is_changed = true;
            }
        }
    }
    //console.info(content);
    if (is_changed) {
        output.monorail = content;
        fs.writeFileSync(appDir + '/config.json', JSON.stringify(output));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
};

/* 
* @api config.json: modify shovel-keystone
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetkeystone = function configsetkeystone(req, res, next) {
    var fs = require('fs');
    var path = require('path');
    var is_changed = false;
    var appDir = path.dirname(require.main.filename);
    var file_content = fs.readFileSync(appDir + '/config.json');
    var output = JSON.parse(file_content);
    var content = output.keystone;
    var entry = req.body;
    //console.info(entry);
    for (var initem in Object.keys(entry)) {
        //console.info(Object.keys(entry)[initem]);
        for (var orgitem in Object.keys(content)) {
            //console.info(Object.keys(content)[orgitem]);
            if (Object.keys(entry)[initem] == Object.keys(content)[orgitem]) {
                var key = Object.keys(content)[orgitem];
                //console.info(content[Object.keys(content)[orgitem]]);
                content[key] = entry[key];
                is_changed = true;
            }
        }
    }
    //console.info(content);
    if (is_changed) {
        output.keystone = content;
        fs.writeFileSync(appDir + '/config.json', JSON.stringify(output));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
};

/* 
* @api config.json: modify shovel-ironic
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetironic = function configsetironic(req, res, next) {
    var fs = require('fs');
    var path = require('path');
    var is_changed = false;
    var appDir = path.dirname(require.main.filename);
    var file_content = fs.readFileSync(appDir + '/config.json');
    var output = JSON.parse(file_content);
    var content = output.ironic;
    var entry = req.body;
    //console.info(entry);
    for (var initem in Object.keys(entry)) {
        //console.info(Object.keys(entry)[initem]);
        for (var orgitem in Object.keys(content)) {
            //console.info(Object.keys(content)[orgitem]);
            if (Object.keys(entry)[initem] == Object.keys(content)[orgitem]) {
                var key = Object.keys(content)[orgitem];
                //console.info(content[Object.keys(content)[orgitem]]);
                content[key] = entry[key];
                is_changed = true;
            }
        }
    }
    //console.info(content);
    if (is_changed) {
        output.ironic = content;
        fs.writeFileSync(appDir + '/config.json', JSON.stringify(output));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
};

/* 
* @api config.json: modify shovel-glance
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetglance = function configsetglance(req, res, next) {
    var fs = require('fs');
    var path = require('path');
    var is_changed = false;
    var appDir = path.dirname(require.main.filename);
    var file_content = fs.readFileSync(appDir + '/config.json');
    var output = JSON.parse(file_content);
    var content = output.glance;
    var entry = req.body;
    //console.info(entry);
    for (var initem in Object.keys(entry)) {
        //console.info(Object.keys(entry)[initem]);
        for (var orgitem in Object.keys(content)) {
            //console.info(Object.keys(content)[orgitem]);
            if (Object.keys(entry)[initem] == Object.keys(content)[orgitem]) {
                var key = Object.keys(content)[orgitem];
                //console.info(content[Object.keys(content)[orgitem]]);
                content[key] = entry[key];
                is_changed = true;
            }
        }
    }
    //console.info(content);
    if (is_changed) {
        output.glance = content;
        fs.writeFileSync(appDir + '/config.json', JSON.stringify(output));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
};

/* 
* @api config.json: modify
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configset = function configset(req, res, next) {
    var fs = require('fs');
    var path = require('path');
    var is_changed = false;
    var appDir = path.dirname(require.main.filename);
    var file_content = fs.readFileSync(appDir + '/config.json');
    var content = JSON.parse(file_content);
    var entry = req.body;
    //console.info(entry);
    for (var initem in Object.keys(entry)) {
        //console.info(Object.keys(entry)[initem]);
        for (var orgitem in Object.keys(content)) {
            //console.info(Object.keys(content)[orgitem]);
            if (Object.keys(entry)[initem] == Object.keys(content)[orgitem]) {
                var key = Object.keys(content)[orgitem];
                //console.info(content[Object.keys(content)[orgitem]]);
                content[key] = entry[key];
                is_changed = true;
            }
        }
    }
    //console.info(content);
    if (is_changed) {
        fs.writeFileSync(appDir + '/config.json', JSON.stringify(content));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
};

/* 
* @api config.json: get
* @apiDescription get shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configget = function configget(req, res, next) {
    var fs = require('fs');
    var path = require('path');
    var appDir = path.dirname(require.main.filename);
    var file_content = fs.readFileSync(appDir + '/config.json');
    var content = JSON.parse(file_content);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
};

/*
* @api {get} /api/1.1/glance/images / GET /
* @apiDescription get glance images
*/
module.exports.imagesGet = function imagesGet(req, res, next) {
    glance.get_client(function (client) {
        client.get_images(function (result) {
            if (typeof result !== 'undefined') {
                res.setHeader('Content-Type', 'application/json');
                res.end(result);
            }
            else
                res.end();
        });
    });
};