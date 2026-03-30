"use strict";

require("dotenv").config();
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

// Simulazione DB in memoria
const utenti = [];

const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";
console.log(">>> CALLBACK URL:", callbackURL);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("Nessuna email dal profilo Google"));

            let user = utenti.find(u => u.google_id === profile.id || u.email === email);

            if (!user) {
                // Utente nuovo: non lo salvo ancora, aspetto la password
                user = {
                    id: null,
                    email,
                    google_id: profile.id,
                    nome: profile.displayName,
                    ruolo: "user",
                    password: profile.password,
                    nuovoUtente: true,
                };
            }

            return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.nuovoUtente ? JSON.stringify(user) : user.id);
});

passport.deserializeUser((data, done) => {
    if (typeof data === "string" && data.startsWith("{")) {
        return done(null, JSON.parse(data));
    }
    const user = utenti.find(u => u.id === data);
    done(null, user || false);
});

module.exports = { passport, utenti };