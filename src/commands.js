const { MessageCollector } = require('discord.js');
const embed = require('./embeds');
const search = require('./search');
const reply = require('../config/reply');
const validate = require('./validations');

const ytdl = require('ytdl-core');

let dispatcher;
let playQueue = [];
let playerState = false;
let repeating = false;

let selectSong = (client, message, args) => {
        search.getYtVideos(args, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                embed.resultsEmbed(client, message, results, args);
                const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, {time: 5000});

                collector.on('collect', message => {
                    let songNumber = (message.content - 1);
                    if (!validate.checkInput(songNumber)) {
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

                dispatcher.on('speaking', () => {
                    playerState = true;
                });

                dispatcher.on('end', () => {
                    playerState = false;
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
    if (playerState) {
        dispatcher.pause();
        message.channel.send(reply.playerPaused);
    } else {
        message.reply(reply.nothingPlaying);
    }
};

let resumeSong = (message) => {
    if (playerState) {
        dispatcher.resume();
        message.channel.send(reply.playerResuming);
    } else {
        message.reply(reply.nothingPlaying);
    }
};

let showPlaylist = (message) => {
    // TO DO
};

let skipSong = (message) => {
    if (playQueue.length < 1) {
        message.reply(reply.emptyQueue);
    } else {
        repeating = false;
        dispatcher.end();
    }
};

let repeatSong = (message) => {
    if (playerState) {
        repeating = !repeating;
        if (repeating ) {
            message.channel.send(reply.songRepeating);
        } else {
            message.channel.send(reply.songNoRepeating);
        }
    } else {
        message.reply(reply.nothingToRepeat);
    }
};

let unknownCommand = (message) => {
    message.reply(reply.unknownCmd);
};

let leaveChannel = (message) => {
    // FIX: Do only once
        playQueue = [];
        dispatcher.destroy();
        message.channel.send(reply.leavingChannel);
        message.member.voiceChannel.leave();
};

let showCommands = (message) => {
    embed.controlsEmbed(message);
};

module.exports.selectSong = selectSong;
module.exports.pauseSong = pauseSong;
module.exports.showPlaylist = showPlaylist;
module.exports.resumeSong = resumeSong;
module.exports.skipSong = skipSong;
module.exports.repeatSong = repeatSong;
module.exports.unknownCommand = unknownCommand;
module.exports.leaveChannel = leaveChannel;
module.exports.showCommands = showCommands;