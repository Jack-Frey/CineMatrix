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

function dbConnect() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                console.error(error);
                return reject(error.message);
            }
            console.log("Connected to Database");
            return resolve(db);
        });
    });
}

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

                var movie_list = [];
                rows.forEach(row => {
                    movie_list.push(row);
                });
                return resolve(movie_list);
            }
        )
    });
}

async function favoritesApiFetch(username) {
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    const db = await dbConnect();
    if (await findUser(db, username)) {
        var results = await getFavorites(db, username);
        var favorites = [];

        for (let row of results) {
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

router.get("/:username", (req, res) => {
    const user = req.params.username;
    console.log(`Rendering user page for ${user}`);

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