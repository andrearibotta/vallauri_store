"use strict"

const crypto = require("crypto");

module.exports = function requestId(){
    return(req,res,next) => {
        req.id = crypto.randomUUID();
        req.setHeander("X-Request-id",req.id);
        next();
    }
}