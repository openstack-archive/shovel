// Copyright 2015, EMC, Inc.

var should = require('should');
var client = require('./../../lib/api/client');
var Promise = require('bluebird');
var nock = require('nock');
Promise.promisifyAll(client);

describe('client with http requests', function () {
    var option = { host: 'localhost', port: 7070, path: '/api/', token: '', data: '{"auth":{"tenantName":"admin" }}', api: '' };
    it('get return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .get('/')
        .reply(200, { data: 'data from server' });
        return client.GetAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('get return data from targeted server with a token', function (done) {
        nock('http://localhost:7070/api')
        .get('/')
        .reply(200, { data: 'data from server' });
        option.token = '1234';
        return client.GetAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('get return data from targeted server', function (done) {
        return client.GetAsync(option)
        .catch(function (result) {
            result.should.have.property('errorMessage');
            done();
        });
    });

    it('post return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .post('/')
        .reply(200, { data: 'data from server' });

        return client.PostAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('post return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .post('/')
        .reply(200, { data: 'data from server' });
        option.token = '1234';
        return client.PostAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('post return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .post('/')
        .reply(200, { data: 'data from server' });
        return client.PostAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('post return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .post('/')
        .reply(200, { data: 'data from server' });
        option.token = '1234';
        return client.PostAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('post return data from targeted server', function (done) {
        return client.PostAsync(option)
        .catch(function (result) {
            result.should.have.property('errorMessage');
            done();
        });
    });

    it('delete return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .delete('/')
        .reply(200, { data: 'data from server' });

        return client.DeleteAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('delete return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .delete('/')
        .reply(200, { data: 'data from server' });
        option.token = '1234';
        return client.DeleteAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('delete return data from targeted server', function (done) {
        return client.DeleteAsync(option)
        .catch(function (result) {
            result.should.have.property('errorMessage');
            done();
        });
    });

    it('put return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .put('/')
        .reply(200, { data: 'data from server' });

        return client.PutAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('put return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .put('/')
        .reply(200, { data: 'data from server' });
        option.token = '1234';
        return client.PutAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('put return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .put('/')
        .reply(200, { data: 'data from server' });
        return client.PutAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('put return data from targeted server', function (done) {
        return client.PutAsync(option)
        .catch(function (result) {
            result.should.have.property('errorMessage');
            done();
        });
    });

    it('path return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .patch('/')
        .reply(200, { data: 'data from server' });
        return client.PatchAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('patch return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .patch('/')
        .reply(200, { data: 'data from server' });
        option.token = '1234';
        return client.PatchAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('patch return data from targeted server', function (done) {
        nock('http://localhost:7070/api')
        .patch('/')
        .reply(200, { data: 'data from server' });
        return client.PatchAsync(option)
        .then(function (result) {
            JSON.parse(result).should.have.property('data');
            done();
        });
    });
    it('patch return data from targeted server', function (done) {
        return client.PatchAsync(option)
        .catch(function (result) {
            result.should.have.property('errorMessage');
            done();
        });
    });
});