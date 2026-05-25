"use strict";

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

router.post('/getAllContatti',async(req,res,next) =>{
  const {id} = req.body;
  if(!id){
    return res.status(400).json({err:"Mancanza di dati"});
  }

  const rows = await query(
    `SELECT id_utente, nome, cognome 
      FROM utente 
      WHERE id_utente IN (
          SELECT id_destinatario FROM messaggi WHERE id_mittente = ?
          UNION
          SELECT id_mittente FROM messaggi WHERE id_destinatario = ?
      ) AND id_utente != ?;`,
    [id, id, id]
  )

  return res.status(200).json({ok:true,result:rows});
})

module.exports = router;