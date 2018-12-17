const config = require('../config/config');

let validateArgs = (message) => {
    return message.content
        .slice(config.prefix.length) // Remove prefix from message
        .trim() // Remove extra spaces if any
        .split(/ +/g); // Command will work if any extra spaces
};

let validateCommand = (args) => {
    return args
        .shift() // Remove one element from array and return it
        .toLowerCase();
};

let checkVolume = (input) => {
    return Number.isInteger(input) && input >= 0 || input <= 100;
};

let checkInput = (input) => {
    // Check if input value is correct
    return Number.isInteger(input) && input >= 0 && input <= 9;
};

let userInChannel = (message) => {
    // Check that user is in voice channel
    return !!message.member.voiceChannel;
};

module.exports = {
    validateArgs,
    validateCommand,
    checkVolume,
    checkInput,
    userInChannel
};