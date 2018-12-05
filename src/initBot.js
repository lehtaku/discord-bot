const { Client } = require('discord.js');
const config = require('../config/config');
const validations = require('./validations');
const commands = require('./commands');

var initializeBot = () => {
    // Create and login client
    const client = new Client();
    client.login(process.env.APP_TOKEN);

    client.on('ready', () => {
        console.log('Connected');
        console.log(`Logged in as ${client.user.tag}`);
        client.user.setActivity('Ready to Rumble');
    });

    client.on('error', (error) => console.log(error));
    client.on('warn', (error) => console.log(error));
    client.on('debug', (error) => console.log(error));

    client.on('message', message => {
        if (!message.content.startsWith(config.prefix) || message.author.bot || (!message.guild)) return;

        const args = validations.validateArgs(message);
        const command = validations.validateCommand(args);

        switch (command) {
            case 'play':
                commands.selectSong(client, message, args);
                break;
            case 'pause':
                commands.pauseSong(message);
                break;
            case 'resume':
                commands.resumeSong(message);
                break;
            case 'repeat':
                commands.repeatSong(message);
                break;
/*            case 'skip':
                commands.skipSong(message);
                break;*/
            case 'leave':
                commands.leaveChannel(message);
                break;
        }
    });
};

module.exports.initializeBot = initializeBot;

