// Copyright 2015, EMC, Inc.

var request = require('supertest');
var should = require('should');
var sinon = require('sinon');
var ironic = require('./../../lib/api/openstack/ironic');
var client = require('./../../lib/api/client');
var Promise = require('bluebird');
Promise.promisifyAll(client);

describe('****Ironic Lib****', function () {
    beforeEach('set up mocks', function () {
        var output = ({ data: 'ironic service' });
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
    it('ironic.get_chassis return data from ironic', function (done) {
        return ironic.get_chassis('123')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('get_chassis_by_id return data from ironic', function (done) {
        return ironic.get_chassis_by_id('123', '123')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('get_chassis_by_id return data from ironic', function (done) {
        return ironic.get_node_list('123')
        .then(function (result) {
            result.should.have.property('data');
            done();

        });
    });
    it('get_node return data from ironic', function (done) {
        return ironic.get_node('123', '123')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('patch_node return data from ironic', function (done) {
        return ironic.patch_node('123', '123', {})
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('delete_node return data from ironic', function (done) {
        return ironic.delete_node('123', '123')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('get_port_list return data from ironic', function (done) {
        return ironic.get_port_list('123')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('get_port return data from ironic', function (done) {
        return ironic.get_port('123', 'identifier')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('set_power_state on return data from ironic', function (done) {
        return ironic.set_power_state('123', 'identifier', 'on')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('set_power_state off return data from ironic', function (done) {
        return ironic.set_power_state('123', 'identifier', 'off')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('set_power_state reboot return data from ironic', function (done) {
        return ironic.set_power_state('123', 'identifier', 'reboot')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
    it('get_driver_list return data from ironic', function (done) {
        return ironic.get_driver_list('123')
        .then(function (result) {
            result.should.have.property('data');
            done();
        });
    });
});