async function fetch_api(url, options) {
    var response = await fetch(url, options);
    var data = await response.json();
    return data['results'];
}

async function getImages(options) {

    const results = await fetch_api('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options);
    
    return results;
}

module.exports = {
    fetch_api,
    getImages,
};