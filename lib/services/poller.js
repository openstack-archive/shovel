// Copyright 2015, EMC, Inc.

/*eslint-env node*/
var monorail = require('./../api/monorail/monorail');
var ironic = require('./../api/openstack/ironic');
var keystone = require('./../api/openstack/keystone');
var _ = require('underscore');
var config = require('./../../config.json');
var logger = require('./logger').Logger('info');
var Promise = require('bluebird');

module.exports = Poller;
var ironicConfig = config.ironic;
function Poller(timeInterval) {
    'use strict';
    this._timeInterval = timeInterval;
    this._ironicToken = null;
    this._timeObj = null;

    Poller.prototype.getToken = function () {
        var self = this;
        return keystone.authenticatePassword(ironicConfig.os_tenant_name,
            ironicConfig.os_username, ironicConfig.os_password).
        then(function (token) {
            self._ironicToken = token = JSON.parse(token).access.token.id;
            return token;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.stopServer = function () {
        try {
            clearInterval(this.timeObj);
            this.timeObj = 0;
        } catch (err) {
            logger.error(err);
        }
    };

    Poller.prototype.runPoller = function (ironicNodes) {
        var self = this;
        if (ironicNodes !== null) {
            for (var i = 0; i < ironicNodes.length; i++) {
                logger.info('Running poller on :' + ironicNodes[i].uuid + ':');
                self.searchIronic(ironicNodes[i]);
            }
        }
    };

    Poller.prototype.searchIronic = function (ironicNode) {
        var self = this;
        var nodeData = ironicNode;
        try {
            if (nodeData !== null &&
                nodeData.extra && nodeData.extra.timer) {
                if (!nodeData.extra.timer.stop) {
                    var timeNow = new Date();
                    var timeFinished = nodeData.extra.timer.finish;
                    var _timeInterval = nodeData.extra.timer.timeInterval;
                    var parsedDate = new Date(Date.parse(timeFinished));
                    var newDate = new Date(parsedDate.getTime() + _timeInterval);
                    if (newDate < timeNow) {
                        nodeData.extra.timer.start = new Date().toJSON();
                        if (nodeData.extra.timer.isDone) {
                            nodeData.extra.timer.isDone = false;
                            return self.updateInfo(self._ironicToken, nodeData).
                            then(function (data) {
                                return self.patchData(nodeData.uuid, JSON.stringify(data));
                            }).
                            then(function (result) {
                                return result;
                            });
                        }
                    }
                }
            }
            return Promise.resolve(null);
        } catch (err) {
            logger.error(err);
            return Promise.resolve(null);
        }
    };

    Poller.prototype.getNodes = function (token) {
        return ironic.get_node_list(token).
        then(function (result) {
            return JSON.parse(result).nodes;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.patchData = function (uuid, data) {
        var self = this;
        return ironic.patch_node(self._ironicToken, uuid, data).
        then(function (result) {
            result = JSON.parse(result);
            if (typeof result !== 'undefined') {
                return result.extra;
            }
            return null;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.updateInfo = function (token, nodeData) {
        return this.getSeldata(nodeData.extra.nodeid).
        then(function (result) {
            var lastEvent = {};
            if (result !== null) {
                result = JSON.parse(result);
                if (result[0] && result[0].hasOwnProperty('sel')) {
                    if (nodeData.extra.eventre !== null) {
                        var arr = result[0].sel;
                        var events = _.where(arr, { event: nodeData.extra.eventre });
                        if (events !== null) {
                            logger.info(events);
                            nodeData.extra.eventcnt = events.length;
                            lastEvent = events[events.length - 1];
                        }
                    }
                }
            }
            //update finish time
            nodeData.extra.timer.finish = new Date().toJSON();
            nodeData.extra.timer.isDone = true;
            nodeData.extra.events = lastEvent;
            var data = [
                {
                    path: '/extra',
                    value: nodeData.extra,
                    op: 'replace'
                }];
            return data;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.getSeldata = function (identifier) {
        return monorail.request_poller_get(identifier).
        then(function (pollers) {
            if (typeof pollers !== 'undefined') {
                pollers = JSON.parse(pollers);
                return Promise.filter(pollers, function (poller) {
                    return poller.config.command === 'sel';
                })
                .then(function (sel) {
                    if (sel.length > 0) {
                        return monorail.request_poller_data_get(sel[0].id)
                        .then(function (data) {
                            return data;
                        })
                        .catch(function (e) {
                            logger.error(e);
                        });
                    }
                });
            }
            return null;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.startServer = function () {
        var self = this;
        try {
            self._timeObj = setInterval(function () {
                return self.getToken()
                .then(function (token) {
                    return self.getNodes(token);
                })
                .then(function (ironicNodes) {
                    return self.runPoller(ironicNodes);
                });
            }, self._timeInterval);
        } catch (err) {
            logger.error(err);
        }
    };
}
