"use strict"

module.exports = function requestLogger(){
    return(req,res,next) =>{
        const start = Date.now();
        res.on("finish",() =>{
            const ms = Date.now() - start;
            console.log(
                `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms) reqId = ${req.id}`
            )
        })
        next();
    }
}