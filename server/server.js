"use strict";
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const app = require("./app");
const { query } = require("./db/mysql");

const PORT = process.env.PORT || 3000;

// ── 1. Crea il server HTTP attorno ad Express ──────────────────────────────
const server = http.createServer(app);

// ── 2. Attacca Socket.io ───────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,       // serve per inviare i cookie con la handshake
    methods: ["GET", "POST"],
  },
});

// ── 3. Middleware di autenticazione Socket.io ─────────────────────────────
//      Legge il JWT dallo stesso cookie usato da Express (token_accesso)
io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || "";

  // Estrae token_accesso dal header cookie
  const match = cookieHeader.match(/(?:^|;\s*)token_accesso=([^;]+)/);
  if (!match) {
    return next(new Error("Unauthorized: token mancante"));
  }

  try {
    const secretKey = process.env.JWT_SECRET || "segreto_di_sviluppo";
    const decoded = jwt.verify(decodeURIComponent(match[1]), secretKey);
    socket.user = decoded; // es. { id, email, nome, cognome, ... }
    next();
  } catch (err) {
    next(new Error("Unauthorized: token non valido"));
  }
});

// ── 4. Mappa utenti online: id → socketId ────────────────────────────────
const onlineUsers = new Map();

// ── 5. Logica Socket.io ───────────────────────────────────────────────────
io.on("connection", (socket) => {
  // FORZIAMO L'ID A NUMERO
  const userId = Number(socket.user.id);
  onlineUsers.set(userId, socket.id);
  
  // Aggiungiamo un log per vedere chi c'è davvero online
  console.log(`[Socket] Utente ${userId} connesso. Online ora:`, Array.from(onlineUsers.keys()));

  socket.on("send_message", async (data) => {
    const { id_destinatario, id_prodotto, testo_messaggio } = data;
    const id_mittente = Number(socket.user.id); // FORZIAMO A NUMERO ANCHE QUI

    console.log(`[Socket] Ricevuto messaggio da ${id_mittente} per ${id_destinatario}`);

    if (!id_destinatario || !id_prodotto || !testo_messaggio?.trim()) {
      return socket.emit("message_error", { message: "Dati mancanti nel messaggio" });
    }

    try {
      const result = await query(
        `INSERT INTO messaggi (id_mittente, id_destinatario, id_prodotto, testo_messaggio)
         VALUES (?, ?, ?, ?)`,
        [id_mittente, Number(id_destinatario), Number(id_prodotto), testo_messaggio.trim()]
      );

      const messaggio = {
        id_mess: result.insertId,
        id_mittente: id_mittente,
        id_destinatario: Number(id_destinatario),
        id_prodotto: Number(id_prodotto),
        testo_messaggio: testo_messaggio.trim(),
        timestamp: new Date(),
      };

      const socketDest = onlineUsers.get(Number(id_destinatario));
      if (socketDest) {
        console.log(`[Socket] Consegno a destinatario ${id_destinatario} in tempo reale!`);
        io.to(socketDest).emit("receive_message", messaggio);
      } else {
        console.log(`[Socket] Destinatario ${id_destinatario} offline. Leggerà al prossimo accesso.`);
      }

      socket.emit("message_sent", messaggio);

    } catch (err) {
      console.error("[Socket] Errore send_message:", err);
      socket.emit("message_error", { message: "Errore interno nell'invio" });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log(`[Socket] Utente ${userId} disconnesso`);
  });
});

// Rende io disponibile nei controller Express se serve
app.set("io", io);

// ── 6. Avvio ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`FRONT END: ${process.env.FRONTEND_URL}`);
});