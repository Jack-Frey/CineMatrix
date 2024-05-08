const express = require("express");
const router = express.Router();

const {fetch_api} = require("../tools.js");

// Get Top Rated Shows
async function GetTopRated(options) {
    const url = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1';
    var results = await fetch_api(url, options);
    return results;
}

// Get a list of shows from a given genre
async function GetShowsByGenre(options, genre) {
    const url = 'https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=' + genre + '&with_original_language=en';
    var results = await fetch_api(url, options);
    return results;
}

// Get images for each movie in the list
function get_posters(list) {
    posters = [];
    for (let i = 0; i < list.length; i++) {
        let img = "https://image.tmdb.org/t/p/original/" + list[i]['poster_path']; 
        if (img == null) {
            img = "/images/noPoster.jpg";
        }
        posters.push(img);
    }
    return posters;
}

router.get("/", (req, res) => {
    // HTTP GET options for API call
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    };

    (async() => {
        // Get TV Show Lists
        // See show genres here: https://developer.themoviedb.org/reference/genre-tv-list
        var TopRated = await GetTopRated(options);
        var Drama = await GetShowsByGenre(options, 18);
        var Crime = await GetShowsByGenre(options, 80);
        var Animation = await GetShowsByGenre(options, 16);
        var ScifiFantasy = await GetShowsByGenre(options, 10765);

        // Return page with posters
        res.render("shows.hbs", {
            TopRatedPosters: get_posters(TopRated),
            DramaPosters: get_posters(Drama),
            CrimePosters: get_posters(Crime),
            AnimationPosters: get_posters(Animation),
            ScifiFantasyPosters: get_posters(ScifiFantasy),

            loggedIn: req.session.loggedIn,
            username: req.session.username
        });
    })();
})

module.exports = router;