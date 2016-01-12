/*eslint-env node*/
var crypto = require('crypto');
var config = require('./../../config.json');

var CryptoFuncs = {
    encrypt: function (text) {
        'use strict';
        var cipher = crypto.createCipher('aes-256-cbc', config.key);
        cipher.update(text, 'utf8', 'base64');
        return cipher.final('base64');
    },
    decrypt: function (text) {
        'use strict';
        var decipher = crypto.createDecipher('aes-256-cbc', config.key);
        decipher.update(text, 'base64', 'utf8');
        return decipher.final('utf8');
    }
};

module.exports = Object.create(CryptoFuncs);
