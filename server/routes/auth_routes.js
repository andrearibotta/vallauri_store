"use strict";
const jwt = require('jsonwebtoken');
const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const db = require("../db/mysql");
const verifyToken = require("../middleware/verifyToken");
const passwordHash = require('../middleware/passwordHash');
const crypto = require('crypto');
const { sendEmail } = require('../lib/emailService');

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

        const {nome,cognome,email,password} = req.body.data;
    
        if(!nome || !cognome || !email || !password){
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
            "INSERT INTO utente (nome, cognome, email,password_hash) VALUES(?,?,?,?)",
            [nome, cognome, email,hashed]
        )
        const payload = {
            id:result.insertId,
            email: email,
            nome: nome,
            cognome: cognome,
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
                google_id: req.user.google_id,
                state: req.user.state
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

        // req.user viene popolato dal middleware verifyToken() leggendo il cookie 'token_accesso'
        const pending = req.user; 
        
        if (!pending || !pending.email) {
            return res.status(400).json({ error: "Nessuna registrazione in corso o sessione scaduta" });
        }

        // ✅ Hash della password fatto correttamente
        const hashed = passwordHash(password);

        // ✅ MODIFICA QUI: Trasformato da INSERT a UPDATE usando l'email del token
        await db.query(
            "UPDATE utente SET password_hash = ? WHERE email = ?",
            [hashed, pending.email]
        );

        // ✅ Ricreiamo il JWT includendo anche i vecchi dati, pronti per l'uso
        const payload = {
            id: pending.id, // L'id dell'utente salvato precedentemente nella callback di Google
            email: pending.email,
            nome: pending.nome,
            cognome: pending.cognome,
            google_id: pending.google_id,
            state: pending.state
        };

        const secretKey = process.env.JWT_SECRET || "segreto_di_sviluppo";
        const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

        // Aggiorniamo il cookie con il payload definitivo (opzionale se i campi base non sono cambiati, ma consigliato)
        res.cookie('token_accesso', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // Imposta a true in produzione con HTTPS
            maxAge: 1000 * 60 * 60 * 24
        });

        // ✅ Una sola risposta di successo
        return res.json({ ok: true, message: "Registrazione completata con successo", user: payload });

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

router.get("/forgot-password", (req, res) => {
    res.render("forgot-password.pug", { error: null, success: null });
});

router.post("/forgot-password", async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.render("forgot-password", {
                error: "Inserisci un'email valida.",
                success: null
            });
        }

        const rows = await db.query(
            "SELECT id_utente, nome FROM utente WHERE email = ? LIMIT 1",
            [email]
        );
        const user = rows[0];

        // Risposta sempre neutra: non rivela se l'email esiste
        if (!user) {
            return res.render("forgot-password", {
                error: null,
                success: "Se l'email è registrata riceverai il codice a breve."
            });
        }

        // Genera codice 6 cifre e scadenza 15 minuti
        const code   = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
            "UPDATE utente SET reset_code = ?, reset_code_expiry = ? WHERE id_utente = ?",
            [code, expiry, user.id_utente]
        );

        // Usa il tuo emailService già funzionante
        await sendEmail(
            email,
            "Recupero password — VallauriStore",
            `
            <div style="font-family: sans-serif; max-width: 420px; margin: auto;">
                <h2>Ciao ${user.nome}!</h2>
                <p>Hai richiesto il recupero della tua password su <strong>VallauriStore</strong>.</p>
                <p>Il tuo codice di verifica è:</p>
                <div style="
                    font-size: 2.5rem;
                    font-weight: bold;
                    letter-spacing: 12px;
                    text-align: center;
                    background: #f4f4f4;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    color: #222;
                ">
                    ${code}
                </div>
                <p>Il codice è valido per <strong>15 minuti</strong>.</p>
                <p style="color: #888; font-size: 0.85rem;">
                    Se non hai richiesto il recupero, ignora questa email.
                </p>
            </div>
            `,
            `Il tuo codice di recupero password è: ${code} (valido 15 minuti)`
        );

        // Salva l'email in un cookie firmato temporaneo (niente sessioni, coerente col tuo stack)
        const resetToken = jwt.sign(
            { email, purpose: 'reset' },
            process.env.JWT_SECRET || 'segreto_di_sviluppo',
            { expiresIn: '15m' }
        );

        res.cookie('reset_token', resetToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 15 * 60 * 1000 // 15 minuti
        });

        return res.render("verify-code", {
            error: null,
            success: "Codice inviato! Controlla la tua email."
        });

    } catch (err) {
        next(err);
    }
});

