// Copyright 2015, EMC, Inc.
/*eslint-env node*/

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
module.exports.infoGet = function infoGet(req, res) {
    'use strict';
    var info = {
        name: 'shovel',
        description: 'rackHD-ironic agent',
        appversion: config.shovel.appver,
        apiversion: config.shovel.apiver
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(info));
};

/*
* @api {get} /api/1.1/ironic/drivers / GET /
* @apiDescription get ironic drivers
* @apiVersion 1.1.0
*/
module.exports.driversGet = function driversGet(req, res) {
    'use strict';
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_driver_list(token);
    }).
    then(function (result) {
        res.status(ironic.getStatus());
        res.setHeader('Content-Type', 'application/json');
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/ironic/nodes / GET /
* @apiDescription get ironic nodes
* @apiVersion 1.1.0
*/
module.exports.ironicnodesGet = function ironicnodesGet(req, res) {
    'use strict';
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_node_list(token);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(ironic.getStatus());
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/ironic/chassis / GET /
* @apiDescription get ironic chassis
* @apiVersion 1.1.0
*/
module.exports.ironicchassisGet = function ironicchassisGet(req, res) {
    'use strict';
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_chassis_by_id(token, req.swagger.params.identifier.value);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(ironic.getStatus());
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/ironic/nodes / GET /
* @apiDescription get ironic node
* @apiVersion 1.1.0
*/
module.exports.ironicnodeGet = function ironicnodeGet(req, res) {
    'use strict';
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        return ironic.get_node(token, req.swagger.params.identifier.value);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(ironic.getStatus());
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {patch} /api/1.1/ironic/node/identifier / PATCH /
* @apiDescription patch ironic node info
* @apiVersion 1.1.0
*/
module.exports.ironicnodePatch = function ironicnodePatch(req, res) {
    'use strict';
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        token = JSON.parse(token).access.token.id;
        var data = JSON.stringify(req.body);
        return ironic.patch_node(token, req.swagger.params.identifier.value, data);
    }).
    then(function (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(ironic.getStatus());
        res.end(result);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/catalogs/identifier / GET /
* @apiDescription get catalogs
* @apiVersion 1.1.0
*/
module.exports.catalogsGet = function catalogsGet(req, res) {
    'use strict';
    return monorail.request_catalogs_get(req.swagger.params.identifier.value).
    then(function (catalogs) {
        res.setHeader('Content-Type', 'application/json');
        res.status(monorail.getStatus());
        res.end(catalogs);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/catalogs/identifier / GET /
* @apiDescription get catalogs by source
* @apiVersion 1.1.0
*/
module.exports.catalogsbysourceGet = function catalogsbysourceGet(req, res) {
    'use strict';
    return monorail.get_catalog_data_by_source(req.swagger.params.identifier.value,
        req.swagger.params.source.value).
    then(function (catalogs) {
        res.setHeader('Content-Type', 'application/json');
        res.status(monorail.getStatus());
        res.end(catalogs);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/nodes/identifier / GET /
* @apiDescription get specific node by id
* @apiVersion 1.1.0
*/
module.exports.nodeGet = function nodeGet(req, res) {
    'use strict';
    return monorail.request_node_get(req.swagger.params.identifier.value).
    then(function (node) {
        res.setHeader('Content-Type', 'application/json');
        res.status(monorail.getStatus());
        res.end(node);
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/nodes / GET /
* @apiDescription get list of monorail nodes
* @apiVersion 1.1.0
*/
module.exports.nodesGet = function nodesGet(req, res) {
    'use strict';
    return monorail.request_nodes_get().
    then(function (nodes) {
        Promise.filter(JSON.parse(nodes), function (node) {
            return monorail.lookupCatalog(node);
        })
       .then(function (discoveredNodes) {
           res.setHeader('Content-Type', 'application/json');
           res.status(monorail.getStatus());
           res.end(JSON.stringify(discoveredNodes));
       });
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
};

/*
* @api {get} /api/1.1/nodes/identifier/sel / GET /
* @apiDescription get specific node by id
* @apiVersion 1.1.0
*/
module.exports.getSeldata = function getSeldata(req, res,next) {
    'use strict';
    return monorail.request_poller_get(req.swagger.params.identifier.value).
    then(function (pollers) {
        pollers = JSON.parse(pollers);
        return Promise.filter(pollers, function (poller) {
            return poller.config.command === 'sel';
        })
        .then(function (sel) {
            if (sel.length > 0) {
                return monorail.request_poller_data_get(sel[0].id)
                .then(function (data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(monorail.getStatus());
                    res.end(data);
                });
            }
            next();
        });
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api register: node
* @apiDescription register a node in Ironic
* @apiVersion 1.1.0
*/
module.exports.registerpost = function registerpost(req, res) {
    'use strict';
    var localGb, ironicToken, ironicNode, extra, port, propreties, node, info, userEntry;
    //init
    extra = port = propreties = node = info = {};
    userEntry = req.body;
    if (userEntry.driver === 'pxe_ipmitool') {
        info = {
            ipmi_address: userEntry.ipmihost,
            ipmi_username: userEntry.ipmiuser,
            ipmi_password: userEntry.ipmipass,
            deploy_kernel: userEntry.kernel,
            deploy_ramdisk: userEntry.ramdisk
        };
    } else if (userEntry.driver === 'pxe_ssh') {
        info = {
            ssh_address: userEntry.sshhost,
            ssh_username: userEntry.sshuser,
            ssh_password: userEntry.sshpass,
            ssh_port: userEntry.sshport,
            deploy_kernel: userEntry.kernel,
            deploy_ramdisk: userEntry.ramdisk
        };
    } else {
        info = {};
    }

    /* Fill in the extra meta data with some failover and event data */
    extra = {
        nodeid: userEntry.uuid,
        name: userEntry.name,
        lsevents: { time: 0 },
        eventcnt: 0,
        timer: {}
    };
    if (typeof userEntry.failovernode !== 'undefined') {
        extra.failover = userEntry.failovernode;
    }
    if (typeof userEntry.eventre !== 'undefined') {
        extra.eventre = userEntry.eventre;
    }

    localGb = 0.0;
    return monorail.request_node_get(userEntry.uuid).
    then(function (result) {
        if (!JSON.parse(result).hasOwnProperty('name')) {
            var error = { error_message: { message: 'failed to find required node in RackHD' } };
            logger.error(error);
            throw error;
        }
        ironicNode = JSON.parse(result);
        return monorail.nodeDiskSize(ironicNode)
        .catch(function (err) {
            var error = { error_message: { message: 'failed to get compute node Disk Size' } };
            logger.error(err);
            throw error;

        });
    }).then(function (localDisk) {
        localGb = localDisk;
        return monorail.getNodeMemoryCpu(ironicNode)
        .catch(function (err) {
            var error = { error_message: { message: 'failed to get compute node memory size' } };
            logger.error(err);
            throw error;
        });
    }).then(function (dmiData) {
        if (localGb === 0 || dmiData.cpus === 0 || dmiData.memory === 0) {
            var error = {
                error_message: {
                    message: 'failed to get compute node data',
                    nodeDisk: localGb,
                    memorySize: dmiData.memory,
                    cpuCount: dmiData.cpus
                }
            };
            throw error;
        }
        propreties = {
            cpus: dmiData.cpus,
            memory_mb: dmiData.memory,
            local_gb: localGb
        };
        node = {
            name: userEntry.uuid,
            driver: userEntry.driver,
            driver_info: info,
            properties: propreties,
            extra: extra
        };
        return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
            ironicConfig.os_password);
    }).
    then(function (token) {
        ironicToken = JSON.parse(token).access.token.id;
        return ironic.create_node(ironicToken, JSON.stringify(node));
    }).
    then(function (ret) {
        logger.debug('\r\ncreate node:\r\n' + ret);
        if (ret && JSON.parse(ret).error_message) {
            throw JSON.parse(ret);
        }
        ironicNode = JSON.parse(ret);
        port = { address: userEntry.port, node_uuid: ironicNode.uuid };
        return ironic.create_port(ironicToken, JSON.stringify(port));
    }).
    then(function (createPort) {
        if (createPort && JSON.parse(createPort).error_message) {
            throw JSON.parse(createPort);
        }
        logger.info('\r\nCreate port:\r\n' + JSON.stringify(createPort));
        return ironic.set_power_state(ironicToken, ironicNode.uuid, 'on');
    }).
    then(function (pwrState) {
        logger.info('\r\npwrState: on');
        if (pwrState && JSON.parse(pwrState).error_message) {
            throw JSON.parse(pwrState);
        }
    }).then(function () {
        var timer = {};
        timer.start = new Date().toJSON();
        timer.finish = new Date().toJSON();
        timer.stop = false;
        timer.timeInterval = 15000;
        timer.isDone = true;
        var data = [{ path: '/extra/timer', value: timer, op: 'replace' }];
        return ironic.patch_node(ironicToken, ironicNode.uuid, JSON.stringify(data));
    }).
    then(function (result) {
        logger.info('\r\patched node:\r\n' + result);
    }).
    then(function () {
        _.each(ironicNode.identifiers, function (mac) {
            return monorail.request_whitelist_set(mac)
            .then(function (whitelist) {
                logger.info('\r\nmonorail whitelist:\r\n' + JSON.stringify(whitelist));
            });
        });
    })
    .then(function () {
        res.setHeader('Content-Type', 'application/json');
        var success = {
            result: 'success'
        };
        res.end(JSON.stringify(success));
    })
    .catch(function (err) {
        logger.error({ message: err, path: req.url });
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.end(JSON.stringify(err));
    });
};
/*
* @api unregister: node
* @apiDescription unregister a node from Ironic
* @apiVersion 1.1.0
*/
module.exports.unregisterdel = function unregisterdel(req, res) {
    'use strict';
    var ironicToken;
    return keystone.authenticatePassword(ironicConfig.os_tenant_name, ironicConfig.os_username,
        ironicConfig.os_password).
    then(function (token) {
        ironicToken = JSON.parse(token).access.token.id;
        return ironic.delete_node(ironicToken, req.swagger.params.identifier.value);
    })
    .then(function (delNode) {
        if (delNode && JSON.parse(delNode).error_message) {
            throw delNode;
        } else {
            logger.info('ironicNode: ' +
                req.swagger.params.identifier.value +
                ' is been deleted susccessfully');
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
        res.status(500);
        res.end(JSON.stringify(err));
    });
};

/*
* @api config.json: modify shovel-monorail
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetmono = function configsetmono(req, res) {
    'use strict';
    res.setHeader('content-type', 'text/plain');
    if (setConfig('monorail', req.body)) {
        res.end('success');
    } else {
        res.status(500);
        res.end('failed to update monorail config');
    }
};

/*
* @api config.json: modify shovel-keystone
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetkeystone = function configsetkeystone(req, res) {
    'use strict';
    res.setHeader('content-type', 'text/plain');
    if (setConfig('keystone', req.body)) {
        res.end('success');
    } else {
        res.status(500);
        res.end('failed to update keystone config');
    }
};

/*
* @api config.json: modify shovel-ironic
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetironic = function configsetironic(req, res) {
    'use strict';
    res.setHeader('content-type', 'text/plain');
    if (req.body.hasOwnProperty('os_password')) {
        var password = req.body.os_password;
        //replace password with encrypted value
        try {
            req.body.os_password = encryption.encrypt(password);
        } catch (err) {
            logger.error(err);
            res.end('failed to update ironic config');
        }
    }
    if (setConfig('ironic', req.body)) {
        res.end('success');
    } else {
        res.status(500);
        res.end('failed to update ironic config');
    }
};

/*
* @api config.json: modify shovel-glance
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configsetglance = function configsetglance(req, res) {
    'use strict';
    res.setHeader('content-type', 'text/plain');
    if (req.body.hasOwnProperty('os_password')) {
        var password = req.body.os_password;
        //replace password with encrypted value
        try {
            req.body.os_password = encryption.encrypt(password);
        } catch (err) {
            logger.error(err);
            res.end('failed to update ironic config');
        }
    }
    if (setConfig('glance', req.body)) {
        res.end('success');
    } else {
        res.status(500);
        res.end('failed to update glance config');
    }
};

/*
* @api config.json: modify
* @apiDescription modify shovel config.json file and restart the server
* @apiVersion 1.1.0
*/
module.exports.configset = function configset(req, res) {
    'use strict';
    res.setHeader('content-type', 'text/plain');
    if (setConfig('shovel', req.body) === true) {
        res.end('success');
    } else {
        res.status(500);
        res.end('failed to update shovel config');
    }
};

function setConfig(keyValue, entry) {
    'use strict';
    var filename = 'config.json';
    jsonfile.readFile(filename, function (error, output) {
        try {
            var content = keyValue === null ? output : output[keyValue];
            var filteredList = _.pick(content, Object.keys(entry));
            _.each(Object.keys(filteredList), function (key) {
                content[key] = entry[key];

            });
            output[keyValue] = content;
            jsonfile.writeFile(filename, output, { spaces: 2 }, function () {
                logger.debug(content);
            });
        } catch (err) {
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
module.exports.configget = function configget(req, res) {
    'use strict';
    var filename = 'config.json';
    jsonfile.readFile(filename, function (error,content) {
        try {
            delete content.key;
            if (content.ironic.hasOwnProperty('os_password')) {
                content.ironic.os_password = '[REDACTED]';
            }
            if (content.glance.hasOwnProperty('os_password')) {
                content.glance.os_password = '[REDACTED]';
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(content));
        } catch (err) {
            logger.error(err);
            res.setHeader('content-type', 'text/plain');
            res.status(500);
            res.end('failed to get config');
        }
    });
};

/*
* @api {get} /api/1.1/glance/images / GET /
* @apiDescription get glance images
*/
module.exports.imagesGet = function imagesGet(req, res) {
    'use strict';
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
        res.status(500);
        res.end(JSON.stringify(err));
    });
};
/*
* @api {post} /api/1.1/deployOS/identifier / POST /
* @apiDescription deploy OS to specific node
*/
module.exports.deployOS = function deployOS(req, res) {
    'use strict';
    res.setHeader('Content-Type', 'application/json');
    return monorail.runWorkFlow(req.swagger.params.identifier.value,
    req.body.name,req.body)
    .then(function(result) {
        res.status(monorail.getStatus());
        res.end(result);
    })
    .catch(function(err) {
        res.status(500);
        res.end(JSON.stringify(err));
    });
};
/*
* @api {get} /api/1.1/workflow-status/identifier / GET /
* @apiDescription Get status of an active worflow running on a node in rackHD
*/
module.exports.workflowStatus = function workflowStatus(req,res) {
    'use strict';
    res.setHeader('Content-Type', 'application/json');
    return monorail.getWorkFlowActive(req.swagger.params.identifier.value)
    .then(function(data) {
        res.status(monorail.getStatus());
        if (monorail.getStatus() === 200 && data) {
            res.end(JSON.stringify({jobStatus:'Running'}));
        } else {
            res.end(JSON.stringify({jobStatus:'Currently there is no job running on this node'}));
        }
    })
    .catch(function(err) {
        res.status(500);
        res.end(JSON.stringify(err));
    });
};
/*
* @api {put} /api/1.1/uploadFiles/filename / PUT /
* @apiDescription uploaded ansible playbook in tar form and extract it
*/
//Code for tar file uploads
// module.exports.uploadFiles = function uploadFiles(req, res) {
//     'use strict';
//     res.setHeader('content-type', 'text/plain');
//     var tar = require('tar');
//     var extractor = tar.Extract({path: 'files/extract'})
//     .on('error', function(err) {
//         logger.error(err);
//         res.status(500);
//         res.end('error');
//     })
//     .on('end', function() {
//         res.status(202);
//         res.end('success');
//     });
//     var stream = require('stream');
//     var bufferStream = new stream.PassThrough();
//     bufferStream.end(new Buffer(req.swagger.params.playbook.value.buffer));
//     bufferStream.pipe(extractor);
// };

/*
* @api {post} /api/1.1/runAnsible/{identifier} / POST /
* @apiDescription run uploaded ansible playbook in tar form and extract it
*/
module.exports.runAnsible = function runAnsible(req, res) {
    'use strict';
    res.setHeader('Content-Type', 'application/json');
    var ansibleTask = {
        friendlyName: req.body.name,
        injectableName: 'Task.Ansible.' + req.body.name,
        implementsTask: 'Task.Base.Ansible',
        options: {
            playbook: req.body.playbookPath,
            vars : req.body.vars
        },
        properties: { }
    };
    var ansibleWorkflow = {
        friendlyName: 'Graph ' + req.body.name,
        injectableName: 'Graph.Ansible.' + req.body.name,
        tasks : [
            {
                label: 'ansible-job',
                taskName: 'Task.Ansible.' + req.body.name
            }
        ]
    };
    return monorail.createTask(ansibleTask)
    .then(function() {
        return monorail.createWorkflow(ansibleWorkflow);
    })
    .then(function() {
        return monorail.runWorkFlow(req.swagger.params.identifier.value,
        'Graph.Ansible.' + req.body.name,null);
    })
    .then(function(result) {
        res.status(monorail.getStatus());
        res.end(result);
    })
    .catch(function(err) {
        res.status(500);
        res.end(JSON.stringify(err));
    });
};
