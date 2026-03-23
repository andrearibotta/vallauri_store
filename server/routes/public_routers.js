// Contenuto temporaneo per public_routes.js, auth_routes.js, db_routes.js, private_routes.js
"use strict";
const express = require("express");
const router = express.Router();

router.get("/ping",(req,res) =>{
    res.json({ok:true,reqestId:req.id})
})

router.get("/test-sessione",(req,res) =>{
    req.session.user = {
        id:1,
        username:"mario",
        role: "admin"
    };

    res.json({
        ok:true,
        requestId:req.id,
        user:req.session.user,
        sessioneID: req.sessioneID
    });
})

module.exports = router;