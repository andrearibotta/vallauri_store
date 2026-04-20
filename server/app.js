"use strict";

require("dotenv").config();

const express = require("express");
const path = require("path");   
// Rimosso express-session
const cookieParser = require("cookie-parser");

const requestId = require("./middleware/requestId");
const requestLogger = require("./middleware/requestLogger");
const fileAccessLogger = require("./middleware/fileAccessLogger");
const enforceWriteContentType = require("./middleware/enforceWriteContentType");
const apiRouter = require("./routes/index");

const passport = require("./config/passport");

const app = express();

const cors = require("cors");
app.use(cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(requestId());
app.use(requestLogger());
app.use(fileAccessLogger());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Fondamentale per leggere i JWT nei cookie
app.use(express.static(path.join(__dirname, "public")));

// Inizializza Passport per Google OAuth, ma senza sessioni
app.use(passport.initialize());

app.use("/api", apiRouter);

app.use(
    enforceWriteContentType([
        { path: "/api/auth/login", type: "application/json" },
    ])
);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        error: err.message || "Errore interno del server",
        requestId: req.id,
    });
});

module.exports = app;