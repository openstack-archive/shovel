var request = require('supertest');
var should = require('should');
var assert = require('assert');
var sinon = require('sinon');
var monorail = require('./../../lib/api/monorail/monorail');
var ironic = require('./../../lib/api/openstack/ironic');
var keystone = require('./../../lib/api/openstack/keystone');
var Promise = require('bluebird');
var _ = require('underscore'); 
var helper = require('./../helper');
var url = 'http://localhost:9008';





var rackhdNode =[ { workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
var identifier = '9a761508-4eee-4065-b47b-45c22dff54c2';
var ironic_node_list = [ { uuid: "9a761508-4eee-4065-b47b-45c22dff54c2", extra: { name: "D51B-2U (dual 10G LoM)", eventre: "", nodeid: "564cefa014ee77be18e48efd", 
    timer: { start: "2015-11-30T21:14:11.753Z", finish: "2015-11-30T21:14:11.772Z", stop: false, isDone: true, timeInteval: 5000 }, eventcnt: 0 } }];
var nodePollers = [{ config: { command: "sel" }, id: "564dd86285fb1e7c72721543" }];
var _sel = { sel:[ { logId: "1", date: "12/03/2015", time: "08:54:11", sensorType: "Memory", sensorNumber: "#0x53", event: "Correctable ECC", value: "Asserted"} ] };    
var keyToken = { access:{ token:{id:'123456'} } };
var selEvent = { message: "There is no cache record for the poller with ID 564cf02a4978dadc187976f5.Perhaps it has not been run yet?" };
var extraPatch = {extra: {name: "QuantaPlex T41S-2U", eventre: "Correctable ECC",nodeid: "565f3f3b4c95bce26f35c6a0", 
    timer: {timeInterval: 15000, start: "2015-12-03T17:38:20.569Z",finish: "2015-12-03T17:38:20.604Z",stop: false,isDone: true} } };    
var patchedData = [{ 'path': '/extra', 'value': extraPatch.extra, 'op': 'replace' }];
var catalog = [{ node: "9a761508-4eee-4065-b47b-45c22dff54c2", source: "dmi", data: {} }];
var ironicDrivers = { drivers: [{ "hosts": ["localhost"], "name": "pxe_ssh", "links": [] }] };
var ironicChassis = { uuid: "1ac07daf-264e-4bd5-b0c4-d53095c217ac", link: [], extra: {}, created_at: "", "nodes": [], description: "ironic test chassis" };
var catalogSource = [{ source: 'dmi', data: {'Memory Device': [{ Size: '1 GB' }, { Size: '1 GB' }],
  'Processor Information': [{}, {}] }}, { source: 'lsscsi', data: [{ peripheralType: 'disk', size: '1GB' }] }];
    
describe('Shovel api unit testing', function () {
    var dmiData = { cpus: 1, memory: 1 };

    before('start HTTP server', function () {
        helper.startServer();
    });

    beforeEach('set up mocks', function () {
        //monorail
        sinon.stub(monorail, 'request_node_get').returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
        sinon.stub(monorail, 'request_nodes_get').returns(Promise.resolve(JSON.stringify(rackhdNode)));
        sinon.stub(monorail, 'lookupCatalog').returns(Promise.resolve(true));
        sinon.stub(monorail, 'request_catalogs_get').returns(Promise.resolve(JSON.stringify(catalog)));
        sinon.stub(monorail, 'request_poller_get').returns(Promise.resolve(JSON.stringify(nodePollers)));
        sinon.stub(monorail, 'request_poller_data_get').returns(Promise.resolve(JSON.stringify(_sel)));
        sinon.stub(monorail, 'request_whitelist_del').returns(Promise.resolve(''));
        sinon.stub(monorail, 'nodeDiskSize').returns(Promise.resolve(0));
        sinon.stub(monorail, 'get_node_memory_cpu').returns(Promise.resolve(dmiData));
        sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[0])));
        //keystone
        sinon.stub(keystone, 'authenticatePassword').returns(Promise.resolve(JSON.stringify(keyToken)));
        //ironic
        sinon.stub(ironic, 'get_driver_list').returns(Promise.resolve(JSON.stringify(ironicDrivers)));
        sinon.stub(ironic, 'get_chassis_by_id').returns(Promise.resolve(JSON.stringify(ironicChassis)));
        sinon.stub(ironic, 'patch_node').returns(Promise.resolve(JSON.stringify(extraPatch)));
        sinon.stub(ironic, 'get_node_list').returns(Promise.resolve(JSON.stringify(ironic_node_list)));
        sinon.stub(ironic, 'get_node').returns(Promise.resolve(JSON.stringify(ironic_node_list[0])));
        sinon.stub(ironic, 'delete_node').returns(Promise.resolve(''));
    });

    afterEach('teardown mocks', function () {
        //monorail
        monorail['request_node_get'].restore();
        monorail['request_nodes_get'].restore();
        monorail['request_poller_get'].restore();
        monorail['request_poller_data_get'].restore();
        monorail['request_catalogs_get'].restore();
        monorail['lookupCatalog'].restore();
        monorail['request_whitelist_del'].restore();
        monorail['nodeDiskSize'].restore();
        monorail['get_node_memory_cpu'].restore();
        monorail['get_catalog_data_by_source'].restore();
        //ironic
        ironic['patch_node'].restore();
        ironic['get_node_list'].restore();
        ironic['get_node'].restore();
        ironic['get_chassis_by_id'].restore();
        ironic['get_driver_list'].restore();
        ironic['delete_node'].restore();
        //keystone
        keystone['authenticatePassword'].restore();
    });

    after('stop HTTP server', function () {
        helper.stopServer();
    });

    describe('shovel-info', function () {
        it('response should have property \'name\': \'shovel\'', function (done) {
            request(url)
             .get('/api/1.1/info')
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('name', 'shovel');
                 done();
             });
        });
    });

    describe('shovel-catalogs/{identifier}', function () {
        it('in case of a correct rackHD id, response should include property node, source and data', function (done) {
            request(url)
             .get('/api/1.1/catalogs/' + identifier)
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text)[0].should.have.property('node', identifier);
                 JSON.parse(res.text)[0].should.have.property('data');
                 JSON.parse(res.text)[0].should.have.property('source');
                 done();
             });
        });
    });

    describe('shovel-catalogs/{identifier}/source', function () {
        it('in case of a correct rackHD id, response should include property source and data', function (done) {
            request(url)
             .get('/api/1.1/catalogs/' + identifier + '/dmi')
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('data');
                 JSON.parse(res.text).should.have.property('source');
                 done();
             });
        });
    });

    describe('shovel-nodes/{identifier}', function () {
        it('in case of correct id, response should include property: id,identifiers', function (done) {
            request(url)
             .get('/api/1.1/nodes/' + identifier)
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('id');
                 JSON.parse(res.text).should.have.property('identifiers');
                 done();
             });
        });
    });

    describe('shovel-ironic/chassis/{identifier}', function () {
        it('in case of a correct id, response should include property: uuid , description ', function (done) {
            request(url)
             .get('/api/1.1/ironic/chassis/' + identifier)
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('uuid');
                 JSON.parse(res.text).should.have.property('description');
                 done();
             });
        });
    });

    describe('shovel-ironic/drivers', function () {
        it('response should have property \'drivers\'', function (done) {
            request(url)
             .get('/api/1.1/ironic/drivers')
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('drivers');
                 done();
             });
        });
    });

    describe('shovel-ironic/nodes', function () {
        it('response should have property \'uuid\'', function (done) {
            request(url)
             .get('/api/1.1/ironic/nodes')
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text)[0].should.have.property('uuid');
                 done();
             });
        });
    });

    describe('shovel-ironic/nodes/identifier', function () {
        it('response should have property \'uuid\'', function (done) {
            request(url)
             .get('/api/1.1/ironic/nodes/' + identifier)
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('uuid');
                 done();
             });
        });
    });

    describe('shovel-ironic/patch', function () {
        it('response should have property nodeid timer', function (done) {
            var body = {};
            request(url)
             .patch('/api/1.1/ironic/node/' + identifier)
             .send(body)
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).extra.should.have.property('nodeid');
                 JSON.parse(res.text).extra.should.have.property('timer');
                 done();
             });
        });
    });

    describe('shovel-nodes', function () {
        it('response should have property "identifiers"', function (done) {
            request(url)
             .get('/api/1.1/nodes')
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 for (item in JSON.parse(res.text)) {
                     JSON.parse(res.text)[item].should.have.property('identifiers');
                 }
                 done();
             });
        });
    });

    describe('shovel-unregister/{identifier}', function () {
        it('if ironic id exist, response should include property: result: success', function (done) {
            request(url)
             .delete('/api/1.1/unregister/' + identifier)
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).result.should.be.equal('success');
                 done();
             });
        });
    });

    describe('shovel-getconfig', function () {
        it('', function (done) {
            request(url)
             .get('/api/1.1/shovel/config')
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('shovel');
                 JSON.parse(res.text).should.have.property('ironic');
                 JSON.parse(res.text).should.have.property('glance');
                 JSON.parse(res.text).should.have.property('keystone')
                 done();
             });
        });
    });

    describe('shovel-set ironic config', function () {
        it('', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/ironic/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200) //Status code
            // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });
    });

    describe('shovel-set monorail config', function () {
        it('', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/monorail/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200) //Status code
            // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });
    });

    describe('shovel-set glance config', function () {
        it('', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/glance/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200) //Status code
            // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });
    });

    describe('shovel-set keystone config', function () {
        it('', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/keystone/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200) //Status code
            // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });
    });
});

