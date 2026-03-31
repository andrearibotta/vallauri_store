"use strict";
const express = require("express");
const { passport, utenti } = require("../config/passport");
const router = express.Router();

// ─── Login classico ──────────────────────────────────────────────────────────

router.post("/login", (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: "Email e password obbligatori", requestId: req.id });
        }

        const user = utenti.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: "Credenziali non valide", requestId: req.id });
        }

        if (!user.password) {
            return res.status(401).json({
                error: "Account Google",
                message: "Questo account è stato creato con Google. Usa il login Google oppure imposta una password.",
                requestId: req.id
            });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Credenziali non valide", requestId: req.id });
        }

        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { id: user.id, email: user.email, role: user.ruolo };
            res.json({ ok: true, message: "Login effettuato", user: req.session.user, requestId: req.id });
        });

    } catch (err) {
        next(err);
    }
});

// ─── Google OAuth ────────────────────────────────────────────────────────────

router.get(
    "/google/insert",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/google/failure" }),
    (req, res) => {
        if (req.user.nuovoUtente) {
            req.session.pendingUser = req.user;
            return res.redirect("/scegli-password.html");
        }

        req.session.user = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.ruolo,
            password: req.user.password,
        };
        res.redirect(process.env.FRONTEND_URL || "/");
    }
);

router.get("/google/failure", (req, res) => {
    res.status(401).json({ error: "Autenticazione Google fallita", requestId: req.id });
});

// ─── Completa registrazione ──────────────────────────────────────────────────

router.post("/completa-registrazione", (req, res) => {
    const { password } = req.body;
    const pending = req.session.pendingUser;

    if (!pending) {
        return res.status(400).json({ error: "Nessuna registrazione in corso", requestId: req.id });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password di almeno 6 caratteri", requestId: req.id });
    }

    // Salvo l'utente in memoria
    const nuovoUtente = {
        id: utenti.length + 1,
        email: pending.email,
        google_id: pending.google_id,
        nome: pending.nome,
        ruolo: "user",
        password,
    };
    utenti.push(nuovoUtente);
    console.log("Nuovo utente salvato in memoria:", nuovoUtente);

    // Pulisco il pending e creo la sessione
    req.session.pendingUser = null;
    req.session.user = {
        id: nuovoUtente.id,
        email: nuovoUtente.email,
        role: nuovoUtente.ruolo,
        password: nuovoUtente.password
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