"use strict";
const express = require("express");
const router = express.Router();
const db = require('../db/mysql');
const passwordHashed = require('../middleware/passwordHash')

router.get('/getAllUser', async (req, res) => {
    try {
        const row = await db.query('SELECT * FROM utente');
        return res.status(200).json({ user: row });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/getProfilo/:id', async (req, res) => {
    const idUtente = req.params.id; // Recupera l'ID dinamicamente dall'URL (es. /getProfilo/1)
    console.log("idutente: " + idUtente)

    try {
        // Eseguiamo le 3 query in parallelo per prestazioni ottimali
        const [statsRows, recensioniRows, annunciRows] = await Promise.all([
            //statistiche e dati utente (Risolto il problema delle Join con sotto-query)
            db.query(`
                SELECT 
                    u.id_utente, u.nome, u.cognome, u.email,
                    (SELECT COUNT(*) FROM prodotto WHERE id_venditore = u.id_utente) AS annunci_pubblicati,
                    (SELECT COUNT(*) FROM venduto v JOIN prodotto p ON v.id_prodotto = p.id_prodotto WHERE p.id_venditore = u.id_utente) AS vendite_concluse,
                    (SELECT IFNULL(ROUND(AVG(voto), 1), 0.0) FROM recensioni WHERE id_destinatario = u.id_utente) AS valutazione_media,
                    (SELECT IFNULL(SUM(p.prezzo), 0.00) FROM venduto v JOIN prodotto p ON v.id_prodotto = p.id_prodotto WHERE p.id_venditore = u.id_utente) AS guadagnati
                FROM utente u
                WHERE u.id_utente = ?
            `, [idUtente]),

            //ultime 3 recensioni ricevute con iniziale del mittente
            db.query(`
                SELECT 
                    r.id_rec,
                    UPPER(LEFT(m.nome, 1)) AS iniziale,
                    CONCAT(m.nome, ' ', LEFT(m.cognome, 1), '.') AS nome,
                    r.voto AS stelle,
                    r.commento AS testo
                FROM recensioni r
                JOIN utente m ON r.id_mittente = m.id_utente
                WHERE r.id_destinatario = ?
                ORDER BY r.id_rec DESC
                LIMIT 3
            `, [idUtente]),

            // tutti gli annunci dell'utente (Attivi e Venduti)
            db.query(`
                SELECT 
                    p.id_prodotto, p.id_categoria, p.nome, p.prezzo, p.descrizione,
                    CASE WHEN v.id_venda IS NOT NULL THEN 'venduto' ELSE 'attivo' END AS stato,
                    (SELECT url_img FROM immagini_prodotto ip WHERE ip.id_prodotto = p.id_prodotto LIMIT 1) AS immagine_url,
                    (SELECT COUNT(*) FROM preferiti pref WHERE pref.id_prodotto = p.id_prodotto) AS visite
                FROM prodotto p
                LEFT JOIN venduto v ON p.id_prodotto = v.id_prodotto
                WHERE p.id_venditore = ?
                ORDER BY p.data_pubblicazione DESC
            `, [idUtente])
        ]);

        // Se l'utente non esiste, restituisci 404
        if (!statsRows || statsRows.length === 0) {
            return res.status(404).json({ message: "Utente non trovato" });
        }

        const utenteData = statsRows[0];

        // Mappiamo gli annunci per aggiungere i campi grafici che servono al tuo HTML/CSS
        const annunciFormattati = annunciRows.map(a => {
            // Assegna icone e gradienti in base all'id_categoria del tuo DB
            let icon = 'bi-grid';
            let gradientClass = 'bg-gradient-blue';

            if (a.id_categoria === 5) { icon = 'bi-book'; gradientClass = 'bg-gradient-orange'; } // Libri
            else if (a.id_categoria === 6) { icon = 'bi-laptop'; gradientClass = 'bg-gradient-dark'; } // Elettronica
            else if (a.id_categoria === 7) { icon = 'bi-mortarboard'; gradientClass = 'bg-gradient-green'; } // Ripetizioni
            else if ([1, 2, 3, 4].includes(a.id_categoria)) { icon = 'bi-tags'; gradientClass = 'bg-gradient-purple'; } // Abbigliamento/Accessori

            return {
                ...a,
                condizione: a.stato === 'venduto' ? 'Venduto' : 'Disponibile',
                condClass: a.stato === 'venduto' ? 'badge-danger' : 'badge-success',
                gradientClass: gradientClass,
                icon: icon
            };
        });

        // Costruiamo la risposta JSON finale perfettamente strutturata per Angular
        const profiloCompleto = {
            id_utente: utenteData.id_utente,
            nome: utenteData.nome,
            cognome: utenteData.cognome,
            email: utenteData.email,
            scuola: "IIS G. Vallauri", // Dato fisso o implementabile nel DB in futuro
            citta: "Fossano",        // Dato fisso o implementabile nel DB in futuro
            stats: {
                annunci_pubblicati: utenteData.annunci_pubblicati,
                vendite_concluse: utenteData.vendite_concluse,
                annunci_attivi: utenteData.annunci_pubblicati - utenteData.vendite_concluse,
                valutazione: utenteData.valutazione_media,
                guadagnati: utenteData.guadagnati
            },
            recensioni: recensioniRows,
            annunci: annunciFormattati
        };

        return res.status(200).json(profiloCompleto);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Errore interno del server" });
    }
});

router.post('/caricaProdotto',async(req,res,next) =>{
    const {id_venditore,id_categoria,nome,descrizione,prezzo,data_pubblicazione} = req.body;
    if(!id_venditore || !id_categoria || !nome || !descrizione || !prezzo || !data_pubblicazione){
        return res.status(400).json({err: "Dati mancanti"})
    }
    const result = await db.query(
        `INSERT INTO prodotto (id_venditore, id_categoria, nome, descrizione, prezzo, data_pubblicazione) VALUES (?,?,?,?,?,?)`,
        [id_venditore,id_categoria,nome,descrizione,prezzo,data_pubblicazione]
    )
    return res.status(200).json({ok:true,result:result});
})

router.post('/modificaProfilo',async(req,res,next) =>{
    const {id_utente,nome,cognome,passwordNuova,PasswordVecchia,email} = req.body;
    if(!id_utente || !nome || !cognome || !passwordNuova || !PasswordVecchia || !email){
        return res.status(400).json({err:"Dati Mancanti o sbagliati"})
    }

    const rows = await db.query(
        `SELECT password_hash FROM utente WHERE id_utente = ?`,
        [id_utente]
    )

    if (rows.length === 0) {
        return res.status(404).json({ err: "Utente non trovato" });
    }
    
    const hased = passwordHashed(PasswordVecchia)

    console.log(hased)
    console.log(rows[0].password_hash)

    if(rows[0].password_hash !== hased){
        return res.status(400).json({err:" Passwrod vecchia sbagliata "})
    }

    const newPasswordHased = passwordHashed(passwordNuova);

    const result = await db.query(
        `UPDATE utente 
        SET nome = ?, cognome = ?, password_hash = ?, email = ? 
        WHERE id_utente = ?`,
        [nome,cognome,newPasswordHased,email,id_utente]
    )

    return res.status(200).json({ok:true})
})

module.exports = router;