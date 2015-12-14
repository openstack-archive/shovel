var crypto = require('crypto')

//Import the config file
var fs = require('fs');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var file_content = fs.readFileSync(appDir + '/config.json');
var output = JSON.parse(file_content);
key = output.key;


var CryptoFuncs = {

    encrypt: function (text1,algorithm,input_encoding, out_encoding){
        var cipher = crypto.createCipher(algorithm, key);
        var cipher = crypto.createCipher(algorithm, key);
        cipher.update(text1, input_encoding, out_encoding);
        var encryptedPassword = cipher.final(out_encoding);
        //console.log("Key is", key);
        return encryptedPassword;

},
    decrypt: function (text1,algorithm,input_encoding, out_encoding){
        var decipher = crypto.createDecipher(algorithm, key);
        decipher.update(text1 , out_encoding, input_encoding);
        var decryptedPassword = decipher.final(input_encoding);

        return decryptedPassword;

    }
};

module.exports = Object.create(CryptoFuncs);