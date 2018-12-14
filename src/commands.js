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
let volume = 0.05; // Default volume 5%

/*
* Fix: Remove message after command
 */

let selectSong = (message, args) => {
        search.getYtVideos(args, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                embed.resultsEmbed(message, results, args);

                const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, {time: 5000});

                collector.on('collect', message => {
                    let songNumber = (message.content - 1);
                    if (!validate.checkInput(songNumber)) {
                        embed.failEmbed(message, reply.invalidInput);
                    } else {
                        collector.stop();
                        playQueue.push({
                            queuedBy: message.author.username,
                            title: results[songNumber].title,
                            videoURL: results[songNumber].videoURL
                        });
                        if (playQueue.length > 1) {
                            embed.successEmbed(message, results[songNumber].title + reply.addedToQueue);
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
        embed.successEmbed(message, reply.finishedPlaying);
    } else {
        message.member.voiceChannel.join()
            .then(connection => {
                let stream = ytdl(playQueue[0].videoURL, {
                    quality: 'highestaudio',
                    filter: 'audioonly',
                });
                if (!repeating) {
                    embed.successEmbed(message, reply.nowPlaying + playQueue[0].title);
                }
                dispatcher = connection.playStream(stream);

                dispatcher.on('speaking', () => {
                    dispatcher.setVolume(volume);
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
        embed.successEmbed(message, reply.playerPaused);
    } else {
        embed.failEmbed(message, reply.nothingPlaying);
    }
};

let resumeSong = (message) => {
    if (playerState) {
        dispatcher.resume();
        embed.successEmbed(message, reply.playerResuming);
    } else {
        embed.failEmbed(message, reply.nothingPlaying);
    }
};

let showPlaylist = (message) => {
    if (playQueue.length > 1) {
        embed.playlistEmbed(message, playQueue);
    } else {
        embed.failEmbed(message, reply.emptyPlaylist);
    }

};

let skipSong = (message) => {
    if (playQueue.length < 1) {
        embed.failEmbed(message, reply.emptyQueue);
    } else {
        repeating = false;
        dispatcher.end();
    }
};

let setVolume = (message, args) => {
    if (playerState) {
        if (validate.checkVolume(args[0])) {
            let volume = args[0] / 100;
            dispatcher.setVolume(volume);
        } else {
            embed.failEmbed(message, reply.invalidVolume);
        }
    } else {
        embed.failEmbed(message, reply.nothingPlaying);
    }
};

let stopPlaying = (message) => {
    if (playerState) {
        playQueue = [];
        dispatcher.end();
    } else {
        embed.failEmbed(message, reply.nothingPlaying);
    }
};

let repeatSong = (message) => {
    if (playerState) {
        repeating = !repeating;
        if (repeating ) {
            embed.successEmbed(message, reply.songRepeating);
        } else {
            embed.successEmbed(message, reply.songNoRepeating);
        }
    } else {
        embed.failEmbed(message, reply.nothingToRepeat);
    }
};

let unknownCommand = (message) => {
    embed.failEmbed(message, reply.unknownCmd);
};

let joinChannel = (message) => {
        message.member.voiceChannel.join()
            .catch(error => {
                console.log(error);
            });
};

let leaveChannel = (message) => {
        playQueue = [];
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
module.exports.setVolume = setVolume;
module.exports.stopPlaying = stopPlaying;
module.exports.repeatSong = repeatSong;
module.exports.unknownCommand = unknownCommand;
module.exports.joinChannel = joinChannel;
module.exports.leaveChannel = leaveChannel;
module.exports.showCommands = showCommands;