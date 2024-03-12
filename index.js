const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 

const {fetch_api} = require('./tools.js')

const port = 3000

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

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

    get_results(contentName, options).then(results => {
        var display = ""
        for (let i = 0; i < results.length; i++) {
            if ("title" in results[i]) {
                let name = results[i]['title']
                let date = results[i]['release_date'].slice(0, 4)
                let str = name + " (" + date + ") <br>"
                display += str
            } else {
                let name = results[i]['name'];
                let date = results[i]['first_air_date'].slice(0,4)
                let str = name +" (" + date + ") <br>"
                display += str
            }
        }
        res.send(display)
    })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
