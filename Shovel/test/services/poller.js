// Copyright 2015, EMC, Inc.

var should = require('should');
var sinon = require('sinon');
var monorail = require('./../../lib/api/monorail/monorail');
var ironic = require('./../../lib/api/openstack/ironic');
var keystone = require('./../../lib/api/openstack/keystone');
var Promise = require('bluebird');
var client = require('./../../lib/api/client');
Promise.promisifyAll(client);
var _ = require('underscore');
var helper = require('./../helper');
//lib to be tested
var Poller;

describe('*****Shovel poller Class****', function () {

    var rackhdNode =[ { workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
    var identifier = '9a761508-4eee-4065-b47b-45c22dff54c2';
    var ironic_node_list = [ { uuid: "9a761508-4eee-4065-b47b-45c22dff54c2", extra: { name: "D51B-2U (dual 10G LoM)", eventre: "", nodeid: "564cefa014ee77be18e48efd", 
        timer: { start: "2015-11-30T21:14:11.753Z", finish: "2015-11-30T21:14:11.753Z", stop: false, isDone: true, timeInterval: 500 }, eventcnt: 0}}];
    var nodePollers = [{ config: { command: "sel" }, id: "564dd86285fb1e7c72721543" }];
    var _sel = { sel:[ { logId: "1", date: "12/03/2015", time: "08:54:11", sensorType: "Memory", sensorNumber: "#0x53", event: "Correctable ECC", value: "Asserted"} ] };    
    var keyToken = { access:{ token:{id:'123456'} } };
    var selEvent = { message: "There is no cache record for the poller with ID 564cf02a4978dadc187976f5.Perhaps it has not been run yet?" };
    var extraPatch = {extra: {name: "QuantaPlex T41S-2U", eventre: "Correctable ECC",nodeid: "565f3f3b4c95bce26f35c6a0", 
        timer: {timeInterval: 15000, start: "2015-12-03T17:38:20.569Z",finish: "2015-12-03T17:38:20.604Z",stop: false,isDone: true} } };    
    var patchedData = [{ 'path': '/extra', 'value': extraPatch.extra, 'op': 'replace' }];
    var pollerInstance;

    before('mask logger', function () {
        helper.maskLogger();
        Poller = require('./../../lib/services/poller');
    });
    after('restore logger', function () {
        helper.restoreLogger();
    });
    describe('Poller unit tests', function () {
        before('start Poller service', function () {
            pollerInstance = new Poller(5000);//timeInterval to 5s             
        });

        beforeEach('set up mocks', function () {
            sinon.stub(monorail, 'request_poller_get').returns(Promise.resolve(JSON.stringify(nodePollers)));
            sinon.stub(monorail, 'request_poller_data_get').returns(Promise.resolve(JSON.stringify(_sel)));
            sinon.stub(ironic, 'patch_node').returns(Promise.resolve(JSON.stringify(extraPatch)));
            sinon.stub(keystone, 'authenticatePassword').returns(Promise.resolve(JSON.stringify(keyToken)));
            sinon.stub(ironic, 'get_node_list').returns(Promise.resolve(JSON.stringify(ironic_node_list)));
            sinon.stub(ironic, 'get_node').returns(Promise.resolve(JSON.stringify(ironic_node_list[0])));
        });

        afterEach('teardown mocks', function () {
            monorail['request_poller_get'].restore();
            monorail['request_poller_data_get'].restore();
            ironic['patch_node'].restore();
            keystone['authenticatePassword'].restore();
            ironic['get_node_list'].restore();
            ironic['get_node'].restore();

        });
        
        it('Poller.prototype.searchIronic have property name, timer', function (done) {
            return pollerInstance.searchIronic(ironic_node_list[0]).
            then(function (result) {
                result.should.have.property('name');
                result.should.have.property('timer');
                done();
            });
        });

        it('start server should call get nodes once', function (done) {
            pollerInstance.startServer(0);
            pollerInstance.stopServer();
            var callback = sinon.spy();
            pollerInstance.getNodes(callback);
            callback.should.be.calledOnce;
            done();
        });

        it('start server should call runPoller once', function (done) {
            pollerInstance.startServer(0);
            pollerInstance.stopServer();
            var callback = sinon.spy();
            pollerInstance.runPoller(ironic_node_list, callback);
            callback.should.be.calledOnce;
            done();

        });

        it('start server should call searchIronic once', function (done) {
            pollerInstance.startServer(0);
            pollerInstance.stopServer();
            var callback = sinon.spy();
            pollerInstance.searchIronic(ironic_node_list[0], callback);
            callback.should.be.calledOnce;
            done();

        });

        it('pollerInstance.getSeldata() have property sensorNumber, event', function (done) {
            return pollerInstance.getSeldata(identifier).
            then(function (data) {
                var result = JSON.parse(data);
                result.should.have.property('sel');
                _.each(result[0], function (item) {
                    item.should.have.property('sensorNumber');
                    item.should.have.property('event');
                });
                done();
            })
            .catch(function (err) {
                throw (err);
            });
        });

        it('Poller.prototype.updateInfo have property path, value', function (done) {
            return pollerInstance.updateInfo(identifier, extraPatch).
            then(function (data) {
                var result = data;
                _.each(result, function (item) {
                    item.should.have.property('path');
                    item.should.have.property('value');
                });
                done();
            })
            .catch(function (err) {
                throw err;
            });
        });

        it('Poller.prototype.patchData should have property nodeid, timer', function (done) {
            return Poller.prototype.patchData('uuid', JSON.stringify(patchedData)).
            then(function (data) {
                data.should.have.property('nodeid');
                data.should.have.property('timer');
                done();
            })
            .catch(function (err) {
                throw (err);
                done();
            });
        });

        it('Poller.prototype.getNodes should have property uuid, extra', function (done) {
            return pollerInstance.getNodes().
            then(function (result) {
                _.each(result, function (item) {
                    item.should.have.property('uuid');
                    item.should.have.property('extra');
                });
                done();
            })
            .catch(function (err) {
                throw (err);
            });
        });

        it('Poller.prototype.getToken should return token 123456', function (done) {
            return pollerInstance.getToken().
            then(function (token) {
                token.should.be.equal('123456');
                done();
            })
            .catch(function (err) {
                throw err;
            });

        });

    });
    describe('client get/post returns error', function () {
        before('set up mocks', function () {
            //set client to return an error
            pollerInstance = new Poller(5000);//timeInterval to 5s
            var output = ({ error: 'error_message' });
            sinon.stub(client, 'GetAsync').returns(Promise.reject(output));
            sinon.stub(client, 'PostAsync').returns(Promise.reject(output));
            sinon.stub(client, 'PatchAsync').returns(Promise.reject(output));
            sinon.stub(client, 'PutAsync').returns(Promise.reject(output));
            sinon.stub(client, 'DeleteAsync').returns(Promise.reject(output));
        });
        after('teardown mocks', function () {
            client['GetAsync'].restore();
            client['PostAsync'].restore();
            client['PatchAsync'].restore();
            client['PutAsync'].restore();
            client['DeleteAsync'].restore();
        });
        it('poller.get_token return null', function (done) {
            return pollerInstance.getToken('123')
            .then(function (result) {
                (result === null).should.be.exactly(true);
                done();
            });
        });
        it('poller.getSeldata return null', function (done) {
            return pollerInstance.getSeldata('123')
            .then(function (result) {
                (result === null).should.be.exactly(true);
                done();
            });
        });
        it('poller.updateInfo return json obj with property : path', function (done) {
            return pollerInstance.updateInfo(identifier, extraPatch)
            .then(function (result) {
                result[0].should.have.property('path', '/extra');
                done();
            });
        });
        it('poller.patchData return null', function (done) {
            return pollerInstance.patchData(identifier, extraPatch)
            .then(function (result) {
                (result === null).should.be.exactly(true);
                done();
            });
        });
        it('poller.getNodes return null', function (done) {
            return pollerInstance.getNodes()
            .then(function (result) {
                (result === null).should.be.exactly(true);
                done();
            });
        });
    });
});
