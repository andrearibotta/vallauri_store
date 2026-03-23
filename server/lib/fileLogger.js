const pino = require("pino");

function createLogger(logPath){
    return pino(
        {
            level:"info",
        },
        pino.destination(logPath)   
    )
}

module.exports = createLogger;