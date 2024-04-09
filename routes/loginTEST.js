// Test rewrite of login.js
// Doesn't work rn so just ignore

const express = require("express");
const router = express.Router();
const session = require("express-session");

const sqlite3 = require("sqlite3").verbose();
const {open} = require("sqlite");
const filepath = "accounts.db";

async function dbConnect() {
    const db = await open({
        filename: filepath,
        driver: sqlite3.Database
    });
    return db;
}

async function createAccount(db, username, password) {
    const result = await db.run(
        `INSERT INTO accounts (username, password) VALUES (?, ?)`,
        [username, password],
        (err) => {
            if (err) console.error(err.message);
            console.log(`Created new account with ID: ${this.lastID}`);
        }
    );
    return result;
}

async function checkForUser(db, username) {
    const result = await db.all(
        `SELECT username, password FROM accounts`,
        [],
        (err, rows) => {
            if (err) console.error(err.message);
            rows.forEach((row) => {
                if (row.username == username) {
                    return row.password;
                }
            });

            return false;
        }
    );
    return result;
}