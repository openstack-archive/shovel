var monorail = require('./../api/monorail/monorail');
var ironic = require('./../api/openstack/ironic');
var keystone = require('./../api/openstack/keystone');
var _ = require('underscore');
var config = require('./../../config.json');
var logger = require('./logger').Logger;

module.exports = Poller;
var ironicConfig = config.ironic;
function Poller(timeInterval) {
    this._timeInterval = timeInterval;
    this._ironicToken = null;
    this._timeObj = null;

    Poller.prototype.getToken = function () {
        var self = this;
        return keystone.authenticatePassword(ironicConfig.os_tenant_name,
            ironicConfig.os_username,ironicConfig.os_password).
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
        try{
            clearInterval(this.timeObj);
            this.timeObj = 0;
        }
        catch(err){
            logger.error(err);
        }
    };

    Poller.prototype.runPoller = function (ironic_nodes) {
        var self = this;
        for (var i in ironic_nodes) {
            logger.info('Running poller on :' + ironic_nodes[i].uuid + ':');
            self.searchIronic(ironic_nodes[i]);
        }
    };

    Poller.prototype.searchIronic = function (ironic_node) {
        var self = this;
        return ironic.get_node(self._ironicToken, ironic_node.uuid).
        then(function (node_data) {
            node_data = JSON.parse(node_data);
            if (node_data != undefined &&
                node_data.extra && node_data.extra.timer) {
                if (!node_data.extra.timer.stop) {
                    var timeNow = new Date();
                    var timeFinished = node_data.extra.timer.finish;
                    var _timeInterval = node_data.extra.timer.timeInterval;
                    var parsedDate = new Date(Date.parse(timeFinished));
                    var newDate = new Date(parsedDate.getTime() + _timeInterval);
                    if (newDate < timeNow) {
                        node_data.extra.timer.start = new Date().toJSON();
                        if (node_data.extra.timer.isDone) {
                            node_data.extra.timer.isDone = false;
                            self.updateInfo(self._ironicToken, node_data).
                            then(function (data) {
                                return self.patchData(node_data.uuid, JSON.stringify(data));
                            }).
                            then(function (result) {
                                return result;
                            });

                        }
                    }
                }
            }
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.getNodes = function (token) {
        return ironic.get_node_list(token).
        then(function (result) {
            return (JSON.parse(result).nodes);
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
            if (result != undefined) {
                return result.extra;
            }
            return null;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    };

    Poller.prototype.updateInfo = function (token, node_data) {
        var self = this;
        return this.getSeldata(node_data.extra.nodeid).
        then(function (result) {
            if (result != undefined) {
                var lastEvent = {};
                result = JSON.parse(result);
                if (result[0] && result[0].hasOwnProperty('sel')) {
                    if (node_data.extra.eventre != undefined) {
                        var arr = result[0].sel;
                        var events = _.where(arr, { event: node_data.extra.eventre });
                        if (events != undefined) {
                            logger.info(events);
                            node_data.extra.eventcnt = events.length;
                            lastEvent = events[events.length - 1];
                        }
                    }
                }
            }
            //update finish time
            node_data.extra.timer.finish = new Date().toJSON();
            node_data.extra.timer.isDone = true;
            node_data.extra.events = lastEvent;
            var data = [{ 'path': '/extra', 'value': node_data.extra, 'op': 'replace' }];
            return data;
        })
        .catch(function (err) {
            logger.error(err);
            return null;
        });
    }

    Poller.prototype.getSeldata = function (identifier) {
        return monorail.request_poller_get(identifier).
        then(function (pollers) {
            if (typeof pollers !== 'undefined') {
                pollers = JSON.parse(pollers);
                for (var i in pollers) {
                    if (pollers[i]['config']['command'] === 'sel') {
                        return monorail.request_poller_data_get(pollers[i]['id']).
                        then(function (data) {
                            return (data);
                        })
                        .catch(function (e) {
                            logger.error(e);
                        });
                    }
                }
                return (null);
            }
            else {
                return (null);
            }
        })
        .catch(function (err) {
            logger.error(err);
            return (null);
        });
    }

    Poller.prototype.startServer = function () {
        var self = this;
        try {
            self._timeObj = setInterval(function () {
                return self.getToken()
                .then(function (token) {
                    return self.getNodes(token);
                })
                .then(function (ironic_nodes) {
                    return self.runPoller(ironic_nodes);
                });
            }, self._timeInterval);
        }
        catch (err) {
            logger.error(err);
        };
    };
}