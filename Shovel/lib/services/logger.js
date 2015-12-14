var winston = require('winston');

var logger = new (winston.Logger)({
    levels: {
        verbose: 4,
        debug: 3,
        info: 2,
        warn: 1,
        error: 0
    },
    colors: {
        verbose: 'cyan',
        debug: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red'
    }
}).add(winston.transports.Console, {
    level: 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
});

exports.Logger = logger;
