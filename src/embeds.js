const embed = require('../config/embeds');

let resultsEmbed = (message, results, args) => {
    // Get all results to field array to use in embed
    let fields = [];
    results.forEach((element) => {
        let field = {
            name: `${element.index}. ${element.title}`,
            value: embed.descriptions.uploadedBy + ' ' + element.uploader
        };
        fields.push(field);
    });
    successEmbed(message, embed.descriptions.resultsForKeywords + args, fields);
};

let playlistEmbed = (message, playlist) => {
    let fields = [];
    playlist.forEach((element) => {
        let field = {
            name: element.title,
            value: embed.descriptions.queuedBy + ' ' + element.queuedBy
        };
        fields.push(field);
    });
    fields.shift();
    successEmbed(message, embed.descriptions.currentPlaylist, fields);
};

let controlsEmbed = (message) => {
    successEmbed(message, embed.descriptions.availableCommands, embed.commands);
};

let successEmbed = (message, desc, fields) => {
    message.channel.send({embed: {
            color: embed.successColor,
            description: desc,
            fields: fields,
            footer: {
                text: embed.descriptions.requestedBy + ' ' + message.author.username
            }
        }}).catch(error => {
            console.log(error);
    });
};

let failEmbed = (message, desc, fields) => {
    message.channel.send({embed: {
            color: embed.failColor,
            description: desc,
            fields: fields,
            footer: {
                text: `${embed.descriptions.requestedBy} ${message.author.username}`
            }
        }}).catch(error => {
            console.log(error);
    });

};

module.exports.resultsEmbed = resultsEmbed;
module.exports.playlistEmbed = playlistEmbed;
module.exports.controlsEmbed = controlsEmbed;
module.exports.successEmbed = successEmbed;
module.exports.failEmbed = failEmbed;