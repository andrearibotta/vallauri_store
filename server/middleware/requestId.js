"use strict"

const crypto = require("crypto");

module.exports = function requestId(){
    return(req,res,next) => {
        req.id = crypto.randomUUID();
        res.setHeader("X-Request-id",req.id);
        next();
    }
}