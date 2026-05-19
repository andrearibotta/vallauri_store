// Contenuto temporaneo per public_routes.js, auth_routes.js, db_routes.js, private_routes.js
"use strict";
const express = require("express");
const router = express.Router();
const db = require('../db/mysql');

router.get("/ping",(req,res) =>{
    return res.status(200).json({ok:ok});
})

router.get("/getAllClassi",async(req,res) =>{
    const rows = await db.query(
        "SELECT * FROM classe"
    )

    return res.status(200).json({classe:rows});
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

router.get('/get4ProdottiCasuali', async(req,res) =>{
    //const maxResult = await db.query("SELECT MAX(id_prodotto) AS max_id FROM prodotto")
    //const maxId = maxResult[0].max_id
    const maxId = 20
    console.log("Max ID:", maxId);
    console.log(maxId)
    let prodottiCasuali = [];
    let numeriCasuali = [];
    let idCasuale = 0;
    let i = 0
    while(i < 4){
        idCasuale = Math.floor(Math.random()*maxId + 1)
        while(numeriCasuali.includes(idCasuale)){
            idCasuale = Math.floor(Math.random()*maxId + 1)
        }
        prodottiCasuali.push(await db.query("SELECT * FROM prodotto WHERE id_prodotto = ?",[idCasuale]));
        numeriCasuali.push(idCasuale);
        i++;
    }

    return res.json({ok:true,prodotti:prodottiCasuali});
    
})

module.exports = router;