// Copyright 2015, EMC, Inc.

var winston = require('winston');

module.exports.Logger = function Logger(level) {
    var logger = new (winston.Logger)({
        levels: {
            verbose: 5,
            debug: 4,
            info: 3,
            warn: 2,
            error: 1,
            mask: 0
        },
        colors: {
            verbose: 'cyan',
            debug: 'blue',
            info: 'green',
            warn: 'yellow',
            error: 'red'
        }
    }).add(winston.transports.Console, {
        level: level,
        prettyPrint: true,
        colorize: true,
        silent: false,
        timestamp: true
    });
    return logger;
}