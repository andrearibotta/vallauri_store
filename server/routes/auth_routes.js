"use strict";
const express = require("express");
const passport = require("passport");
const db = require("../db/mysql");
const router = express.Router();

// ─── Login classico ─────────────────────────────────────────────────────────

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            const err = new Error("Email e password obbligatori");
            err.statusCode = 400;
            throw err;
        }

        const rows = await db.query(
            "SELECT * FROM utenti WHERE email = ? AND password = ?",
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                error: "Credenziali non valide",
                requestId: req.id,
            });
        }

        const user = rows[0];

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

/**
 * GET /api/auth/google
 * Reindirizza l'utente alla schermata di consenso Google.
 */
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * GET /api/auth/google/callback
 * Google reindirizza qui dopo il consenso.
 */
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/google/failure" }),
    (req, res) => {
        // Passport ha già impostato req.user tramite deserializeUser.
        // Sincronizziamo anche req.session.user per compatibilità con il resto del codice.
        req.session.user = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.ruolo,
        };

        // Reindirizza al frontend (cambia l'URL in base alla tua app)
        res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
    }
);

router.get("/google/failure", (req, res) => {
    res.status(401).json({ error: "Autenticazione Google fallita", requestId: req.id });
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