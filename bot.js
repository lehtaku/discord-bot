const { Client, Attachment } = require('discord.js');
const auth = require('./auth');

// Initialize discord bot
const client = new Client();

client.on('ready', () => {
    console.log('Connected');
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', message => {
    if (message.content === '!rip') {
        const attachment = new Attachment('https://i.imgur.com/w3duR07.png');
        message.channel.send(attachment);
    }
});

client.login(auth.token);


