const express = require("express");
const router = express.Router();
const path = require('path');

const sqlite3 = require("sqlite3").verbose();
const filepath = "accounts.db";


// fetch_api needs to work differently here
async function fetch_api(url, options) {
    var response = await fetch(url, options);
    var data = await response.json();
    return data; // This is the different line
}

// Connect to database
function dbConnect() { 
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filepath, (error) => {
            // Problem openning database file
            if (error) {
                console.error(error);
                return reject(error.message);
            }
            // Return database object
            return resolve(db);
        });
    });
}

// Checks if user is registered on the database
function findUser(db, username) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT username FROM accounts`,
            [],
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return reject(err.message);
                }

                // Iterate over each entry in accounts table
                // Return true if username is found
                rows.forEach(row => {
                    if (row.username == username) {
                        return resolve(true);
                    }
                });
                return resolve(false);
            }
        );
    });
}

// Returns an array of favorite movies/show for a given user
function getFavorites(db, username) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT item_id, type
            FROM favorites
            WHERE favorites.user = (?)`,
            [username],
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return reject(err.message);
                }

                var list = [];
                // Add each entry into the array
                rows.forEach(row => {
                    list.push(row);
                });
                return resolve(list);
            }
        )
    });
}

// Get information about each favorited item in user favorite's list
async function favoritesApiFetch(username) {
    // HTTP GET options for API call 
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    // Connect to database
    const db = await dbConnect();

    // Check if user exists 
    if (await findUser(db, username)) {
        // Get favorites from database
        var results = await getFavorites(db, username);
        var favorites = [];

        // Get information about each entry from TMDB database
        for (let row of results) {
            // Each entry has a 'type' attribute to distinguish between movies and shows
            // This is because we need a different API call for each type

            // Movie
            if (row.type == 0) {
                var url = `https://api.themoviedb.org/3/movie/${row.item_id}?language=en-US`
                var search = await fetch_api(url, options);
                favorites.push({
                    "name" : search["title"],
                    "poster" : "https://image.tmdb.org/t/p/original/" + search["poster_path"],
                });
            } 
            // TV show
            else {
                var url = `https://api.themoviedb.org/3/tv/${row.item_id}?language=en-US`;
                var search = await fetch_api(url, options);
                favorites.push({
                    "name" : search["name"],
                    "poster" : "https://image.tmdb.org/t/p/original/" + search["poster_path"],
                });
            }
        }
        return favorites;
    } else {
        // Could not find user
        return false;
    }
}

// Returns user page for the specified user
// Usage: /user/Jackson
router.get("/:username", (req, res) => {
    const user = req.params.username;

    // Render page with their favorites
    (async() => {
        var userFavorites = await favoritesApiFetch(user);
        if (userFavorites == false) {
            console.log(`${user} has no favorites`);
        }

        res.render("user.hbs", {
            username: user,
            favorites: userFavorites
        });
    })();
});

module.exports = router;