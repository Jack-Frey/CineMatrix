const express = require("express");
const router = express.Router();

const {fetch_api} = require("../tools.js");

// Gets a list of newly released movies
async function GetNowPlaying(options) {
    const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1';
    var results = await fetch_api(url, options);
    return results
} 

// Gets the top rated movies of all time
async function GetTopRated(options) {
    const url = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1';
    var results = await fetch_api(url, options);
    return results;
}

// Gets a list of the most popular (current) movies in a genre 
async function GetMoviesByGenre(options, genre) {
    const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=' + genre;
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
        // Basic movie lists
        var NowPlaying = await GetNowPlaying(options);
        var TopRated = await GetTopRated(options);

        // Genres
        // See movie genre IDs here: https://developer.themoviedb.org/reference/genre-movie-list
        var Scifi =  await GetMoviesByGenre(options, 878);
        var Comedy = await GetMoviesByGenre(options, 35);
        var Horror = await GetMoviesByGenre(options, 27);
        var Action = await GetMoviesByGenre(options, 28);

        // Return page with posters
        res.render("movies.hbs", {
            NowPlayingPosters: get_posters(NowPlaying),
            TopRatedPosters: get_posters(TopRated),
            ScifiPosters: get_posters(Scifi),
            ComedyPosters: get_posters(Comedy),
            HorrorPosters: get_posters(Horror),
            ActionPosters: get_posters(Action),

            loggedIn: req.session.loggedIn,
            username: req.session.username
        });
    })(); 
});

module.exports = router;