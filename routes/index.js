const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 
const session = require('express-session')

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
const searchRoute = require('./search.js');
const favoriteRoute = require('./favorite.js');
const moviesRoute = require('./movies.js');
const showsRoute = require('./shows.js');

const port = 3000
app.use('/stylesheets', express.static(path.join(__dirname, '../stylesheets')));
app.use('/routes', express.static(path.join(__dirname, 'routes')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "secret", // security thing that's probably important
    resave: true,
    saveUninitialized: true
}));

// Render home page
app.get('/', (req, res) => {
    // HTTP GET options for API fetch
    var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
    }

    // Put movie posters in this array
    var display = [];

    // Get images for trending movie carousel
    getImages(options).then(results => {
        for (let i = 0; i < results.length; i++) {
            // Extract image URL from result
            let path = results[i]['poster_path']

            // Add to array
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

// Render about page
app.get("/about", (req, res) => {
    res.render("about.hbs", { 
        loggedIn: req.session.loggedIn,
        username: req.session.username,
    });
})

// Handle other requests
// These are located in their own files
app.use('/login', loginRoute);
app.use('/signup', loginRoute);
app.use('/user', userRoute);
app.use('/search', searchRoute);
app.use('/favorite', favoriteRoute);
app.use("/movies", moviesRoute);
app.use("/shows", showsRoute);

// Login page
app.get("/login", (req, res) => {
    res.render("login.hbs", { 
        loggedIn: req.session.loggedIn,
        username: req.session.username,
    });
});

// Create User page
app.get("/signup", (req, res) => {
    res.render("signup.hbs", { 
        loggedIn: req.session.loggedIn,
        username: req.session.username,
    });
});

// Launch app
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
