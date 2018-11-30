const { Client } = require('discord.js');
const auth = require('../config/auth');
const config = require('../config/config');
const validations = require('./validations');
const commands = require('./commands');

var initializeBot = () => {
    // Create and login client
    const client = new Client();
    client.login(auth.token);

    client.on('ready', () => {
        console.log('Connected');
        console.log(`Logged in as ${client.user.tag}`);
        client.user.setActivity('Online');
    });

    client.on('error', (error) => console.log(error));
    client.on('warn', (error) => console.log(error));
    client.on('debug', (error) => console.log(error));

    client.on('message', message => {
        if (!message.content.startsWith(config.prefix) || message.author.bot || (!message.guild)) return;

        const args = validations.validateArgs(message);
        const command = validations.validateCommand(args);

        if (command === 'play') {
            commands.selectSong(client, message, args);
        }

    });
};

module.exports.initializeBot = initializeBot;

