# TMDB Guide
1. [General](#General)
2. [Movie Search](#Movie-Search)
3. [TV Show Search](#TV-Show-Search)

## General

To get data from the TMDB API, we use the `fetch` library for NodeJS. 

The difficult part of using the API is that you need to get used to using async functions in JavaScript. They're a huge pain in the ass, so I'll try and make it as easy as possible for this project.

At the top of your JavaScript file, you need to include the `fetch_api` function using:
```
const {fetch_api} = require('./tools.js')
```
This function should simplify most of the trouble with using the API. 

For each API call you make using `fetch_api`, you'll need to specify options for the request. You'll want to use the following options:
```
var options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NjAyMGE3NDdlOThkYWFkZTk3YmZhNGJjMGJmYzI3MiIsInN1YiI6IjY1ZTBmNzliYTM5ZDBiMDE2MzA3ZDhmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w7gWjNh2OHWhiq5Uh_JhhKG78c2ktBEimG8Vm89REXo'
        }
}
```
Really, the important part is the `Authorization` field, which has the API key needed to make the API calls.

To add new features, you'll probably need to reference the API documentation, which can be found [here](https://developer.themoviedb.org/reference/intro/getting-started). It'll give some simple examples for each API call showing you how to use them. Really what you should look for is the URL the call is using, which you'll pass into the `fetch_api` function to get the data.



## Examples
### Movie Search
```
const name = "movie name here"
const url = 'https://api.themoviedb.org/3/search/movie?query=' 
	+ name + '&include_adult=false&language=en-US&page=1';
const searchResults = await fetch_api(url, options);
```
Notice that when we use the `fetch_api` function, that you write `await` before the function name. This is a necessary for async functions. Don't worry too much about it.

Also, remember that the `options` parameter is the same `options` variable defined above.

The `searchResults` variable will be an array of about 20 movies, each of which will look like the following:
```
{
	  "adult": false,
      "backdrop_path": "/4qCqAdHcNKeAHcK8tJ8wNJZa9cx.jpg",
      "genre_ids": [
        12,
        28,
        878
      ],
      "id": 11,
      "original_language": "en",
      "original_title": "Star Wars",
      "overview": "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.",
      "popularity": 80.355,
      "poster_path": "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "release_date": "1977-05-25",
      "title": "Star Wars",
      "video": false,
      "vote_average": 8.204,
      "vote_count": 19760
}
```
This should have all the information that we need for sorting and stuff. The `id` tag will also be useful for other parts of the API, which needs a movie/show ID for their API call.



### TV Show Search
This example is basically the same as above.
```
const name = "TV Show name here"
const url = 'https://api.themoviedb.org/3/search/tv?query=' 
	+ name + '&include_adult=false&language=en-US&page=1';
const searchResults = await fetch_api(url, options);
```
The results are basically the same also (except for `release_data` is now `first_air_date`):
```
{
	  "adult": false,
      "backdrop_path": "/jjECb6dSFUKXDtryuQk4rkFY7oP.jpg",
      "genre_ids": [
        10759,
        16,
        10765
      ],
      "id": 4194,
      "origin_country": [
        "US"
      ],
      "original_language": "en",
      "original_name": "Star Wars: The Clone Wars",
      "overview": "Yoda, Obi-Wan Kenobi, Anakin Skywalker, Mace Windu and other Jedi Knights lead the Grand Army of the Republic against the droid army of the Separatists.",
      "popularity": 271.582,
      "poster_path": "/e1nWfnnCVqxS2LeTO3dwGyAsG2V.jpg",
      "first_air_date": "2008-10-03",
      "name": "Star Wars: The Clone Wars",
      "vote_average": 8.5,
      "vote_count": 1871
}
```



### Trending List
Gets a list of the currently trending movies/shows.  

Movies:
```
const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
const popularMovies = await fetch_api(url, options);
```

TV Shows:
```
const url = 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1';
const popularShows = await fetch_api(url, options);
```



### Top Rated
Gets a list of the highest rated movies/shows of all time.  

Movies:
```
const url = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1';
const topRatedMovies = await fetch_api(url, options);
```  

TV Shows:
```
const url = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1';
const topRatedShows = await fetch_api(url, options);
```  



### Search Actors
```
const name = "actor name";
const url = 'https://api.themoviedb.org/3/search/person?query=' +
            name + '&include_adult=false&language=en-US&page=1';
const actor = await fetch_api(url, options);
```
