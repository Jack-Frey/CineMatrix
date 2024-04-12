const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const filepath = "accounts.db";

/*
Opens the accounts.db file.
Needs to be called before any reading/writing.
*/
function dbConnect() {
    return new Promise((resolve, reject) => {
        // Open database and return it
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

/*
Adds new account to database
*/
function createAccount(db, username, password) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO accounts (username, password) VALUES (?, ?)`,
            [username, password],   // Values to pass into SQL command
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

/*
Checks if a user exists in the database.
If found, returns the password (for logging in)
*/
function checkForUser(db, username) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT username, password FROM accounts`,
            [],
            function (err, rows) {
                if (err) {
                    console.error(err.message);
                    return reject(err.message);
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

/*
Process create account request
*/
router.post("/create", (req, res) => {
    const username = req.body['createUsername'];
    const password = req.body['createPassword'];

    console.log("Create Account request");

    /*
        1. Connect to database
        2. Checks if an account with username already exists
        3. If account exists, tell user.
           else, add account to database and redirect to home page.
    */
    (async() => {
        dbConnect().then(db => {
            checkForUser(db, username).then((found) => {
                if (found === false) {
                    createAccount(db, username, password).then(() => {
                        console.log(`Created new account: ${username}`);
                        req.session.loggedIn = true;
                        req.session.username = username;
                        res.redirect("/");
                    });
                } else {
                    res.send("Username already exists");
                }
            });
        });
    })();
});

/*
Process login request
*/
router.post("/", (req, res) => {
    const username = req.body['loginUsername'];
    const password = req.body['loginPassword'];

    console.log("Login request");

    /*
        1. Connect to database
        2. Check if account exists
        3. If account exists, compare passwords
        4. If password if correct, login and redirect to home page.
           Else, tell user has incorrect password.
        5. If account doesn't exist, also tell user.
    */
    (async() => {
        dbConnect().then(db => {
            checkForUser(db, username).then((result) => {
                if (result === false) {
                    res.send("User not found");
                } else {
                    if (result == password) {
                        console.log(`User ${username} logged in`);
                        req.session.loggedIn = true;
                        req.session.username = username;
                        res.redirect("/");
                    } else {
                        res.send("Incorrect password");
                    }
                }
            });
        });
    })();
});

module.exports = router;
