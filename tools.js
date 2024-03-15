async function fetch_api(url, options) {
    var response = await fetch(url, options);
    var data = await response.json();
    return data['results'];
}

module.exports = {
    fetch_api,
};