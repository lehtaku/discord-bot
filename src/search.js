const config = require('../config/config');
const request = require('request');

let getYtVideos = (keyWord, callback) => {
    request({
        url: `${config.googleBaseURL}part=${config.part}&maxResults=${config.maxResults}&q=${keyWord}&type=${config.type}&key=${process.env.API_KEY}`,
        json: true
    }, (error, response, body) => {
        if (error) {
            callback('Unable to connect to google servers.');
        }
        else if (response.statusCode === 200) {
            let results = body.items;
            let items = [];

            results.forEach((element, index) => {
                let data = {
                    index: index + 1,
                    videoURL: config.ytVideoURL + element.id.videoId,
                    title: element.snippet.title,
                    uploader: element.snippet.channelTitle,
                };
                items.push(data);
            });

            callback(undefined, items);
        }
    });
};

module.exports = {
    getYtVideos
};