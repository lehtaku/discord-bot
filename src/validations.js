const config = require('../config/config');

var validateArgs = (message) => {
    return message.content
        .slice(config.prefix.length) // Remove prefix from message
        .trim() // Remove extra spaces if any
        .split(/ +/g); // Command will work if any extra spaces
};

var validateCommand = (args) => {
    return args
        .shift() // Remove one element from array and return it
        .toLowerCase();
};

module.exports.validateArgs = validateArgs;
module.exports.validateCommand = validateCommand;