// ─── Verify Code ─────────────────────────────────────────────────────────────
router.get("/verify-code", (req, res) => {
    // Controlla che il cookie reset_token esista
    if (!req.cookies?.reset_token) {
        return res.redirect("forgot-password");
    }
    res.render("verify-code", { error: null });
});

router.post("/verify-code", async (req, res, next) => {
    try {
        const resetToken = req.cookies?.reset_token;
        if (!resetToken) return res.redirect("forgot-password");

        // Verifica e decodifica il cookie JWT temporaneo
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'segreto_di_sviluppo');
        } catch (e) {
            res.clearCookie('reset_token');
            return res.redirect("api/auth/forgot-password");
        }

        if (decoded.purpose !== 'reset') return res.redirect("/forgot-password");

        const { code } = req.body;
        const email = decoded.email;

        const rows = await db.query(
            "SELECT reset_code, reset_code_expiry FROM utente WHERE email = ? LIMIT 1",
            [email]
        );
        const user = rows[0];

        if (!user || !user.reset_code) {
            return res.render("verify-code", {
                error: "Nessun codice attivo. Richiedi un nuovo codice."
            });
        }

        // Controlla scadenza
        if (new Date() > new Date(user.reset_code_expiry)) {
            await db.query(
                "UPDATE utente SET reset_code = NULL, reset_code_expiry = NULL WHERE email = ?",
                [email]
            );
            res.clearCookie('reset_token');
            return res.render("verify-code", {
                error: "Il codice è scaduto. Richiedi un nuovo codice."
            });
        }

        // Controlla il codice
        if (code.trim() !== user.reset_code) {
            return res.render("verify-code", {
                error: "Codice errato. Ricontrolla l'email e riprova."
            });
        }

        // ✅ Codice corretto — emette un nuovo cookie con verified: true
        const verifiedToken = jwt.sign(
            { email, purpose: 'reset', verified: true },
            process.env.JWT_SECRET || 'segreto_di_sviluppo',
            { expiresIn: '15m' }
        );

        res.clearCookie('reset_token');
        res.cookie('reset_verified_token', verifiedToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 15 * 60 * 1000
        });

        return res.redirect("reset-password");

    } catch (err) {
        next(err);
    }
});

// ─── Reset Password ───────────────────────────────────────────────────────────
router.get("/reset-password", (req, res) => {
    if (!req.cookies?.reset_verified_token) {
        return res.redirect("/forgot-password");
    }

    // Verifica che il token sia valido
    try {
        const decoded = jwt.verify(
            req.cookies.reset_verified_token,
            process.env.JWT_SECRET || 'segreto_di_sviluppo'
        );
        if (!decoded.verified) return res.redirect("/forgot-password");
    } catch (e) {
        return res.redirect("/forgot-password");
    }

    res.render("reset-password", { error: null });
});

router.post("/reset-password", async (req, res, next) => {
    try {
        const verifiedToken = req.cookies?.reset_verified_token;
        if (!verifiedToken) return res.redirect("/forgot-password");

        let decoded;
        try {
            decoded = jwt.verify(verifiedToken, process.env.JWT_SECRET || 'segreto_di_sviluppo');
        } catch (e) {
            res.clearCookie('reset_verified_token');
            return res.redirect("/forgot-password");
        }

        if (!decoded.verified || decoded.purpose !== 'reset') {
            return res.redirect("/forgot-password");
        }

        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.render("reset-password", { error: "Compila entrambi i campi." });
        }

        if (password !== confirmPassword) {
            return res.render("reset-password", { error: "Le password non coincidono." });
        }

        if (password.length < 6) {
            return res.render("reset-password", {
                error: "La password deve essere di almeno 6 caratteri."
            });
        }

        // Usa il tuo passwordHash, identico al login/register
        const hashed = passwordHash(password);

        await db.query(
            `UPDATE utente 
             SET password_hash = ?, reset_code = NULL, reset_code_expiry = NULL 
             WHERE email = ?`,
            [hashed, decoded.email]
        );

        // Pulizia cookie temporanei
        res.clearCookie('reset_verified_token');

        // Redirect al login (adatta il path al tuo frontend)
        return res.redirect("http://localhost:4200");

    } catch (err) {
        next(err);
    }
});

module.exports = router;