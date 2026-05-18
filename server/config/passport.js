"use strict";
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db/mysql");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const google_id = profile.id;
        const nome = profile.name.givenName || "";
        const cognome = profile.name.familyName || "";

        const rows = await db.query(
            "SELECT * FROM utente WHERE google_id = ? OR email = ? LIMIT 1",
            [google_id, email]
        );

        // Utente non esiste → registrazione
        if (rows.length === 0) {
            return done(null, {
                email,
                google_id,
                nome,
                cognome,
                nuovoUtente: true,
                state: "register"
            });
        }

        const utente = rows[0];

        // Esiste per email ma senza google_id → collega account Google
        if (utente.google_id === null) {
            await db.query(
                "UPDATE utente SET google_id = ? WHERE email = ?",
                [google_id, email]
            );
            utente.google_id = google_id;
        }

        // Utente esiste → login
        return done(null, { ...utente, nuovoUtente: false, state: "login" });

    } catch(err) {
        return done(err, null);
    }
}));

module.exports = passport;