const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 
const session = require('express-session')

/*
const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials', (err) => {
    if (err) console.error(err);
});
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
hbs.registerHelper('get', (context, property) => context[property]);
*/

const exphbs = require("express-handlebars");
app.engine('handlebars', exphbs({
    extname: 'hbs',
    defaultLayout: 'index',
    layoutsDir: path.join(__dirname, "../views"),
    partialsDir : ""
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, "../views"));

const {fetch_api, getImages} = require('../tools.js')
const loginRoute = require('./login.js');
const userRoute = require('./user.js');
const searchRoute = require("./search.js");

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
        res.render('index.hbs', { 
            images: display,
            loggedIn: req.session.loggedIn,
            username: req.session.username,
        });
    })    

});

app.get("/about", (req, res) => {
    res.render("about.hbs");
})

app.use('/login', loginRoute);
app.use('/user', userRoute);
app.use('/search', searchRoute);

app.get("/movies", (req, res) => {
    res.render("movies.hbs");
});

app.get("/shows", (req, res) => {
    res.render("shows.hbs");
});

app.get("/login", (req, res) => {
    res.render("login.hbs");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
