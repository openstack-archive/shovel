// Copyright 2015, EMC, Inc.

'use strict';

var url = require('url');
var monorail = require('./../lib/api/monorail/monorail');
var ironic = require('./../lib/api/openstack/ironic');
var config = require('./../config.json');
var glance = require('./../lib/api/openstack/glance');
var keystone = require('./../lib/api/openstack/keystone');
var logger = require('./../lib/services/logger').Logger('info');
var encryption = require('./../lib/services/encryption');
var jsonfile = require('jsonfile');
var _ = require('underscore');
var Promise = require('bluebird');
var ironicConfig = config.ironic;
var glanceConfig = config.glance;

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
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_driver_list(token);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/ironic/nodes / GET /
* @apiDescription get ironic nodes
* @apiVersion 1.1.0
*/
module.exports.ironicnodesGet = function ironicnodesGet(req, res, next) {
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_node_list(token);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/ironic/chassis / GET /
* @apiDescription get ironic chassis
* @apiVersion 1.1.0
*/
module.exports.ironicchassisGet = function ironicchassisGet(req, res, next) {
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_chassis_by_id(token, req.swagger.params.identifier.value);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/ironic/nodes / GET /
* @apiDescription get ironic node
* @apiVersion 1.1.0
*/
module.exports.ironicnodeGet = function ironicnodeGet(req, res, next) {
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_node(token, req.swagger.params.identifier.value);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {patch} /api/1.1/ironic/node/identifier / PATCH /
* @apiDescription patch ironic node info
* @apiVersion 1.1.0
*/
module.exports.ironicnodePatch = function ironicnodePatch(req, res, next) {
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        var data = JSON.stringify(req.body);
        return ironic.patch_node(token, req.swagger.params.identifier.value, data);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/catalogs/identifier / GET /
* @apiDescription get catalogs
* @apiVersion 1.1.0
*/
module.exports.catalogsGet = function catalogsGet(req, res, next) {
    return monorail.request_catalogs_get(req.swagger.params.identifier.value).
    then(function (catalogs) {
        res.setHeader('Content-Type', 'application/json');
        res.end(catalogs);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/catalogs/identifier / GET /
* @apiDescription get catalogs by source
* @apiVersion 1.1.0
*/
module.exports.catalogsbysourceGet = function catalogsbysourceGet(req, res, next) {
    return monorail.get_catalog_data_by_source(req.swagger.params.identifier.value,
        req.swagger.params.source.value).
    then(function (catalogs) {
        res.setHeader('Content-Type', 'application/json');
        res.end(catalogs);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/nodes/identifier / GET /
* @apiDescription get specific node by id
* @apiVersion 1.1.0
*/
module.exports.nodeGet = function nodeGet(req, res, next) {
    return monorail.request_node_get(req.swagger.params.identifier.value).
    then(function (node) {
        res.setHeader('Content-Type', 'application/json');
        res.end(node);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/nodes / GET /
* @apiDescription get list of monorail nodes
* @apiVersion 1.1.0
*/
module.exports.nodesGet = function nodesGet(req, res, next) {
    return monorail.request_nodes_get().
    then(function (nodes) {
        Promise.filter(JSON.parse(nodes), function (node) {
            return monorail.lookupCatalog(node);
        })
       .then(function (discoveredNodes) {
           res.setHeader('Content-Type', 'application/json');
           res.end(JSON.stringify(discoveredNodes));
       });
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/nodes/identifier/sel / GET /
* @apiDescription get specific node by id
* @apiVersion 1.1.0
*/
module.exports.getSeldata = function getSeldata(req, res, next) {
    return monorail.request_poller_get(req.swagger.params.identifier.value).
    then(function (pollers) {
        pollers = JSON.parse(pollers);
        for (var i in pollers) {
            if (pollers[i]['config']['command'] === 'sel') {
                return monorail.request_poller_data_get(pollers[i]['id']).
                then(function (data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(data);
                });
            }
        }
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
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
    var local_gb;
    var extra = {};
    var port = {}
    var ironicToken;
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
    extra = { 'nodeid': user_entry.uuid, 'name': user_entry.name, 'lsevents': { 'time': 0 }, 'eventcnt': 0, 'timer': {} };
    if (typeof user_entry.failovernode !== 'undefined') {
        extra['failover'] = user_entry.failovernode;
    }
    if (typeof user_entry.eventre !== 'undefined') {
        extra['eventre'] = user_entry.eventre;
    }

    local_gb = 0.0;
    return monorail.request_node_get(user_entry.uuid).
    then(function (result) {
        if (!JSON.parse(result).name) {
            var error = { error_message: { message: 'failed to find required node in RackHD' } };
            logger.error(err);
            throw error;
        }
        onrack_node = JSON.parse(result);
        return monorail.nodeDiskSize(onrack_node)
        .catch(function (err) {
            var error = { error_message: { message: 'failed to get compute node Disk Size' } };
            logger.error(err);
            throw error;

        });
    }).then(function (localDisk) {
        local_gb = localDisk;
        return monorail.get_node_memory_cpu(onrack_node)
        .catch(function (err) {
            var error = { error_message: { message: 'failed to get compute node memory size' } };
            logger.error(err);
            throw error;
        });
    }).then(function (dmiData) {
        if (local_gb == 0 || dmiData.cpus == 0 || dmiData.memory == 0) {
            var error = { error_message: { message: 'failed to get compute node data', nodeDisk: local_gb, memorySize: dmiData.memory, cpuCount: dmiData.cpus } };
            throw (error);
        }
        propreties = {
            'cpus': dmiData.cpus,
            'memory_mb': dmiData.memory,
            'local_gb': local_gb
        };
        node = {
            'name': user_entry.uuid,
            'driver': user_entry.driver,
            'driver_info': info,
            'properties': propreties,
            'extra': extra
        };
        return (keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
            ironicConfig.os_password));
    }).
    then(function (token) {
        ironicToken = JSON.parse(token).access.token.id;
        return ironic.create_node(ironicToken, JSON.stringify(node));
    }).
    then(function (ret) {
        logger.debug('\r\ncreate node:\r\n' + ret);
        if (ret && JSON.parse(ret).error_message) {
            throw (JSON.parse(ret));
        }
        ironic_node = JSON.parse(ret);
        port = { 'address': user_entry.port, 'node_uuid': ironic_node.uuid };
        return ironic.create_port(ironicToken, JSON.stringify(port));
    }).
    then(function (create_port) {
        logger.info('\r\nCreate port:\r\n' + JSON.stringify(create_port));
        return ironic.set_power_state(ironicToken, ironic_node.uuid, "on");
    }).
    then(function (pwr_state) {
        logger.info('\r\npwr_state: on');
        if (pwr_state && JSON.parse(pwr_state).error_message) {
            throw (JSON.parse(pwr_state));
        }
    }).then(function () {
        var timer = {};
        timer.start = new Date().toJSON();
        timer.finish = new Date().toJSON();
        timer.stop = false;
        timer.timeInterval = 15000;
        timer.isDone = true;
        var data = [{ 'path': '/extra/timer', 'value': timer, 'op': 'replace' }];
        return ironic.patch_node(ironicToken, ironic_node.uuid, JSON.stringify(data));
    }).
    then(function (result) {
        logger.info('\r\patched node:\r\n' + result);
    }).
    then(function () {
        _.each(onrack_node.identifiers, function (mac) {
            return monorail.request_whitelist_set(mac)
            .then(function (whitelist) {
                logger.info('\r\nmonorail whitelist:\r\n' + JSON.stringify(whitelist));
            });
        });
    })
    .then(function (whitelist) {
        res.setHeader('Content-Type', 'application/json');
        var success = {
            result: 'success'
        };
        res.end(JSON.stringify(success));
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};
/*
* @api unregister: node
* @apiDescription unregister a node from Ironic
* @apiVersion 1.1.0
*/
module.exports.unregisterdel = function unregisterdel(req, res, next) {
    var ironicToken;
    //TODO allow using name or ironic node uuid
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        ironicToken = JSON.parse(token).access.token.id;
        return ironic.delete_node(ironicToken, req.swagger.params.identifier.value);
    })
    .then(function (del_node) {
        if (del_node && JSON.parse(del_node).error_message) {
            throw (del_node);
        }
        else {
            logger.info('ironicNode: ' + req.swagger.params.identifier.value + ' is been deleted susccessfully');
            res.setHeader('Content-Type', 'application/json');
            var success = {
                result: 'success'
            };
            res.end(JSON.stringify(success));
            //remove macs from whitelist in rackHD
            return monorail.request_node_get(req.swagger.params.identifier.value)
            .then(function (node) {
                _.each(JSON.parse(node).identifiers, function (mac) {
                    return monorail.request_whitelist_del(mac);
                });
            });
        }
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api config.json: modify shovel-monorail
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetmono = function configsetmono(req, res, next) {
    res.setHeader('content-type', 'text/plain');
    if (setConfig('monorail', req.body)) {
        res.end('success');
    }
    else {
        res.end('failed to update monorail config');
    };
};

/*
* @api config.json: modify shovel-keystone
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetkeystone = function configsetkeystone(req, res, next) {
    res.setHeader('content-type', 'text/plain');
    if (setConfig('keystone', req.body)) {
        res.end('success');
    }
    else {
        res.end('failed to update keystone config');
    };
};

/*
* @api config.json: modify shovel-ironic
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetironic = function configsetironic(req, res, next) {
    res.setHeader('content-type', 'text/plain');
    if (req.body.hasOwnProperty('os_password')) {
        var password = req.body.os_password;
        //replace password with encrypted value
        try {
            req.body.os_password = encryption.encrypt(password);
        }
        catch (err) {
            logger.error(err);
            res.end('failed to update ironic config');
        }
    }
    if (setConfig('ironic', req.body)) {
        res.end('success');
    }
    else {
        res.end('failed to update ironic config');
    };
};

/*
* @api config.json: modify shovel-glance
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetglance = function configsetglance(req, res, next) {
    res.setHeader('content-type', 'text/plain');
    if (req.body.hasOwnProperty('os_password')) {
        var password = req.body.os_password;
        //replace password with encrypted value
        try {
            req.body.os_password = encryption.encrypt(password);
        }
        catch (err) {
            logger.error(err);
            res.end('failed to update ironic config');
        }
    }
    if (setConfig('glance', req.body)) {
        res.end('success');
    }
    else {
        res.end('failed to update glance config');
    };
};

/*
* @api config.json: modify
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configset = function configset(req, res, next) {
    res.setHeader('content-type', 'text/plain');
    if (setConfig('shovel', req.body) == true) {
        res.end('success');
    }
    else {
        res.end('failed to update shovel config');
    };
};

function setConfig(keyValue, entry) {
    var filename = 'config.json';
    jsonfile.readFile(filename, function (err, output) {
        try {
            var content = (keyValue == null) ? output : output[keyValue];
            var filteredList = _.pick(content, Object.keys(entry));
            _.each(Object.keys(filteredList), function (key) {
                content[key] = entry[key];

            });
            output[keyValue] = content;
            jsonfile.writeFile(filename, output, { spaces: 2 }, function (err) {
                logger.debug(content);
            });
        }
        catch (err) {
            logger.error(err);
            return false;
        }
    });
    return true;
}

/*
* @api config.json: get
* @apiDescription get shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configget = function configget(req, res, next) {
    var filename = 'config.json';
    jsonfile.readFile(filename, function (err, content) {
        try {
            delete content['key'];
            if (content.ironic.hasOwnProperty("os_password")) {
                content.ironic.os_password = '[REDACTED]';
            }
            if (content.glance.hasOwnProperty("os_password")) {
                content.glance.os_password = '[REDACTED]';
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(content));
        }
        catch (err) {
            logger.error(err);
            res.setHeader('content-type', 'text/plain');
            res.end('failed to get config');
        };
    });
};

/*
* @api {get} /api/1.1/glance/images / GET /
* @apiDescription get glance images
*/
module.exports.imagesGet = function imagesGet(req, res, next) {
    return keystone.authenticatePassword(glanceConfig.os_tenant_name, glanceConfig.os_username,
        glanceConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return glance.get_images(token);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};