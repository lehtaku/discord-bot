const { MessageCollector } = require('discord.js');
const search = require('./videoSearch');
const reply = require('../config/reply');

const fs = require('fs');
const ytdl = require('ytdl-core');

var dispatcher;
var playQueue = [];

var selectSong = (client, message, args) => {
    search.getYtVideos(args, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            createResultsEmbed(client, message, results, args);
            var collector = null;
            collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, { time: 5000 });

            collector.on('collect', message => {
                var songNumber = (message.content - 1);
                if (!checkInput(songNumber)) {
                    message.reply(reply.invalidInput);
                } else {
                    playQueue.push({
                        videoURL: results[songNumber].videoURL,
                        title: results[songNumber].title
                    });
                    if (playQueue.length === 1) {
                        playSong(message);
                    } else {
                        message.reply(results[songNumber].title + reply.addedToQueue);
                        console.log(playQueue);
                    }
                }
            });
        }
    });
};

var playSong = (message) => {
    message.member.voiceChannel.join()
        .then(connection => {
            var stream = ytdl(playQueue[0].videoURL, {
                quality: 'highestaudio',
                filter: 'audioonly',
            });
            message.channel.send(reply.nowPlaying + playQueue[0].title);
            dispatcher = connection.playStream(stream);

            dispatcher.on('end', () => {
                if (playQueue.length !== 0) {
                    playQueue.shift();
                    playSong(message);
                } else {
                    message.reply(reply.emptyQueue);
                }
            });
        });
    };

var pauseSong = (message) => {
    if (userInChannel(message) === true) {
        dispatcher.pause();
    } else {
        message.reply(reply.listenOnlyChannel);
    }
};

var resumeSong = (message) => {
    if (userInChannel(message) === true) {
        dispatcher.resume();
    } else {
        message.reply(reply.listenOnlyChannel);
    }
};

var leaveChannel = (message) => {
    if (userInChannel(message) === true) {
        message.reply(reply.leavingChannel);
        message.member.voiceChannel.leave();
        message.member.voiceChannel.leave();
    } else {
        message.reply(reply.listenOnlyChannel);
    }
};

var createResultsEmbed = (client, message, results, args) => {
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
            description: reply.resultsForKeywords + args,
            fields: fields
        }});
};

var checkInput = (input) => {
    // Check if input value is between 1-10
    var re = /^[0-9]*$/;
    return re.test(input);
};

var userInChannel = (message) => {
    // Check that user is in voice channel
    return (!!message.member.voiceChannel);
};


module.exports.selectSong = selectSong;
module.exports.pauseSong = pauseSong;
module.exports.resumeSong = resumeSong;
module.exports.leaveChannel = leaveChannel;