require("dotenv").config();
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var request = require("request");
var moment = require('moment');
var args = process.argv;

if (args.length != 4) {
    console.log('Usage:');
    console.log('\tnode liri.js <command> <command-arg>');
    console.log('commands:');
    console.log('\tconcert-this');
    console.log('\tspotify-this-song');
    console.log('\tmovie-this');
    console.log('\tdo-what-it-says');

    return;
}

var command = args[2];
var command_arg = args[3];

if (command === 'spotify-this-song') {
    console.log('Query spotify here: ' + command_arg);

    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: command_arg }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        console.log("=========================================================" +
            "\nArtist: " + data.tracks.items[0].artists[0].name +
            "\nSong's Name: " + data.tracks.items[0].name +
            "\nAlbum the Song is From: " + data.tracks.items[0].album.name +
            "\nPreview Link of the Song: " + data.tracks.items[0].preview_url +
            "\n=========================================================");
    });
} else if (command === "movie-this") {
    request("http://www.omdbapi.com/?t=" + command_arg + "&y=&plot=short&apikey=b1f8f1d7", function (error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {

            // Parse the body of the site and recover the title, year, IMBD rating, Rotten Tomatoes rating, Country, Language, Plot and Actors from the movie
            console.log("=========================================================" +
                "\nTitle of the Movie: " + JSON.parse(body).Title +
                "\nYear: " + JSON.parse(body).Year +
                "\nIMBD Rating: " + JSON.parse(body).imdbRating +
                "\nRotten Tomatoes Rating: " + JSON.parse(body).Ratings[1] +
                "\nCountry: " + JSON.parse(body).Country +
                "\nLanguage: " + JSON.parse(body).Language +
                "\nPlot: " + JSON.parse(body).Plot +
                "\nActors: " + JSON.parse(body).Actors +
                "\n=========================================================\n");

        };
    });

} else if (command === "concert-this") {
    var artist = command_arg
    console.log(artist);

    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

    request(queryURL, function (error, response, body) {

        if (error) {
            return console.log('Error occurred: ' + err);
        }

        var result = JSON.parse(body);
        // for loop for 10 results and display them

        var maxResults = Math.min(result.length, 10);

        for (var i = 0; i < maxResults; i++) {
            var current = result[i];
            var venue = current.venue;

            console.log("=========================================================")
            console.log(venue.name);
            console.log(venue.city + ', ' + venue.region + ', ' + venue.country);
            console.log(moment(current.datetime).format("MM/DD/YYYY"));
            }
    });
}