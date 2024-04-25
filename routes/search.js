const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const filepath = "accounts.db";

const {fetch_api} = require("../tools.js"); 

// Connect to the database file
function dbConnect() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                console.error(error);
                return reject(error.message);
            }
            return resolve(db);
        });
    });
}

// Get array of favorites from the database
function getFavorites(db, username) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT item_id, type, user
            FROM favorites
            WHERE favorites.user = (?)`,
            [username],
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return reject(err.message);
                }

                var list = [];
                rows.forEach(row => {
                    list.push(row);
                });
                return resolve(list);
            }
        )
    });
}

// Checks if a given movie/show is in the user's favorites list
async function checkIfFavorite(db, id, type, username) {
    // HTTP GET options for API call
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    // Get favorites list
    var favorites = await getFavorites(db, username);

    // Iterate over favorites list to find given item
    for (let row of favorites) {
        if (row.item_id === id && row.user === username && row.type === type) {
            return true;
        }
    }
    return false;
}

// Get search results from the TMDB API
async function get_results(name, options) {
    // Different URLs for each request type
    var urlMovies = 'https://api.themoviedb.org/3/search/movie?query='
        + name + '&include_adult=false&language=en-US&page=1'
    var urlShows = 'https://api.themoviedb.org/3/search/tv?query='
        + name + '&include_adult=false&language=en-US&page=1'    

    // Store search results in here
    var results = []

    // Make API call for each content type
    const movieResults = await fetch_api(urlMovies, options);
    const TVResults = await fetch_api(urlShows, options);

    // Add results into array
    for (let index in movieResults) {
        results.push(movieResults[index])
    }
    for (let index in TVResults) {
        results.push(TVResults[index])
    }

    return results
}

// Handle search post request
router.post("/", (req, res) => {
    var contentName = req.body.textbox;

    // HTTP GET options for API call
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    // Array for our final, formatted results to display on search page
    var display = [];

    // Get search results
    get_results(contentName, options).then(results => {
        for (let i = 0; i < results.length; i++) {
            // Checks if current item is a movie
            if ("title" in results[i]) {
                let name = results[i]['title']
                let date = results[i]['release_date'].slice(0, 4)
                let rating = results[i]['vote_average']
                let desc = results[i]['overview']
                let img  = "https://image.tmdb.org/t/p/original/" + results[i]['poster_path']
                if (results[i]['poster_path'] == null) {
                    img = "/images/noPoster.jpg";
                }
                let id = results[i]['id']
                let type = 0
                let isFavorite = false;

                // This def won't work
                display.push({
                    "name" : name,
                    "date" : date,
                    "rating" : rating,
                    "desc" : desc,
                    "img"  : img,
                    "id" : id,
                    "type" : type,
                    "favorite" : isFavorite
                });
            } 
            // Otherwise it's a TV show
            else {
                let name = results[i]['name'];
                let date = results[i]['first_air_date'].slice(0,4)
                let rating = results[i]['vote_average']
                let desc = results[i]['overview']
                let img  = "https://image.tmdb.org/t/p/original/" + results[i]['poster_path']
                if (results[i]['poster_path'] == null) {
                    img = "/images/noPoster.jpg";
                }
                let id = results[i]['id']
                let type = 1
                let isFavorite = false;

                display.push({
                    "name" : name,
                    "date" : date,
                    "rating" : rating,
                    "desc" : desc,
                    "img"  : img,
                    "id" : id,
                    "type" : type,
                    "favorite" : isFavorite
                });
            }
        }

        // Order search results by highest to lowest rating and then by newest to oldest release date.
        display.sort((a, b) => {
            // Compare by rating first
            const ratingComparison = b.rating - a.rating;
            if (ratingComparison !== 0) {
                return ratingComparison; // If ratings are different, return the comparison result
            } else {
                // If ratings are the same, compare by year
                return new Date(b.date) - new Date(a.date);
            }
        });

        (async() => {
            // Connect to database
            var db = await dbConnect();

            // If user if logged in, check if each movie/show displayed is
            // on their favorites list. This changes what kind of star is 
            // displayed next to the search result.   
            if (req.session.loggedIn) {
                for (let item of display) {
                    if (await checkIfFavorite(db, 
                        item['id'], item['type'], req.session.username)) {
                        item['favorite'] = true;
                    }
                }
            }

            // Render page
            res.render("searchResults.hbs", {
                results: display,
                loggedIn: req.session.loggedIn,
                username: req.session.username,
            });
        })();
    });
});

module.exports = router;