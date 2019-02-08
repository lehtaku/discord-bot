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
let volume;

/*
* Do: Search withing url
*/

let selectSong = (message, args) => {
    search.getYtVideos(args, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                embed.resultsEmbed(message, results, args);
                songSelector(message, results);
            }
        });
};

let songSelector = (message, results) => {
    const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, {time: 20000});

    collector.on('collect', input => {
        if (input.content.startsWith('?')) {
            collector.stop();
            return;
        }
        let songNumber = (input.content - 1);
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
                volume = 0.30;
            }
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
                    lang: 'fi'
                });
                if (!repeating) {
                    embed.successEmbed(message, reply.nowPlaying + playQueue[0].title);
                }
                dispatcher = connection.playStream(stream);
                dispatcher.setVolume(volume);

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

let setVolume = (message, args, value) => {
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

module.exports = {
    selectSong,
    pauseSong,
    showPlaylist,
    resumeSong,
    skipSong,
    setVolume,
    stopPlaying,
    repeatSong,
    unknownCommand,
    joinChannel,
    leaveChannel,
    showCommands
};
