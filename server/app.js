"use strict"

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const requestId = require("./middleware/requestId");
const requestLogger = require("./middleware/requestLogger");
const fileAccessLogger = require("./middleware/fileAccessLogger");
const enforceWriteContentType = require("./middleware/enforceWriteContentType");
const apiRouter = require("./routes/index");

const app = express();

app.use(requestId());
app.use(requestLogger());
app.use(fileAccessLogger());

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(session({
    secret:process.env.SESSION_SECRET || "segreto_di_sviluppo",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,      // true solo con HTTPS
        maxAge: 1000 * 60 * 60 * 24  // 24 ore
    }
}))

app.use("/api",apiRouter);

app.use(enforceWriteContentType([
    { path: "/api/auth/login", type: "application/json" },
]))

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        error: err.message || "Errore interno del server",
        requestId: req.id
    });
});


module.exports = app;
