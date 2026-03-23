// Contenuto temporaneo per public_routes.js, auth_routes.js, db_routes.js, private_routes.js
"use strict";
const express = require("express");
const db = require("../db/mysql");
const router = express.Router();

router.post("/login",async(req,res,next) =>{
    try{
        const {email,password} = req.body || null;
        if(!email || !password){
            const err = new Error("Email e password Obbligatori");
            err.statusCode = 400;
            throw err
        }

        const rows = await db.query(
            "SELECT * FROM utenti WHERE email = ? AND password = ?",
             [email,password]
        );

        if(rows.length === 0){
            return res.status(401).json({
                err:"Credenziali non valide",
                requestId: req.id
            });
        }

        const user = rows[0];

        req.session.regenerate((err) =>{
            if(err) return next(err);

            req.session.user = {
                id:user.id,
                email: user.email,
                role:user.ruolo
            };
            res.json({
                ok:true,
                message:"Login effettuato",
                user:req.session.user,
                requestId:req.id
            });
        })

    }
    catch(err){
        next(err);
    }
})

router.get("/me", (req, res) => {
    res.json({
        authenticated: !!(req.session && req.session.user),
        user: req.session && req.session.user ? req.session.user : null,
        requestId: req.id
    });
});

router.post("/logout",(req,res,next) =>{
    if(!req.session.user) return res.json({ok:true,message:"Nessuna sessione avviata"});

    req.session.destroy((err) =>{
        if(err) return next(err);
        res.clearCookie("connect.sid");
        res.json({ok:true,message:"Sessione distrutta",requestId:req.id});
    })
})

module.exports = router;