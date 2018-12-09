const { MessageCollector } = require('discord.js');
const search = require('./videoSearch');
const reply = require('../config/reply');

const fs = require('fs');
const ytdl = require('ytdl-core');

let dispatcher;
let playQueue = [];
let repeating = false;


let selectSong = (client, message, args) => {
    if (!userInChannel(message)) {
        message.reply(reply.joinFirst);
    }
    else {
        search.getYtVideos(args, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                createResultsEmbed(client, message, results, args);
                const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, {time: 6000});

                collector.on('collect', message => {
                    let songNumber = (message.content - 1);
                    if (!checkInput(songNumber)) {
                        message.reply(reply.invalidInput);
                    } else {
                        collector.stop();
                        playQueue.push({
                            title: results[songNumber].title,
                            videoURL: results[songNumber].videoURL
                        });
                        if (playQueue.length > 1) {
                            message.reply(results[songNumber].title + reply.addedToQueue);
                        } else {
                            playSong(message);
                        }
                    }
                });
            }
        });
    }
};

let playSong = (message) => {
    if (playQueue.length === 0) {
        message.channel.send(reply.finishedPlaying);
    } else {
        message.member.voiceChannel.join()
            .then(connection => {
                let stream = ytdl(playQueue[0].videoURL, {
                    quality: 'highestaudio',
                    filter: 'audioonly',
                });
                if (!repeating) {
                    message.channel.send(reply.nowPlaying + playQueue[0].title);
                }
                dispatcher = connection.playStream(stream);

                dispatcher.on('end', () => {
                    if (!repeating) {
                        playQueue.shift();
                    }
                    playSong(message);
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }
};

let pauseSong = (message) => {
    if (userInChannel(message)) {
        dispatcher.pause();
    } else {
        message.reply(reply.listenOnlyChannel);
    }
};

let resumeSong = (message) => {
    if (userInChannel(message)) {
        dispatcher.resume();
    } else {
        message.reply(reply.listenOnlyChannel);
    }
};

let skipSong = (message) => {
    if (playQueue.length < 1) {
        message.reply(reply.emptyQueue);
    } else {
        dispatcher.end();
    }
};

let repeatSong = (message) => {
    repeating = !repeating;
    if (repeating ) {
        message.channel.send(reply.songRepeating);
    } else {
        message.channel.send(reply.songNoRepeating);
    }
};

let unknownCommand = (message) => {
    message.channel.send(reply.unknownCmd);
};

let leaveChannel = (message) => {
    if (userInChannel(message)) {
        playQueue = [];
        dispatcher.destroy();
        message.channel.send(reply.leavingChannel);
        message.member.voiceChannel.leave();
    } else {
        message.reply(reply.listenOnlyChannel);
    }
};

let createResultsEmbed = (client, message, results, args) => {
    // Get all results to field array to use in embed
    let fields = [];
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

let checkInput = (input) => {
    // Check if input value is correct
    return Number.isInteger(input) && input >= 0 && input <= 9;
};

let userInChannel = (message) => {
    // Check that user is in voice channel
    return !!message.member.voiceChannel;
};

let destroyClient = (client) => {
    client.destroy();
};


module.exports.selectSong = selectSong;
module.exports.pauseSong = pauseSong;
module.exports.resumeSong = resumeSong;
module.exports.skipSong = skipSong;
module.exports.repeatSong = repeatSong;
module.exports.unknownCommand = unknownCommand;
module.exports.leaveChannel = leaveChannel;
module.exports.destroyClient = destroyClient;