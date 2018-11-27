const { Client } = require('discord.js');
const auth = require('../config/auth');
const config = require('../config/config');
const search = require('./videoSearch');

var initializeBot = () => {
    const client = new Client();

    client.on('ready', () => {
        console.log('Connected');
        console.log(`Logged in as ${client.user.tag}`);
        client.user.setActivity('Online');
    });

    client.on('error', (error) => console.log(error));
    client.on('warn', (error) => console.log(error));
    client.on('debug', (error) => console.log(error));

    client.on('message', message => {
        if (!message.content.startsWith(config.prefix) || message.author.bot) return;

        const args = message.content
            .slice(config.prefix.length) // Remove prefix from message
            .trim() // Remove extra spaces if any
            .split(/ +/g); // Command will work if any extra spaces
        const command = args
            .shift() // Remove one element from array and return it
            .toLowerCase();

        if (command === 'play') {
            search.getYtVideos(args, (error, results) => {
                if (error) {
                    console.log(error);
                }
                else {
                    // Get all results to field array to use in embed
                    var fields = [];
                    results.forEach((element) => {
                        var field = {
                            name: `${element.index}. ${element.title}`,
                            value: `by ${element.uploader}`
                        };
                        fields.push(field);
                    });

                    // Create and send embed
                    message.channel.send({embed: {
                        color: 6750054,
                        author: {
                            name: client.user.username,
                            icon_url: client.user.avatarURL
                        },
                        description: `Results for keyword(s): ${args}`,
                        fields: fields
                    }});
                }
            });
        }
    });

    client.login(auth.token);
};

module.exports.initializeBot = initializeBot;

