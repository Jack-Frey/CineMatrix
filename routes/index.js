const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 
const session = require('express-session')

const hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerHelper('get', (context, property) => context[property]);

const {fetch_api} = require('../tools.js')
const loginRoute = require('./login.js');

const port = 3000
app.use('/stylesheets', express.static(path.join(__dirname, '../stylesheets')));
app.use('/routes', express.static(path.join(__dirname, 'routes')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "secret", // security thing that's probably important
    resave: true,
    saveUninitialized: true
}));

async function get_results(name, options) {
    var urlMovies = 'https://api.themoviedb.org/3/search/movie?query='
        + name + '&include_adult=false&language=en-US&page=1'
    var urlShows = 'https://api.themoviedb.org/3/search/tv?query='
        + name + '&include_adult=false&language=en-US&page=1'    

    var results = []

    const movieResults = await fetch_api(urlMovies, options);
    const TVResults = await fetch_api(urlShows, options);

    for (let index in movieResults) {
        results.push(movieResults[index])
    }
    for (let index in TVResults) {
        results.push(TVResults[index])
    }

    return results
}

async function getImages(options) {

    const results = await fetch_api('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options);
    
    return results;
}

app.get('/', (req, res) => {

    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    var display = [];

    getImages(options).then(results => {
        for (let i = 0; i < results.length; i++) {
            let path = results[i]['poster_path']
            display.push('https://image.tmdb.org/t/p/original/' + path);
        }

        // Information for home page
        res.render(path.join(__dirname, '../views/index'), { 
            images: display,
            loggedIn: req.session.loggedIn,
            username: req.session.username,
        });
    })    

});

app.get("/about", (req, res) => {
    res.render(path.join(__dirname, "../views/about"));
})

app.use('/login', loginRoute);

app.post('/search', (req, res) => {
    var contentName = req.body.textbox;

    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    var display = [];
    /*
    format for item object
    {
        "name" : name,
        "date" : release_date/first_air_date,
        "desc" : overview
        "img"  : poster_path
    }
    */
    get_results(contentName, options).then(results => {
        for (let i = 0; i < results.length; i++) {
            // Checks if current item is a movie
            if ("title" in results[i]) {
                let name = results[i]['title']
                let date = results[i]['release_date'].slice(0, 4)
                let rating = results[i]['vote_average']
                let desc = results[i]['overview']
                let img  = "https://image.tmdb.org/t/p/original/" + results[i]['poster_path']
                display.push({
                    "name" : name,
                    "date" : date,
                    "rating" : rating,
                    "desc" : desc,
                    "img"  : img
                });
            } 
            // Otherwise it's a TV show
            else {
                let name = results[i]['name'];
                let date = results[i]['first_air_date'].slice(0,4)
                let rating = results[i]['vote_average']
                let desc = results[i]['overview']
                let img  = "https://image.tmdb.org/t/p/original/" + results[i]['poster_path']
                display.push({
                    "name" : name,
                    "date" : date,
                    "rating" : rating,
                    "desc" : desc,
                    "img"  : img
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

        res.render(path.join(__dirname, "../views/searchResults"), {results: display});
    })
})

app.get("/movies", (req, res) => {
    res.render(path.join(__dirname, "../views/movies"));
});

app.get("/shows", (req, res) => {
    res.render(path.join(__dirname, "../views/shows"));
});

app.get("/login", (req, res) => {
    res.render(path.join(__dirname, "../views/login"));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
