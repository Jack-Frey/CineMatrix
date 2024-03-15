const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 

const hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerHelper('get', (context, property) => context[property]);

const {fetch_api} = require('../tools.js')

const port = 3000
app.use('/stylesheets', express.static(path.join(__dirname, '../stylesheets')));
app.use('/routes', express.static(path.join(__dirname, 'routes')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

        res.render(path.join(__dirname, '../views/index'), { images: display });
    })    

  });

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
                let desc = results[i]['overview']
                let img  = "https://image.tmdb.org/t/p/original/" + results[i]['poster_path']
                display.push({
                    "name" : name,
                    "date" : date,
                    "desc" : desc,
                    "img"  : img
                });
            } 
            // Otherwise it's a TV show
            else {
                let name = results[i]['name'];
                let date = results[i]['first_air_date'].slice(0,4)
                let desc = results[i]['overview']
                let img  = "https://image.tmdb.org/t/p/original/" + results[i]['poster_path']
                display.push({
                    "name" : name,
                    "date" : date,
                    "desc" : desc,
                    "img"  : img
                });
            }
        }

        res.render(path.join(__dirname, "../views/searchResults"), {results: display});
    })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})