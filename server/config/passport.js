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
        let state = '';

        // ← QUERY 1: cerca se l'utente esiste già
        const rows = await db.query(
            "SELECT * FROM utente WHERE google_id = ? OR email = ? LIMIT 1",
            [google_id, email]
        );

        if(rows[0].google_id === null){
            const result = await db.query(
                "UPDATE utente SET google_id = ? WHERE email = ?",
                [google_id,email]
            )
        }

        // Utente esiste → login
        if(rows.length > 0) {
            state = 'login'
            return done(null, { ...rows[0], nuovoUtente: false ,state});
        }
        else {state = 'register'}
        

        // Utente non esiste → registrazione
        return done(null, {
            email,
            google_id,
            nome,
            cognome,
            nuovoUtente: true,
            state
        });

    } catch(err) {
        return done(err, null);
    }
}));


module.exports = passport;