"use strict";
const jwt = require('jsonwebtoken');
const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const db = require("../db/mysql");
const verifyToken = require("../middleware/verifyToken");
const passwordHash = require('../middleware/passwordHash');

// ─── Login classico ──────────────────────────────────────────────────────────
router.post("/login", async(req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: "Email e password obbligatori", requestId: req.id });
        }

        const userq = await db.query(
            "SELECT * FROM utente WHERE email = ? LIMIT 1",
            [email]
        )
        const user = userq[0]
        if (!user) {
            return res.status(401).json({ error: "Credenziali non valide", requestId: req.id });
        }

        const hashed = passwordHash(password);

        if (user.password_hash !== hashed) {
            return res.status(401).json({ error: "Credenziali non valide", requestId: req.id });
        }

        const payload = {
            id: user.id_utente,
            email: user.email,
            nome: user.nome,
            cognome: user.cognome,
            idClasse : user.id_classe
        }

        const secretKey = process.env.JWT_SECRET || 'segreto_di_sviluppo';
        const token = jwt.sign(payload, secretKey, {expiresIn:'1d'});

        res.cookie('token_accesso',token,{
            httpOnly:true,
            sameSite:'lax',
            secure:false,
            maxAge:1000*60*60*24
        })

        return res.status(200).json({ user: payload });

    } catch (err) {
        next(err);
    }
});

router.post("/register",async(req,res,next) =>{
    try{

        const {nome,cognome,email,password,idClasse} = req.body.data;
    
        if(!nome || !cognome || !email || !password || !idClasse){
            return res.status(400).json({err:'Dati Mancanti'});
        }
        const rows = await db.query(
           "SELECT * FROM utente WHERE email = ? LIMIT 1",
            [email]
        )
        if(rows.length !== 0){
            return res.status(400).json({err:'Email gia registrata'})
        }
        const hashed = passwordHash(password)
    
        const result = await db.query(
            "INSERT INTO utente (nome, cognome, email,password_hash,id_classe ) VALUES(?,?,?,?,?)",
            [nome, cognome, email,hashed,idClasse]
        )
    
        return res.status(200).json({result:result});
    }
    catch(err){
        next(err);
    }
})

// ─── Google OAuth ────────────────────────────────────────────────────────────

router.get(
    "/google/insert",
    passport.authenticate("google", { scope: ["profile", "email"]})
);

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"]})
);

router.get("/google/callback",
    passport.authenticate('google', { session: false }),
    async (req, res, next) => { // <── Aggiungi async qui per poter usare await sul DB
        try {
            console.log("Dati arrivati da Passport:", req.user);

            // 1. CERCA L'UTENTE NEL DB TRAMITE EMAIL
            const rows = await db.query(
                "SELECT id_utente FROM utente WHERE email = ? LIMIT 1",
                [req.user.email]
            );

            let utenteId;

            if (rows.length > 0) {
                // L'utente esiste già, prendiamo il suo ID dal database
                utenteId = rows[0].id_utente;
            } else {
                // L'utente è nuovo, lo inseriamo nel DB (senza password per ora, o gestisci il tuo stato register)
                const result = await db.query(
                    "INSERT INTO utente (nome, cognome, email, google_id) VALUES (?, ?, ?, ?)",
                    [req.user.nome, req.user.cognome, req.user.email, req.user.google_id]
                );
                utenteId = result.insertId; // Prendiamo l'ID appena generato dal database
            }

            // 2. ORA IL PAYLOAD HA SICURAMENTE L'ID REALE DEL DATABASE
            const payload = {
                id: utenteId, // <── Adesso c'è al 100%!
                email: req.user.email,
                nome: req.user.nome,
                cognome: req.user.cognome,
                google_id: req.user.google_id
            };

            const secretKey = process.env.JWT_SECRET || "segreto_di_sviluppo";
            const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

            res.cookie('token_accesso', token, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 1000 * 60 * 60 * 24
            });

            if (req.user.state === "register") {
                let data = {};
                res.render("index", data);
            } else {
                res.redirect(process.env.FRONTEND_URL);
            }
        } catch (err) {
            next(err);
        }
    });

router.get("/google/failure",(req, res) => {
    res.status(401).json({ error: "Autenticazione Google fallita", requestId: req.id });
});

// ─── Completa registrazione ──────────────────────────────────────────────────

router.post("/completa-registrazione", verifyToken(), async (req, res, next) => {
    try {
        const { password } = req.body;

        // ✅ Controlli PRIMA di fare qualsiasi cosa
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "La password deve essere di almeno 6 caratteri" });
        }

        const pending = req.user;
        if (!pending) {
            return res.status(400).json({ error: "Nessuna registrazione in corso o sessione scaduta" });
        }

        // ✅ Hash della password fatto correttamente
        const hashed = passwordHash(password);

        // ✅ Query al DB con la password hashata
        const result = await db.query(
            "INSERT INTO utente (nome, cognome, email, google_id, password_hash) VALUES(?,?,?,?,?)",
            [pending.nome, pending.cognome, pending.email, pending.google_id, hashed]
        );

        // ✅ JWT creato DOPO l'inserimento
        const payload = {
            id: result.insertId,
            email: pending.email,
            nome: pending.nome,
            cognome: pending.cognome,
            google_id: pending.google_id
        };

        const secretKey = process.env.JWT_SECRET || "segreto_di_sviluppo";
        const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

        res.cookie('token_accesso', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        });

        // ✅ Una sola risposta, alla fine
        return res.json({ ok: true, message: "Registrazione completata", user: payload });

    } catch (err) {
        next(err);
    }
});

// ─── Utente corrente ─────────────────────────────────────────────────────────

router.get("/me", verifyToken() ,(req, res) => {
    res.json({
        authenticated: true,
        user: req.user,
        requestId: req.id,
    });
});

// ─── Logout ──────────────────────────────────────────────────────────────────

router.post("/logout", (req, res, next) => {
    res.clearCookie('token_accesso');
    res.json({ ok: true, message: "Logout effettuato con successo", requestId: req.id });
});

module.exports = router;