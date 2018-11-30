const request = require('request');
const auth = require('../config/auth');
const config = require('../config/config');

var getYtVideos = (keyWord, callback) => {
    request({
        url: `${config.googleBaseURL}part=${config.part}&maxResults=${config.maxResults}&q=${keyWord}&type=${config.type}&key=${auth.googleApiKey}`,
        json: true
    }, (error, response, body) => {
        if (error) {
            callback('Unable to connect to google servers.');
        }
        else if (response.statusCode === 200) {
            var results = body.items;
            var items = [];

            results.forEach((element, index) => {
                var data = {
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

module.exports.getYtVideos = getYtVideos;