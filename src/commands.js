const { MessageCollector } = require('discord.js');
const search = require('./videoSearch');

const fs = require('fs');
const ytdl = require('ytdl-core');


var selectSong = (client, message, args) => {
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

            // Create and send results embed
            message.channel.send({embed: {
                    color: 6750054,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                    },
                    description: `Results for keyword(s): ${args}`,
                    fields: fields
                }});

            // Wait for user to select which song to play
            const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, { time: 10000 });
            collector.on('collect', message => {
                var i = message.content;
                if (i < 1 || i > 10) {
                    message.channel.send('Please give valid number! :slight_smile:')
                } else {
                    message.channel.send(`Now playing: ${results[i - 1].title}`);

                    if (message.member.voiceChannel) {
                        message.member.voiceChannel.join()
                            .then(connection => {
                                var url = results[i - 1].videoURL;
                                var stream = ytdl(url, {filter: 'audioonly'});
                                var dispatcher = connection.playStream(stream);
                            })
                    } else {
                        message.reply('I dont want to play alone, join to voice channel first!');
                    }
                }
            })
        }
    });
};

module.exports.selectSong = selectSong;