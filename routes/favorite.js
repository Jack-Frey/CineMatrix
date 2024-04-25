const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const filepath = "accounts.db";

// Connect to database file
function dbConnect() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                console.error(error);
                return reject(error.message);
            }
            return resolve(db);
        });
    });
}

// Add new movie/show to user favorites
async function addFavorite(id, type, user) {
    // Connect to database
    const db = await dbConnect();
    d
    // Insert id, type, and username into table
    b.all(
        `INSERT INTO favorites (item_id, type, user) VALUES (?, ?, ?)`,
        [id, type, user],
        function (error) {
            if (error) console.error(error.message);
        }
    );
}

// Removes an item from the users favorites
async function removeFavorite(id, type, user) {
    // Connect to database
    const db = await dbConnect();
    
    // Remove from table
    db.run(
        `DELETE FROM favorites WHERE item_id = ? AND type = ? AND user = ?`,
        [id, type, user],
        function (error) {
            if (error) console.error(error.message);
        }
    )
}

// Handle add favorite HTTP POST request
router.post("/add", (req, res) => {
    // Get information about the movie/show from the page 
    var id = req.body['id'];
    var type = req.body['type'];
    var username = req.body['username'];

    addFavorite(id, type, username);

    // Acknowledge request; Don't do anything else 
    res.end();
});

// Handle remove favorite HTTP POST request
router.post("/remove", (req, res) => {
    // Get information about the movie/show from the page
    var id = req.body['id'];
    var type = req.body['type'];
    var username = req.body['username'];

    removeFavorite(id, type, username);

    // Acknowledge request; Don't do anything else
    res.end(); 
});

module.exports = router;