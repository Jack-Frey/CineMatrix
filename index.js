const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 

const port = 3000

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.post('/search/movie', (req, res) => {
    var movieName = req.body.textbox;
    var url = 'https://api.themoviedb.org/3/search/movie?query=' 
        + movieName + '&include_adult=false&language=en-US&page=1';
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    fetch(url, options)
        .then(data => data.json())
        .then(data => {
            var movies = data["results"]
            var count = Object.keys(movies).length
            var names = ""
            for (let i = 0; i < count; i++) {
                let name = movies[i]['title']
                let release = movies[i]['release_date'].slice(0, 4)
                names += (name + " (" + release + ") <br>") 
            }
            res.send(names)
        })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
