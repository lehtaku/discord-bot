const command = require('../config/commands');
const reply = require('../config/reply');

let createResultsEmbed = (client, message, results, args) => {
    // Get all results to field array to use in embed
    let fields = [];
    results.forEach((element) => {
        let field = {
            name: `${element.index}. ${element.title}`,
            value: `by ${element.uploader}`
        };
        fields.push(field);
    });

    // Create and send results embed
    message.channel.send({embed: {
            color: 6750054,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            description: reply.resultsForKeywords + args,
            fields: fields
        }});
};

let createControlsEmbed = (message) => {
    message.channel.send({embed: {
            color: 6750054,
            description: 'List of available commands (not case-sensitive), type:  ```?command```',
            fields: command.commands
        }});
};

module.exports.resultsEmbed = createResultsEmbed;
module.exports.controlsEmbed = createControlsEmbed;