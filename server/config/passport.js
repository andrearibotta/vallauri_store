"use strict";

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
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("Nessuna email dal profilo Google"));

            // Cerca utente in memoria
            let user = utenti.find(u => u.google_id === profile.id);

            if (!user) {
                // Primo accesso: crea utente e salvalo in memoria
                user = {
                    id: utenti.length + 1,
                    email,
                    google_id: profile.id,
                    nome: profile.displayName,
                    ruolo: "user",
                };
                utenti.push(user);
                console.log("Nuovo utente creato:", user);
            }

            return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = utenti.find(u => u.id === id);
    done(null, user || false);
});

module.exports = passport;