// Copyright 2015, EMC, Inc.

var should = require('should');
var sinon = require('sinon');
var monorail = require('./../../lib/api/monorail/monorail');
var Promise = require('bluebird');
var _ = require('underscore');
var client = require('./../../lib/api/client');
var Promise = require('bluebird');
Promise.promisifyAll(client);

describe('****Monorail Lib****',function(){
    var rackhdNode = [{ workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
    var catalogSource = [{ source: 'dmi', data: {'Memory Device': [{ Size: '1 GB' }, { Size: '1 GB' }],
        'Processor Information': [{}, {}] }}, { source: 'lsscsi', data: [{ peripheralType: 'disk', size: '1GB' }] }];
    var rackhdNode =[ { workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
    var identifier = '123456789';

    describe('monorail nodeDiskSize get_node_memory_cpu', function () {
        describe('monorail get_node_memory_cpu', function () {
            afterEach('teardown mocks', function () {
                //monorail       
                monorail['get_catalog_data_by_source'].restore();
            });

            it('response should returns an integer with value equal to memory size 2000MB and cpus=2', function (done) {
                sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[0])));
                return monorail.get_node_memory_cpu(rackhdNode).
                then(function (result) {
                    result.cpus.should.be.exactly(2);
                    result.memory.should.be.exactly(2000);
                    done();
                });
            });
        });
        describe('nodeDiskSize', function () {
            beforeEach('set up mocks', function () {
            });

            afterEach('teardown mocks', function () {
                //monorail       
                monorail['get_catalog_data_by_source'].restore();
            });
            it('response should returns an integer with value equal to disk size 1GB', function (done) {
                //monorail
                sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[1])));
                return monorail.nodeDiskSize(rackhdNode).
                then(function (result) {
                    result.should.be.exactly(1);
                    done();
                });
            });

            it('response should returns an integer with value equal to 0', function (done) {
                //monorail
                sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify({})));
                return monorail.nodeDiskSize(rackhdNode).
                then(function (result) {
                    result.should.be.exactly(0);
                    done();
                });
            });
        });            
    });
    describe('lookupCatalog', function () {
        afterEach('teardown mocks', function () {
            //monorail       
            monorail['get_catalog_data_by_source'].restore();
        });
        it('lookupCatalog response should be equal to true', function (done) {
            sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[0])));
            return monorail.lookupCatalog(rackhdNode[0]).
            then(function (result) {
                JSON.parse(result).should.be.exactly(true);
                done();
            })
            .catch(function (err) {
                throw err;
            })
        });
        it('lookupCatalog response should be equal to fasle if catalog does not have property data', function (done) {
            sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify({})));
            return monorail.lookupCatalog(rackhdNode[0]).
            then(function (result) {
                JSON.parse(result).should.be.exactly(false);
                done();
            })
            .catch(function (err) {
                throw err;
            })
        });
    });
    describe('monorail with client get/post/patch/delete returns data', function () {
        beforeEach('set up mocks', function () {
            var output = ({ data: 'monorail service' });
            sinon.stub(client, 'GetAsync').returns(Promise.resolve(output));
            sinon.stub(client, 'PostAsync').returns(Promise.resolve(output));
            sinon.stub(client, 'PatchAsync').returns(Promise.resolve(output));
            sinon.stub(client, 'PutAsync').returns(Promise.resolve(output));
            sinon.stub(client, 'DeleteAsync').returns(Promise.resolve(output));
        });
        afterEach('teardown mocks', function () {
            client['GetAsync'].restore();
            client['PostAsync'].restore();
            client['PatchAsync'].restore();
            client['PutAsync'].restore();
            client['DeleteAsync'].restore();

        });

        it('monorail.request_nodes_get return data from monorail', function (done) {
            return monorail.request_nodes_get()
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.request_node_get return data from monorail', function (done) {
            return monorail.request_node_get('123')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.request_whitelist_set return data from monorail', function (done) {
            return monorail.request_whitelist_set('123')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.request_whitelist_del return data from monorail', function (done) {
            return monorail.request_whitelist_del('123')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.request_catalogs_get return data from monorail', function (done) {
            return monorail.request_catalogs_get('123')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.get_catalog_data_by_source return data from monorail', function (done) {
            return monorail.get_catalog_data_by_source('123', 'bmc')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.request_poller_get return data from monorail', function (done) {
            return monorail.request_poller_get('123')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
        it('monorail.request_poller_data_get return data from monorail', function (done) {
            return monorail.request_poller_data_get('123')
            .then(function (result) {
                result.should.have.property('data');
                done();
            });
        });
    });
});