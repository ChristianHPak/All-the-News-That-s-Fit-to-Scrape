// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "NYTimes";
var collections = ["NYTimesArticle"];

// Set Handlebars as the view engine
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    db.NYTimesArticle.find({}, function (error, found) {
        // Log any errors if the server encounters one
        if (error) {
            console.log(error);
        }
        // Otherwise, send the result of this query to the browser
        else {
            res.render("main", found)
        }
    });
});

axios.get("https://www.nytimes.com/section/world").then(function (response) {

    // Load the body of the HTML into cheerio
    var $ = cheerio.load(response.data);

    // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
    $("article").each(function (i, element) {

        // Save the text of the h4-tag as "title"
        var title = $(element).find("h2").text().trim();
        var link = $(element).find("a").attr("href");
        var summary = $(element).find("p").text().trim();
        var img = $(element).parent().find("img").attr("src");

        // Make an object with data we scraped for this h4 and push it to the results array
        db.NYTimesArticle.insert({
            title,
            link,
            summary,
            img
        }, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log(data)
            }
        })
    });
});

app.get("/all", function (req, res) {
    // Query: In our database, go to the animals collection, then "find" everything
    db.NYTimesArticle.find({}, function (error, found) {
        // Log any errors if the server encounters one
        if (error) {
            console.log(error);
        }
        // Otherwise, send the result of this query to the browser
        else {
            res.json(found);
        }
    });
});



app.listen(3000, function () {
    console.log("App running on port 3000!");
});