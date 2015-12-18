var request = require('supertest');
var should = require('should');
var assert = require('assert');
var sinon = require('sinon');
var monorail = require('./../../lib/api/monorail/monorail');
var Promise = require('bluebird');
var _ = require('underscore');


var rackhdNode = [{ workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
var catalogSource = [{ source: 'dmi', data: {'Memory Device': [{ Size: '1 GB' }, { Size: '1 GB' }],
    'Processor Information': [{}, {}] }}, { source: 'lsscsi', data: [{ peripheralType: 'disk', size: '1GB' }] }];
var rackhdNode =[ { workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
var identifier = '123456789';

describe('monorail nodeDiskSize', function () {
    
    beforeEach('set up mocks', function () {
        //monorail
        sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[1])));
        
    });

    afterEach('teardown mocks', function () {
        //monorail       
        monorail['get_catalog_data_by_source'].restore();      
    });
        
    describe('nodeDiskSize', function () {
        it('response should returns an integer with value equal to disk size 1GB', function (done) {
            return monorail.nodeDiskSize(rackhdNode).
            then(function (result) {
                result.should.be.exactly(1);
                done();
            });
        });
    });
});

describe('monorail get_node_memory_cpu', function () {
    beforeEach('set up mocks', function () {
        //monorail
        sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[0])));

    });

    afterEach('teardown mocks', function () {
        //monorail       
        monorail['get_catalog_data_by_source'].restore();
    });

    describe('get_node_memory_cpu', function () {
        it('response should returns an integer with value equal to memory size 2000MB and cpus=2', function (done) {
            return monorail.get_node_memory_cpu(rackhdNode).
            then(function (result) {
                result.cpus.should.be.exactly(2);
                result.memory.should.be.exactly(2000);
                done();
            })
        });
    });    
});

describe('lookupCatalog true', function () {
    beforeEach('set up mocks', function () {
        //monorail
        sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[0])));

    });

    afterEach('teardown mocks', function () {
        //monorail       
        monorail['get_catalog_data_by_source'].restore();
    });

    describe('lookupCatalog', function () {
        it('lookupCatalog response should be equal to true', function (done) {
            return monorail.lookupCatalog(rackhdNode[0]).
            then(function (result) {
                console.log(result);
                JSON.parse(result).should.be.exactly(true);
                done();
            })
            .catch(function (err) {
                throw err;
            })
        });
    });
});

describe('lookupCatalog false', function () {
    beforeEach('set up mocks', function () {
        //monorail
        sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify({})));

    });

    afterEach('teardown mocks', function () {
        //monorail       
        monorail['get_catalog_data_by_source'].restore();
    });

    describe('lookupCatalog', function () {
        it('lookupCatalog response should be equal to fasle if catalog does not have property data', function (done) {
            return monorail.lookupCatalog(rackhdNode[0]).
            then(function (result) {
                console.log(result);
                JSON.parse(result).should.be.exactly(false);
                done();
            })
            .catch(function (err) {
                throw err;
            })
        });
    });



});