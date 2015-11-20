/* keystone authentication */
var config = require('./../../../config.json');
var client = require('./../../../client');

var KeystoneAuthentication = {
    authenticate: function( authType, ret ) {
        var request = { 
            host: config.keystone.httpHost, 
            path: '/' + config.keystone.version + '/tokens',
            port: config.keystone.httpPort,
            token: '',
            data: {},
            api: {},
            useragent: ''
        };
        
        if( authType == 'password' ) {    
            request.data = JSON.stringify(
                { 'auth':{ 
                    'tenantName':config.ironic.os_tenant_name, 
                    'passwordCredentials':{
                        'username':config.ironic.os_username, 
                        'password':config.ironic.os_password
                    }
                }
            });
        };
        
        if( authType == 'token' ) {
            request.data = JSON.stringify(
                { "auth":{
                    "tenantName":config.ironic.os_tenant_name,
                    "token":{
                        "id": config.ironic.os_auth_token
                    }
                }
            });
        };

        client.Post(request, function(body) { 
            ret(JSON.parse(body).access.token.id);
        });
    }
};
module.exports = Object.create(KeystoneAuthentication);