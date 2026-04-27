// Contenuto temporaneo per public_routes.js, auth_routes.js, db_routes.js, private_routes.js
"use strict";
const express = require("express");
const router = express.Router();
const db = require('../db/mysql')

router.get('/getAllUser', async (req, res) => {
    const row = await db.query(
        'SELECT * FROM utente'
    )

    return res.status(200).json({ user: row });
})

module.exports = router;