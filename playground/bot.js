const discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize discord bot
const client = new discord.Client();

client.on('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.username + ' - (' + client.id + ')');
});

/*bot.on('message', function (user, userId, channelId, message, event) {
    // Bot needs to know if it will execute a command
    // It will listen for messages that will start with '!'
    if (message.substring(0, 1) === '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            case 'greet':
                bot.sendMessage({
                    to: channelId,
                    message: 'Hello!'
                });
            break;
        }
    }
});*/


