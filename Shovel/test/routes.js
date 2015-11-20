var should = require('should');
var assert = require('assert');
var request = require('supertest');

describe('Routing', function () {
    var url = 'http://localhost:9005';


    //variable for neg testing
    var info = {
        'negative_testing': {
            'onrack_id': '123456789',
            'ironic_chassis_id': '123456789',
            'ironic_name': '123456789'
        },
        'positive_testing': {
            'onrack_id': '123456789',
            'ironic_chassis_id': '123456789',
            'ironic_name': '123456789'
        }
    }
    console.info('**********Variables used in this test**********');
    console.info(info);

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

    describe('negative testing:\r\n', function () {

        describe('shovel-catalogs/{identifier}', function () {
            it('in case of a wrong onrack id, response should include property: "message": "Could not find node with identifier ' + info.negative_testing.onrack_id + '"', function (done) {
                request(url)
                 .get('/api/1.1/catalogs/' + info.negative_testing.onrack_id)
                 // end handles the response
                 .end(function (err, res) {
                     if (err) {
                         throw err;
                     }
                     // this is should.js syntax, very clear
                     JSON.parse(res.text).should.have.property('message', 'Could not find node with identifier ' + info.negative_testing.onrack_id);
                     done();
                 });
            });
        });
        describe('shovel-nodes/{identifier}', function () {
            it('in case of a wrong onrack id, response should include property: "message": "Could not find node with identifier ' + info.negative_testing.onrack_id + '"', function (done) {
                request(url)
                 .get('/api/1.1/nodes/' + info.negative_testing.onrack_id)
                 // end handles the response
                 .end(function (err, res) {
                     if (err) {
                         throw err;
                     }
                     // this is should.js syntax, very clear
                     JSON.parse(res.text).should.have.property('message', 'Could not find node with identifier ' + info.negative_testing.onrack_id);
                     done();
                 });
            });
        });
        describe('shovel-ironic/chassis/{identifier}', function () {
            it('in case of a wrong onrack id, response should include property: error_message', function (done) {
                request(url)
                 .get('/api/1.1/ironic/chassis/' + info.negative_testing.ironic_chassis_id)
                 // end handles the response
                 .end(function (err, res) {
                     if (err) {
                         throw err;
                     }
                     // this is should.js syntax, very clear
                     JSON.parse(JSON.parse(res.text).error_message).should.have.property('faultstring');
                     done();
                 });
            });
        });
        describe('shovel-register', function () {
            it('in case of a wrong onrack id, response should include property: "message": "Could not find node with identifier ' + info.negative_testing.onrack_id + '"', function (done) {
                var body = {
                    "id": info.negative_testing.onrack_id,
                    "driver": "string",
                    "ipmihost": "string",
                    "ipmiusername": "string",
                    "ipmipasswd": "string",
                    "sshhost": "string",
                    "sshuser": "string",
                    "sshpswd": "string"
                }                
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
                     JSON.parse(res.text).should.have.property('message', 'Could not find node with identifier ' + info.negative_testing.onrack_id);
                     done();
                 });
            });
        });
        describe('shovel-unregister/{identifier}', function () {
            it('in case of a wrong ironic id, response should include property: error_message', function (done) {
                request(url)
                 .delete('/api/1.1/unregister/' + info.negative_testing.ironic_name)
                 // end handles the response
                 .end(function (err, res) {
                     if (err) {
                         throw err;
                     }
                     // this is should.js syntax, very clear
                     JSON.parse(JSON.parse(res.text).error_message).should.have.property('faultstring','Node '+ info.negative_testing.ironic_name +' could not be found.');
                     done();
                 });
            });
        });
    });

    describe('positive testing testing:\r\n', function () {

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
            it('response should have property \'nodes\'', function (done) {
                request(url)
                 .get('/api/1.1/ironic/nodes')
                 // end handles the response
                 .end(function (err, res) {
                     if (err) {
                         throw err;
                     }
                     // this is should.js syntax, very clear
                     JSON.parse(res.text).should.have.property('nodes');
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
    });
});