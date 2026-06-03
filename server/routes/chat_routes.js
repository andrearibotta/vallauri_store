"use strict";

const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const { query } = require("../db/mysql");

// GET /api/chat/:id_destinatario/:id_prodotto
// Restituisce la cronologia messaggi tra l'utente loggato e un altro utente
// relativi a uno specifico prodotto, ordinati per timestamp crescente.
// Richiede: verifyToken applicato in routes/index.js
router.get("/:id_destinatario/:id_prodotto", async (req, res) => {
  const id_mittente = req.user.id;
  const id_destinatario = Number(req.params.id_destinatario);
  const id_prodotto = Number(req.params.id_prodotto);

  if (!id_destinatario || !id_prodotto) {
    return res.status(400).json({ error: "Parametri non validi" });
  }

  try {
    const messaggi = await query(
      `SELECT
         m.id_mess,
         m.id_mittente,
         m.id_destinatario,
         m.id_prodotto,
         m.testo_messaggio,
         m.timestamp,
         u.nome    AS nome_mittente,
         u.cognome AS cognome_mittente
       FROM messaggi m
       JOIN utente u ON u.id_utente = m.id_mittente
       WHERE m.id_prodotto = ?
         AND (
               (m.id_mittente = ? AND m.id_destinatario = ?)
            OR (m.id_mittente = ? AND m.id_destinatario = ?)
         )
       ORDER BY m.timestamp ASC`,
      [id_prodotto, id_mittente, id_destinatario, id_destinatario, id_mittente]
    );

    res.json(messaggi ?? []);
  } catch (err) {
    console.error("[Chat] Errore cronologia:", err);
    res.status(500).json({ error: "Errore nel recupero dei messaggi" });
  }
});

router.post('/getAllContatti', async (req, res, next) => {
  // 1. Recuperiamo il token direttamente dal cookie, proprio come nel socket!
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)token_accesso=([^;]+)/);
  
  let id = null;

  if (match) {
    try {
      const secretKey = process.env.JWT_SECRET || "segreto_di_sviluppo";
      const decoded = jwt.verify(decodeURIComponent(match[1]), secretKey);
      id = decoded.id; // Estrae l'id dell'utente dal JWT sicuro
    } catch (err) {
      return res.status(401).json({ error: "Token non valido o scaduto" });
    }
  }

  // Fallback: se per qualche motivo il cookie non c'è, prova a vedere se è stato passato nel body
  if (!id) id = req.body.id;

  // Se non lo trova in nessun modo, allora dà errore
  if (!id) {
    return res.status(400).json({ err: "Impossibile identificare l'utente" });
  }

  try {
    const rows = await query(
      `SELECT 
        u.id_utente, 
        u.nome, 
        u.cognome,
        p.id_prodotto,
        p.nome AS nomeProdotto,
        p.prezzo,
        m.testo_messaggio AS ultimoMessaggio,
        m.timestamp AS ora
      FROM messaggi m
      JOIN utente u ON (u.id_utente = IF(m.id_mittente = ?, m.id_destinatario, m.id_mittente))
      JOIN prodotto p ON p.id_prodotto = m.id_prodotto
      WHERE m.id_mess IN (
          SELECT MAX(id_mess) 
          FROM messaggi 
          WHERE id_mittente = ? OR id_destinatario = ?
          GROUP BY id_prodotto, IF(id_mittente = ?, id_destinatario, id_mittente)
      )
      ORDER BY m.timestamp DESC`,
      [id, id, id, id]
    );

    return res.status(200).json({ ok: true, result: rows });
  } catch (err) {
    console.error("[Chat] Errore getAllContatti:", err);
    return res.status(500).json({ error: "Errore interno" });
  }
});
// POST /api/chat/invia
// Salva un nuovo messaggio nel database
// Richiede: verifyToken applicato a monte per avere req.user.id
router.post("/invia", async (req, res) => {
  const id_mittente = req.user.id; // Preso dal middleware di autenticazione
  const { id_destinatario, id_prodotto, testo_messaggio } = req.body;

  // Validazione dei dati in ingresso
  if (!id_destinatario || !id_prodotto || !testo_messaggio || testo_messaggio.trim() === "") {
    return res.status(400).json({ error: "Dati mancanti o non validi per l'invio del messaggio" });
  }

  try {
    // Eseguiamo l'inserimento nel database. 
    // NOTA: Se la tua colonna del timestamp si aggiorna da sola con CURRENT_TIMESTAMP, 
    // puoi omettere il campo 'timestamp' dalla query.
    const risultato = await query(
      `INSERT INTO messaggi (id_mittente, id_destinatario, id_prodotto, testo_messaggio, timestamp) 
       VALUES (?, ?, ?, ?, NOW())`,
      [id_mittente, Number(id_destinatario), Number(id_prodotto), testo_messaggio.trim()]
    );

    // Rispondiamo al frontend confermando il salvataggio
    return res.status(201).json({ 
      ok: true, 
      message: "Messaggio inviato con successo",
      id_messaggio: risultato.insertId // Restituisce l'ID del messaggio appena creato
    });

  } catch (err) {
    console.error("[Chat] Errore durante l'invio del messaggio:", err);
    return res.status(500).json({ error: "Errore interno del server durante il salvataggio del messaggio" });
  }
});

module.exports = router;