describe('Shovel api register', function () {
    var error_message = '{"error_message": "{\\"debuginfo\\": null, \\"faultcode\\": \\"Client\\", \\"faultstring\\": \\"A node with name 5668b42d8bee16a10989e4e4 already exists.\\"}"}';
    var body = { "id": identifier, "driver": "string", "ipmihost": "string", "ipmiusername": "string", "ipmipasswd": "string" };


    beforeEach('set up mocks', function () {
        //monorail
        //keystone
        sinon.stub(keystone, 'authenticatePassword').returns(Promise.resolve(JSON.stringify(keyToken)));
        //ironic
        sinon.stub(ironic, 'create_node').returns(Promise.resolve(error_message));
    });

    afterEach('teardown mocks', function () {
        //monorail
        monorail['nodeDiskSize'].restore();
        monorail['get_node_memory_cpu'].restore();
        monorail['request_node_get'].restore();
        //keystone
        keystone['authenticatePassword'].restore();
        //ironic
        ironic['create_node'].restore();

    });

    describe('shovel-resgister', function () {
        it('response in register should have property error_message when any of node info equal to 0 ', function (done) {
            sinon.stub(monorail, 'request_node_get').returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            sinon.stub(monorail, 'nodeDiskSize').returns(Promise.resolve(0));
            sinon.stub(monorail, 'get_node_memory_cpu').returns(Promise.resolve({ cpus: 0, memory: 0 }));
            
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(200) //Status code
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('error_message');

                 done();
             });
        });
        it('response in register should have property error_message create node return error in ironic', function (done) {
            sinon.stub(monorail, 'request_node_get').returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            sinon.stub(monorail, 'nodeDiskSize').returns(Promise.resolve(1));
            sinon.stub(monorail, 'get_node_memory_cpu').returns(Promise.resolve({ cpus: 1, memory: 1 }));
            
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(200) //Status code
             // end handles the response
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 // this is should.js syntax, very clear
                 JSON.parse(res.text).should.have.property('error_message');

                 done();
             });
        });
    });

});
