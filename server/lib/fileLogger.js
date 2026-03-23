"use strict";
const pino = require("pino");
const fs = require("fs");
const path = require("path");

function createLogger(logPath) {
    // Crea la cartella se non esiste
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return pino(
        {
            level: "info",
        },
        pino.destination(logPath)
    );
}

module.exports = createLogger;