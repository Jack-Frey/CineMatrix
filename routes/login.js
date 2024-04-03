const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const filepath = "accounts.db";

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
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO accounts (username, password) VALUES (?, ?)`,
            [username, password],
            function (error) {
                if (error) {
                    console.error(error.message);
                    return reject(error.message);
                }
                console.log(`Created new account with ID: ${this.lastID}`);
                return resolve();
            }
        );
    });
}

function checkForUser(db, username) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT username, password FROM accounts`,
            [],
            function (err, rows) {
                if (err) {
                    console.error(error.message);
                    return reject(error.message);
                }

                rows.forEach((row) => {
                    if (row.username == username) {
                        return resolve(row.password);
                    }
                });

                return resolve(false);
            }
        );
    });
}

router.post("/create", (req, res) => {
    const username = req.body['createUsername'];
    const password = req.body['createPassword'];

    console.log("Create Account request");

    (async() => {
        dbConnect().then(db => {
            createAccount(db, username, password).then(() => {
                res.send("Created new account");
            });
        });
    })();
});

router.post("/", (req, res) => {
    const username = req.body['loginUsername'];
    const password = req.body['loginPassword'];

    console.log("Login request");
    (async() => {
        dbConnect().then(db => {
            checkForUser(db, username).then((result) => {
                if (result === false) {
                    res.send("User not found");
                } else {
                    if (result == password) {
                        res.send("Successfully logged in");
                    } else {
                        res.send("Incorrect password");
                    }
                }
            });
        });
    })();
});

module.exports = router;
