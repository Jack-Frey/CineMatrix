const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const filepath = "../accounts.db";

function dbConnect() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                console.error(error.message);
                return reject(error.message);
            }
            console.log("Connected to Database");
            return resolve(db);
        });
    });
}

function createAccount(db, username, password) {
    db.run(
        `INSERT INTO accounts (username, password) VALUES (?, ?)`,
        [username, password],
        function (error) {
            if (error) {
                console.error(error.message);
            }
            console.log(`Created new account with ID: ${this.lastID}`);
        }
    );
}

router.post("/", (req, res) => {
    const username = req.body['uname'];
    const password = req.body['passw'];

    (async() => {
        dbConnect().then(db => {
            createAccount(db, username, password);
            res.send("Created new account");
        });
    })();
});

module.exports = router;
