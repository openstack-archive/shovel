// Copyright 2015, EMC, Inc.

var request = require('supertest');
var should = require('should');
var sinon = require('sinon');
var monorail = require('./../../lib/api/monorail/monorail');
var ironic = require('./../../lib/api/openstack/ironic');
var keystone = require('./../../lib/api/openstack/keystone');
var glance = require('./../../lib/api/openstack/glance');
var Promise = require('bluebird');
var _ = require('underscore');
var helper = require('./../helper');
var url = 'http://localhost:9008';


describe('****SHOVEL API Interface****', function () {
    
    var rackhdNode = [{ workflows: [], autoDiscover: false, identifiers: ["2c:60:0c:83:f5:d1"], name: "2c:60:0c:83:f5:d1", sku: null, type: "compute", id: "5668b6ad8bee16a10989e4e5" }];
    var identifier = '9a761508-4eee-4065-b47b-45c22dff54c2';
    var ironic_node_list = [{ uuid: "9a761508-4eee-4065-b47b-45c22dff54c2", extra: { name: "D51B-2U (dual 10G LoM)", eventre: "", nodeid: "564cefa014ee77be18e48efd",
        timer: { start: "2015-11-30T21:14:11.753Z", finish: "2015-11-30T21:14:11.772Z", stop: false, isDone: true, timeInteval: 5000 }, eventcnt: 0 } } ];
    var nodePollers = [{ config: { command: "sel" }, id: "564dd86285fb1e7c72721543" }];
    var _sel = { sel: [{ logId: "1", date: "12/03/2015", time: "08:54:11", sensorType: "Memory", sensorNumber: "#0x53", event: "Correctable ECC", value: "Asserted" }] };
    var keyToken = { access: { token: { id: '123456' } } };
    var selEvent = { message: "There is no cache record for the poller with ID 564cf02a4978dadc187976f5.Perhaps it has not been run yet?" };
    var extraPatch = { extra: { name: "QuantaPlex T41S-2U", eventre: "Correctable ECC", nodeid: "565f3f3b4c95bce26f35c6a0",
        timer: { timeInterval: 15000, start: "2015-12-03T17:38:20.569Z", finish: "2015-12-03T17:38:20.604Z", stop: false, isDone: true } } };
    var patchedData = [{ 'path': '/extra', 'value': extraPatch.extra, 'op': 'replace' }];
    var catalog = [{ node: "9a761508-4eee-4065-b47b-45c22dff54c2", source: "dmi", data: {} }];
    var ironicDrivers = { drivers: [{ "hosts": ["localhost"], "name": "pxe_ssh", "links": [] }] };
    var ironicChassis = { uuid: "1ac07daf-264e-4bd5-b0c4-d53095c217ac", link: [], extra: {}, created_at: "", "nodes": [], description: "ironic test chassis" };
    var catalogSource = [{ source: 'dmi', data: { 'Memory Device': [{ Size: '1 GB' }, { Size: '1 GB' }], 'Processor Information': [{}, {}] } },
        { source: 'lsscsi', data: [{ peripheralType: 'disk', size: '1GB' }] }];
    var glanceImages = { "images": [{ "name": "ir-deploy-pxe_ssh.initramfs", "container_format": "ari", "disk_format": "ari" }] };

    before('start HTTP server', function () {
        helper.startServer();
    });
    after('stop HTTP server', function () {
        helper.stopServer();
    });
    describe('Shovel api unit testing', function () {
        var dmiData = { cpus: 1, memory: 1 };
        var getWorkflow;
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
            sinon.stub(monorail, 'getNodeMemoryCpu').returns(Promise.resolve(dmiData));
            sinon.stub(monorail, 'get_catalog_data_by_source').returns(Promise.resolve(JSON.stringify(catalogSource[0])));
            sinon.stub(monorail, 'runWorkFlow').returns(Promise.resolve('{"definition":{}}'));
            getWorkflow = sinon.stub(monorail,'getWorkFlowActive');
            sinon.stub(monorail, 'createTask').returns(Promise.resolve());
            sinon.stub(monorail, 'createWorkflow').returns(Promise.resolve());
            //glance
            sinon.stub(glance, 'get_images').returns(Promise.resolve(JSON.stringify(glanceImages)));
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
            monorail['getNodeMemoryCpu'].restore();
            monorail['get_catalog_data_by_source'].restore();
            monorail['runWorkFlow'].restore();
            monorail['getWorkFlowActive'].restore();
            monorail['createTask'].restore();
            monorail['createWorkflow'].restore();
            //ironic
            ironic['patch_node'].restore();
            ironic['get_node_list'].restore();
            ironic['get_node'].restore();
            ironic['get_chassis_by_id'].restore();
            ironic['get_driver_list'].restore();
            ironic['delete_node'].restore();
            //glance
            glance['get_images'].restore();
            //keystone
            keystone['authenticatePassword'].restore();
        });

        it('shovel-info response should have property \'name\': \'shovel\'', function (done) {
            request(url)
             .get('/api/1.1/info')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('name', 'shovel');
                 done();
             });
        });

        it('shovel-catalogs/{identifier} in case of a correct rackHD id, response should include property node, source and data', function (done) {
            request(url)
             .get('/api/1.1/catalogs/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text)[0].should.have.property('node', identifier);
                 JSON.parse(res.text)[0].should.have.property('data');
                 JSON.parse(res.text)[0].should.have.property('source');
                 done();
             });
        });

        it('shovel-catalogs/{identifier}/source in case of a correct rackHD id, response should include property source and data', function (done) {
            request(url)
             .get('/api/1.1/catalogs/' + identifier + '/dmi')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('data');
                 JSON.parse(res.text).should.have.property('source');
                 done();
             });
        });

        it('shovel-nodes/{identifier} in case of correct id, response should include property: id,identifiers', function (done) {
            request(url)
             .get('/api/1.1/nodes/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('id');
                 JSON.parse(res.text).should.have.property('identifiers');
                 done();
             });
        });

        it('shovel-ironic/chassis/{identifier} in case of a correct id, response should include property: uuid , description ', function (done) {
            request(url)
             .get('/api/1.1/ironic/chassis/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('uuid');
                 JSON.parse(res.text).should.have.property('description');
                 done();
             });
        });

        it('shovel-ironic/drivers response should have property \'drivers\'', function (done) {
            request(url)
             .get('/api/1.1/ironic/drivers')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('drivers');
                 done();
             });
        });

        it('shovel-ironic/nodes response should have property \'uuid\'', function (done) {
            request(url)
             .get('/api/1.1/ironic/nodes')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text)[0].should.have.property('uuid');
                 done();
             });
        });

        it('shovel-ironic/nodes/identifier response should have property \'uuid\'', function (done) {
            request(url)
             .get('/api/1.1/ironic/nodes/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('uuid');
                 done();
             });
        });

        it('shovel-ironic/patch response should have property nodeid timer', function (done) {
            var body = {};
            request(url)
             .patch('/api/1.1/ironic/node/' + identifier)
             .send(body)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).extra.should.have.property('nodeid');
                 JSON.parse(res.text).extra.should.have.property('timer');
                 done();
             });
        });

        it('shovel-nodes response should have property "identifiers"', function (done) {
            request(url)
             .get('/api/1.1/nodes')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 for (item in JSON.parse(res.text)) {
                     JSON.parse(res.text)[item].should.have.property('identifiers');
                 }
                 done();
             });
        });

        it('shovel-unregister/{identifier} if ironic id exist, response should include property: result: success', function (done) {
            request(url)
             .delete('/api/1.1/unregister/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).result.should.be.equal('success');
                 done();
             });
        });

        it('shovel-getconfig return success', function (done) {
            request(url)
             .get('/api/1.1/shovel/config')
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

        it('shovel-set ironic config return success', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/ironic/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });

        it('shovel-set monorail config return success', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/monorail/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });

        it('shovel-set glance config return success', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/glance/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });

        it('shovel-set keystone config return success', function (done) {
            var body = { httpHost: "localhost" };
            request(url)
             .post('/api/1.1/shovel/keystone/set-config')
             .send(body)
             .expect('Content-Type', /text/)
             .expect(200)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 res.text.should.be.exactly('success');
                 done();
             });
        });

        it('/api/1.1/glance/images should return property name', function (done) {
            request(url)
             .get('/api/1.1/glance/images')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).images[0].should.have.property('name');
                 done();
             });
        });
        it('/api/1.1/deployos/ should return property definition', function (done) {
            request(url)
             .post('/api/1.1/deployos/123')
             .send({"name": "Graph.InstallCentOS","options": { "defaults": {"obmServiceName": "ipmi-obm-service"}}})
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('definition');
                 done();
             });
        });
        it('/api/1.1/worflow-status/{identifier} should return property jobStatus', function (done) {
            getWorkflow.returns(Promise.resolve('{"node":"123", "_status": "valid"}'))
            request(url)
             .get('/api/1.1/worflow-status/123')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('jobStatus');
                 done();
             });
        });
        it('/api/1.1/run/ansible-playbook/{id} should return property definition', function (done) {
            request(url)
             .post('/api/1.1/run/ansible-playbook/123')
             .send({"name": "Graph.Example","options": {}})
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('definition');
                 done();
             });
        });
        it('/api/1.1/worflow-status/{identifier} should return property jobStatus even if no job is running', function (done) {
            getWorkflow.returns(Promise.resolve());
            request(url)
             .get('/api/1.1/worflow-status/123')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('jobStatus');
                 done();
             });
        });

    });

    describe('Shovel error handling test', function () {
        var client = require('./../../lib/api/client');
        Promise.promisifyAll(client);
        var body = { "id": identifier, "driver": "string", "ipmihost": "string", "ipmiusername": "string", "ipmipasswd": "string" };
        before('set up mocks', function () {
            //set client to return an error
            var output = ({ error: 'error_message' });
            sinon.stub(client, 'GetAsync').returns(Promise.reject(output));
            sinon.stub(client, 'PostAsync').returns(Promise.reject(output));
            sinon.stub(client, 'PutAsync').returns(Promise.reject(output));
        });
        after('teardown mocks', function () {
            client['GetAsync'].restore();
            client['PostAsync'].restore();
            client['PutAsync'].restore();
        });

        it('/api/1.1/nodes/identifier should return  error message', function (done) {
            request(url)
             .get('/api/1.1/nodes/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/nodes/catalogs/identifier should return  error message', function (done) {
            request(url)
             .get('/api/1.1/catalogs/' + identifier)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/catalogs/{identifier}/{source} should return  error message', function (done) {
            request(url)
             .get('/api/1.1/catalogs/123/bmc')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/nodes/{identifier} should return  error message', function (done) {
            request(url)
             .get('/api/1.1/nodes/123')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/nodes/123/sel should return  error message', function (done) {
            request(url)
             .get('/api/1.1/nodes/123/sel')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/ironic/nodes should return  error message', function (done) {
            request(url)
             .get('/api/1.1/ironic/nodes')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/ironic/chassis/123 should return  error message', function (done) {
            request(url)
             .get('/api/1.1/ironic/chassis/123')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/ironic/nodes/123 should return  error message', function (done) {
            request(url)
             .get('/api/1.1/ironic/nodes/123')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/ironic/drivers should return  error message', function (done) {
            request(url)
             .get('/api/1.1/ironic/drivers')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/glance/images should return  error message', function (done) {
            request(url)
             .get('/api/1.1/glance/images')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/register should have property error when cant connect to server', function (done) {
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/api/1.1/unregister/ should fail if no connection to server', function (done) {
            request(url)
             .delete('/api/1.1/unregister/123')
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/ironic/node/{identifier} should return  error message', function (done) {
            request(url)
             .patch('/api/1.1/ironic/node/123')
             .send([{}])
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/deployos/{identifier} should return  error message', function (done) {
            request(url)
             .post('/api/1.1/deployos/123')
             .send([{}])
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('/worflow-status/{identifier} should return  error message', function (done) {
            request(url)
             .get('/api/1.1/worflow-status/123')
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
        it('api/1.1/run/ansible-playbook/{id} should return  error message', function (done) {
            request(url)
             .post('/api/1.1/run/ansible-playbook/123')
             .send({name: 'runExample',vars: {},
             playbookPath: 'main.yml'
             })
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error');
                 done();
             });
        });
    });

    describe('Shovel api unit test for register', function () {
        var error_message = '{"error_message": "{\\"debuginfo\\": null, \\"faultcode\\": \\"Client\\", \\"faultstring\\": \\"some error\\"}"}';
        var body = { "id": identifier, "driver": "string", "ipmihost": "string", "ipmiusername": "string", "ipmipasswd": "string" };
        var getNode, diskSize, memoryCpu, ironicNodeCreate,
        ironicCreatePort, ironicPowerState, ironicPatch;
        beforeEach('set up mocks', function () {
            //monorail
            getNode = sinon.stub(monorail, 'request_node_get');
            diskSize = sinon.stub(monorail, 'nodeDiskSize');
            memoryCpu = sinon.stub(monorail, 'getNodeMemoryCpu');
            monorailWhiteList = sinon.stub(monorail,'request_whitelist_set');
            //keystone
            sinon.stub(keystone, 'authenticatePassword').returns(Promise.resolve(JSON.stringify(keyToken)));
            //ironic
            ironicNodeCreate = sinon.stub(ironic, 'create_node');
            ironicCreatePort = sinon.stub(ironic,'create_port');
            ironicPowerState = sinon.stub(ironic,'set_power_state');
            ironicPatch = sinon.stub(ironic, 'patch_node');
        });
        afterEach('teardown mocks', function () {
            //monorail
            monorail['nodeDiskSize'].restore();
            monorail['getNodeMemoryCpu'].restore();
            monorail['request_node_get'].restore();
            monorail['request_whitelist_set'].restore();
            //keystone
            keystone['authenticatePassword'].restore();
            //ironic
            ironic['create_node'].restore();
            ironic['create_port'].restore();
            ironic['set_power_state'].restore();
            ironic['patch_node'].restore();
        });
        it('response in register should have property error_message when node returns empty ', function (done) {
            getNode.returns(Promise.resolve('{}'));
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property error_message when diskSize has an exception ', function (done) {
            var output = {error_message: { message: 'failed to get compute node Disk Size' }};
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.reject(output));
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property error_message when any of node info equal to 0 ', function (done) {
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.resolve(0));
            memoryCpu.returns(Promise.resolve({ cpus: 0, memory: 0 }));

            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property error_message create node return error in ironic', function (done) {
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.resolve(1));
            memoryCpu.returns(Promise.resolve({ cpus: 1, memory: 1 }));
            ironicNodeCreate.returns(Promise.resolve(error_message));
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property error_message create port return error in ironic', function (done) {
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.resolve(1));
            memoryCpu.returns(Promise.resolve({ cpus: 1, memory: 1 }));
            ironicNodeCreate.returns(Promise.resolve(JSON.stringify(ironic_node_list[0])));
            ironicCreatePort.returns(Promise.resolve(error_message));
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property error_message set power state return error in ironic', function (done) {
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.resolve(1));
            memoryCpu.returns(Promise.resolve({ cpus: 1, memory: 1 }));
            ironicNodeCreate.returns(Promise.resolve(JSON.stringify(ironic_node_list[0])));
            ironicCreatePort.returns(Promise.resolve());
            ironicPowerState.returns(Promise.resolve(error_message));
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property error_message ironic patch node return error in ironic', function (done) {
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.resolve(1));
            memoryCpu.returns(Promise.resolve({ cpus: 1, memory: 1 }));
            ironicNodeCreate.returns(Promise.resolve(JSON.stringify(ironic_node_list[0])));
            ironicCreatePort.returns(Promise.resolve());
            ironicPowerState.returns(Promise.resolve());
            ironicPatch.returns(Promise.reject({error_message:'some error'}));
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(500)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('error_message');
                 done();
             });
        });
        it('response in register should have property result on success', function (done) {
            getNode.returns(Promise.resolve(JSON.stringify(rackhdNode[0])));
            diskSize.returns(Promise.resolve(1));
            memoryCpu.returns(Promise.resolve({ cpus: 1, memory: 1 }));
            ironicNodeCreate.returns(Promise.resolve(JSON.stringify(ironic_node_list[0])));
            ironicCreatePort.returns(Promise.resolve());
            ironicPowerState.returns(Promise.resolve());
            ironicPatch.returns(Promise.resolve());
            request(url)
             .post('/api/1.1/register')
             .send(body)
             .expect('Content-Type', /json/)
             .expect(200)
             .end(function (err, res) {
                 if (err) {
                     throw err;
                 }
                 JSON.parse(res.text).should.have.property('result');
                 done();
             });
        });
    });
});
