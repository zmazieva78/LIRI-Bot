require("dotenv").config();
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var request = require("request");
var moment = require('moment');
var fs = require('fs');
var log4js = require('log4js');

log4js.configure({
    appenders: {
        liri_file: { type: 'file', filename: 'log.txt' },
        liri_console: { type: 'console' }
    },
    categories: {
        default: {
            appenders: ['liri_file'],
            level: 'debug'
        }
    }
});

const logger = log4js.getLogger('liri');

logger.info("liri");

var args = process.argv;

if (args.length < 3 || args.length > 4) {
    const usage = 'Usage:' +
        '\n\tnode liri.js <command> <command-arg>' +
        '\ncommands:' +
        '\n\tconcert-this' +
        '\n\tspotify-this-song' +
        '\n\tmovie-this' +
        '\n\tdo-what-it-says';

    console.log(usage);

    return;
}

const command = args[2];
const command_arg = args[3];

executeCommand(command, command_arg);

function spotifyThis(command_arg) {
    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: command_arg }, function (err, data) {
        if (err) {
            console.error('Error occurred: ' + err);
            logger.error('Error occurred: ' + err);
            throw err;
        }

        const output = "\n=========================================================" +
            "\n*** spotify-this '" + command_arg + "' ***" +
            "\n\nArtist: " + data.tracks.items[0].artists[0].name +
            "\nSong's Name: " + data.tracks.items[0].name +
            "\nAlbum the Song is From: " + data.tracks.items[0].album.name +
            "\nPreview Link of the Song: " + data.tracks.items[0].preview_url;

        console.log(output);
        logger.info(output);
    });
}

function movieThis(command_arg) {
    request("http://www.omdbapi.com/?t=" + command_arg + "&y=&plot=short&apikey=b1f8f1d7", function (err, response, body) {

        if (err) {
            console.error('Error occurred: ' + err);
            logger.error('Error occurred: ' + err);
            throw err;
        }

        // If the request is successful (i.e. if the response status code is 200)
        if (!err && response.statusCode === 200) {

            // Parse the body of the site and recover the title, year, IMBD rating, Rotten Tomatoes rating, Country, Language, Plot and Actors from the movie
            const result = JSON.parse(body);

            const output = "\n=========================================================" +
                "\n*** movie-this '" + command_arg + "' ***" +
                "\n\nTitle of the Movie: " + result.Title +
                "\nYear: " + result.Year +
                "\nIMBD Rating: " + result.imdbRating +
                "\nRotten Tomatoes Rating: " + result.Ratings[1] +
                "\nCountry: " + result.Country +
                "\nLanguage: " + result.Language +
                "\nPlot: " + result.Plot +
                "\nActors: " + result.Actors;

            console.log(output);
            logger.info(output);
        };
    });
}

function concertThis(artist) {
    const queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

    request(queryURL, function (err, response, body) {
        if (err) {
            console.error('Error occurred: ' + err);
            logger.error('Error occurred: ' + err);
            throw err;
        }

        const header = "\n=========================================================" +
            "\n*** concert-this '" + artist + "' ***";

        console.log(header);
        logger.info(header);

        var result = JSON.parse(body);

        var maxResults = Math.min(result.length, 10);

        for (var i = 0; i < maxResults; i++) {
            var current = result[i];
            var venue = current.venue;

            const item = "\n\t=================================================" +
                "\n\t" + venue.name +
                "\n\t" + venue.city + ', ' + venue.region + ', ' + venue.country +
                "\n\t" + moment(current.datetime).format("MM/DD/YYYY");

            console.log(item);
            logger.info(item);
        }
    });
}

function doWhatItSays() {
    fs.readFile('./random.txt', 'utf8', function (err, contents) {
        if (err) {
            console.error('Error occurred: ' + err);
            logger.error('Error occurred: ' + err);
            throw err;
        }

        var lines = contents.split('\n');

        lines.forEach(function (line) {
            var commandLine = line.split(',');
            var command = commandLine[0];
            var command_arg = commandLine[1].trim();
            var command_arg = command_arg.substring(1, command_arg.length - 1);

            executeCommand(command, command_arg);
        });
    });
}

function executeCommand(command, command_arg) {
    if (command === 'spotify-this-song') {
        spotifyThis(command_arg);
    } else if (command === "movie-this") {
        movieThis(command_arg);
    } else if (command === "concert-this") {
        concertThis(command_arg);
    } else if (command === "do-what-it-says") {
        doWhatItSays();
    } else {
        console.error('Unknown command: ' + command);
    }
}