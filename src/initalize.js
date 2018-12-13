const { Client } = require('discord.js');
const config = require('../config/config');
const commands = require('./commands');
const dateTime = require('node-datetime');
const reply = require('../config/reply');
const validate = require('./validations');

let initializeBot = () => {
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
    client.on('debug', (error) => {
        let dt = dateTime.create().format('H:M:S d-m-Y');
        console.log(error + ' at ' + dt);
    });

    client.on('message', message => {
        if (!message.content.startsWith(config.prefix) || message.author.bot || (!message.guild)) return;

        const args = validate.validateArgs(message);
        const command = validate.validateCommand(args);

        if (validate.userInChannel(message)) {
            switch (command) {
                case 'play':
                    commands.selectSong(message, args);
                    break;
                case 'pause':
                    commands.pauseSong(message);
                    break;
                case 'resume':
                    commands.resumeSong(message);
                    break;
                case 'playlist':
                    commands.showPlaylist(message);
                    break;
                case 'repeat':
                    commands.repeatSong(message);
                    break;
                case 'skip':
                    commands.skipSong(message);
                    break;
                case 'join':
                    commands.joinChannel(message);
                    break;
                case 'leave':
                    commands.leaveChannel(message);
                    break;
                case 'help':
                    commands.showCommands(message);
                    break;
                default:
                    commands.unknownCommand(message);
            }
        } else {
            message.reply(reply.joinFirst);
        }
    });
};

module.exports.initializeBot = initializeBot;

