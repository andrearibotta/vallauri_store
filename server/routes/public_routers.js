// Contenuto temporaneo per public_routes.js, auth_routes.js, db_routes.js, private_routes.js
"use strict";
const express = require("express");
const router = express.Router();
const db = require('../db/mysql');

router.get("/ping",(req,res) =>{
    return res.status(200).json({ok:ok});
})

router.get("/getAllClassi",async(req,res) =>{
    const rows = await db.query(
        "SELECT * FROM classe"
    )

    return res.status(200).json({classe:rows});
})

router.get("/test-sessione",(req,res) =>{
    req.session.user = {
        id:1,
        username:"mario",
        role: "admin"
    };

    res.json({
        ok:true,
        requestId:req.id,
        user:req.session.user,
        sessioneID: req.sessioneID
    });
})

router.get('/get4ProdottiCasuali', async(req,res) =>{
    //const maxResult = await db.query("SELECT MAX(id_prodotto) AS max_id FROM prodotto")
    //const maxId = maxResult[0].max_id
    try{
        const prodotti = await db.query("SELECT * FROM prodotto ORDER BY RAND() LIMIT 4");
        return res.json({ ok: true, prodotti: prodotti });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ ok: false, error: "Errore del server" });
    }
})

router.get('/getProdottoCompleto/:id', async (req, res) => {
    const idProdotto = req.params.id;

    // Controllo di sicurezza sull'ID impaginato
    if (!idProdotto || isNaN(idProdotto)) {
        return res.status(400).json({ ok: false, error: "ID prodotto non valido o mancante" });
    }

    try {
        const querySQL = `
            SELECT 
                p.id_prodotto,
                p.id_venditore,
                p.id_categoria,
                p.id_condizione,
                p.nome AS nome,  -- Nome del prodotto
                p.descrizione,
                p.prezzo,
                p.data_pubblicazione,
                u.nome AS venditoreNome,
                u.cognome AS venditoreCognome,
                u.email AS venditoreEmail
            FROM prodotto p
            INNER JOIN utente u ON p.id_venditore = u.id_utente
            WHERE p.id_prodotto = ?
        `;

        const rows = await db.query(querySQL, [idProdotto]);

        // Se il prodotto non esiste nel DB
        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: "Prodotto non trovato" });
        }

        // Ritorniamo il primo elemento dell'array (il prodotto singolo)
        return res.json(rows[0]);

    } catch (error) {
        console.error("Errore nella query getProdottoCompleto:", error);
        return res.status(500).json({ ok: false, error: "Errore interno del server" });
    }
});

module.exports = router;