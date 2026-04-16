"use strict";
const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const db = require("../db/mysql");

// ─── Login classico ──────────────────────────────────────────────────────────

router.post("/login", async(req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: "Email e password obbligatori", requestId: req.id });
        }

        const user = await db.query(
            "SELECT * FROM utente WHERE email = ? LIMIT 1",
            [email]
        )

        if (!user) {
            return res.status(401).json({ error: "Credenziali non valide", requestId: req.id });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Credenziali non valide", requestId: req.id });
        }

        req.session.user = {
            id: user.id_utente,
            nome: user.nome,
            cognome: user.cognome,
            idClasse : user.id_classe
        }

        return res.redirect(process.env.FRONTEND_URL);

    } catch (err) {
        next(err);
    }
});

// ─── Google OAuth ────────────────────────────────────────────────────────────

router.get(
    "/google/insert",
    passport.authenticate("google", { scope: ["profile", "email"]})
);

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"]})
);

router.get("/google/callback",
     passport.authenticate("google", { failureRedirect: "/api/auth/google/failure" }),
    (req, res) => {
        const state = req.user.state;
        const user = req.user;

        console.log("STATE:", state);
        console.log("USER:", user);

        // CASO: tentativo di LOGIN ma utente non esiste
        if(state === "login" && user.nuovoUtente) {
            return res.redirect(`${process.env.FRONTEND_URL}`);
        }

        // CASO: tentativo di REGISTRAZIONE ma utente esiste già
        if(state === "register" && !user.nuovoUtente) {
            return res.redirect(`${process.env.FRONTEND_URL}`);
        }

        // CASO: LOGIN ok — utente esiste
        if(state === "login" && !user.nuovoUtente) {
            req.session.user = {
                id: user.id_utente,
                email: user.email,
                nome: user.nome,
                cognome: user.cognome,
                role: "user"
            };
            return res.redirect(process.env.FRONTEND_URL);
        }

        // CASO: REGISTRAZIONE ok — utente nuovo
        if(state === "register" && user.nuovoUtente) {
            return res.redirect("/scegli-password.html");
        }
    }
);

router.get("/google/failure", (req, res) => {
    res.status(401).json({ error: "Autenticazione Google fallita", requestId: req.id });
});

// ─── Completa registrazione ──────────────────────────────────────────────────

router.post("/completa-registrazione", async(req, res) => {
    const { password } = req.body;

    // Passport mette i dati direttamente in req.user
    const pending = req.user;

    console.log("REQ.USER:", pending);

    if(!pending) {
        return res.status(400).json({ error: "Nessuna registrazione in corso", requestId: req.id });
    }

    if(!password || password.length < 6) {
        return res.status(400).json({ error: "Password di almeno 6 caratteri", requestId: req.id });
    }

    const rows = await db.query(
        "INSERT INTO utente (nome,cognome,email,google_id,password_hash) VALUES(?,?,?,?,?)",
        [pending.nome,pending.cognome,pending.email,pending.google_id,password]
    )

    req.session.user = {
        id: pending.id,
        email: pending.email,
        role: pending.ruolo,
        password: pending.password
    };

    res.json({ ok: true, message: "Registrazione completata" });
});

// ─── Utente corrente ─────────────────────────────────────────────────────────

router.get("/me", (req, res) => {
    res.json({
        authenticated: !!(req.session && req.session.user),
        user: req.session?.user ?? null,
        requestId: req.id,
    });
});

// ─── Logout ──────────────────────────────────────────────────────────────────

router.post("/logout", (req, res, next) => {
    if (!req.session.user) return res.json({ ok: true, message: "Nessuna sessione avviata" });

    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.json({ ok: true, message: "Sessione distrutta", requestId: req.id });
    });
});

module.exports = router;