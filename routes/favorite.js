const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const filepath = "accounts.db";

function dbConnect() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                console.error(error);
                return reject(error.message);
            }
            console.log("Connected to Database");
            return resolve(db);
        });
    });
}

async function addFavorite(id, type, user) {
    const db = await dbConnect();
    db.all(
        `INSERT INTO favorites (item_id, type, user) VALUES (?, ?, ?)`,
        [id, type, user],
        function (error) {
            if (error) console.error(error.message);
        }
    );
}

async function removeFavorite(id, type, user) {
    const db = await dbConnect();
    db.run(
        `DELETE FROM favorites WHERE item_id = ? AND type = ? AND user = ?`,
        [id, type, user],
        function (error) {
            if (error) console.error(error.message);
        }
    )
}

router.post("/add", (req, res) => {
    var id = req.body['id'];
    var type = req.body['type'];
    var username = req.body['username'];

    addFavorite(id, type, username);

    res.end();
});

router.post("/remove", (req, res) => {
    var id = req.body['id'];
    var type = req.body['type'];
    var username = req.body['username'];

    removeFavorite(id, type, username);

    res.end(); 
});

module.exports = router;