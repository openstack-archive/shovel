var request = require('supertest');
var should = require('should');
var assert = require('assert');
var sinon = require('sinon');
var monorail = require('./../../lib/api/monorail/monorail');
var ironic = require('./../../lib/api/openstack/ironic');
var keystone = require('./../../lib/api/openstack/keystone');
var Promise = require('bluebird');
var Poller = require('./../../lib/services/poller');
var _ = require('underscore');

describe('Shovel poller unit testing', function () {

    var identifier = '9a761508-4eee-4065-b47b-45c22dff54c2';
    var ironic_node_list = [
        {
            uuid: "9a761508-4eee-4065-b47b-45c22dff54c2",
            extra: {
                name: "D51B-2U (dual 10G LoM)",
                eventre: "",
                nodeid: "564cefa014ee77be18e48efd",
                timer: {
                    start: "2015-11-30T21:14:11.753Z",
                    finish: "2015-11-30T21:14:11.772Z",
                    stop: false,
                    isDone: true,
                    timeInteval: 5000
                },
                eventcnt: 0                
            }
        }
    ]
    var nodePollers = [{
        config: {
            command: "sel"
        },
        id: "564dd86285fb1e7c72721543"
    }]
    var _sel = {
        sel:[
    {
        logId: "1",
        date: "12/03/2015",
        time: "08:54:11",
        sensorType: "Memory",
        sensorNumber: "#0x53",
        event: "Correctable ECC",
        value: "Asserted"
    }
        ]
    };    
    var keyToken = {
        access:{
            token:{id:'123456'}
        }
    };
    var selEvent = { message: "There is no cache record for the poller with ID 564cf02a4978dadc187976f5.Perhaps it has not been run yet?" };
    var extraPatch = {
        extra: {
            name: "QuantaPlex T41S-2U",
            eventre: "Correctable ECC",
            nodeid: "565f3f3b4c95bce26f35c6a0",
            timer: {
                timeInterval: 15000,
                start: "2015-12-03T17:38:20.569Z",
                finish: "2015-12-03T17:38:20.604Z",
                stop: false,
                isDone: true
            }
        }
    };    
    var patchedData = [{ 'path': '/extra', 'value': extraPatch.extra, 'op': 'replace' }];
    var pollerInstance;

    before('start HTTP server', function () {
        pollerInstance = new Poller(5000);//timeInterval to 5s        
    });

    beforeEach('set up mocks', function () {
        sinon.stub(monorail, 'request_poller_get').returns(Promise.resolve(JSON.stringify(nodePollers)));
        sinon.stub(monorail, 'request_poller_data_get').returns(Promise.resolve(JSON.stringify(_sel)));
        sinon.stub(ironic,'patch_node').returns(Promise.resolve(JSON.stringify(extraPatch)));
        sinon.stub(keystone,'authenticate').returns(Promise.resolve(JSON.stringify(keyToken)));
        sinon.stub(ironic,'get_node_list').returns(Promise.resolve(JSON.stringify(ironic_node_list)))
    });

    afterEach('teardown mocks', function () {
       monorail['request_poller_get'].restore();
       monorail['request_poller_data_get'].restore();
       ironic['patch_node'].restore();
       keystone['authenticate'].restore();
       ironic['get_node_list'].restore();

    });

    it('pollerInstance.getSeldata()', function (done) {
        return pollerInstance.getSeldata(identifier).
        then(function (data) {
            var result = JSON.parse(data);
            result.should.have.property('sel');
            _.each(result[0],function(item){
                console.info(item);
                item.should.have.property('sensorNumber');
                item.should.have.property('event');
            });
            done();
        }).
        catch (function(err){
            throw(err);
        });
    });

    it('Poller.prototype.updateInfo',function(done){
        return pollerInstance.updateInfo(identifier,extraPatch).
        then(function(data){
            var result = data;
            _.each(result,function(item){
                item.should.have.property('path');
                item.should.have.property('value');
            });
            done();
        }).
        catch(function(err){
            throw err;
        });        
    }); 
    
    it('Poller.prototype.patchData',function(done){
        return Poller.prototype.patchData('uuid',JSON.stringify(patchedData)).            
        then(function(data){
            data.should.have.property('nodeid');
            data.should.have.property('timer');
            done();
        }).
        catch(function(err){
            throw(err);
            done();
        });
    });

    it('Poller.prototype.getNodes',function(done){
        return pollerInstance.getNodes().
        then(function(result){
            _.each(result,function(item){
                item.should.have.property('uuid');
                item.should.have.property('extra');
            });
            done();
        }).
        catch(function(err){
            throw(err);
        });
    });

    it('Poller.prototype.getToken',function(done){
        return pollerInstance.getToken().
        then(function(token){
            token.should.be.equal('123456');
            done();
        }).
        catch(function(err){
            throw err;
        });
       
    });
});
