"use strict";

const Groq = require("groq-sdk");
const { query } = require("../db/mysql");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";
const chatHistories = {};

async function getAllProducts() {
  return await query(
   `SELECT * FROM prodotto
     `
  );
}

exports.chat = async (req, res) => {
  try {
    const { message, sessionId = "default", systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Messaggio mancante" });
    }

    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    // Carica prodotti dal DB
    let allProducts = [];
    try {
      allProducts = await getAllProducts();
    } catch (err) {
      console.error("Errore DB:", err.message);
    }

    const catalog = allProducts
      .map((p) => `ID:${p.id_prodotto} [${p.categoria}] €${p.prezzo} - ${p.nome}: ${p.descrizione}`)
      .join("\n");

    chatHistories[sessionId].push({ role: "user", content: message });

    // UNA SOLA CHIAMATA — trova prodotti E risponde
    const messages = [
      {
        role: "system",
        content: (systemPrompt ||
          "Sei un assistente per uno store scolastico italiano. " +
          "Aiuta gli utenti a trovare prodotti, lezioni e materiale. " +
          "Rispondi in italiano in modo chiaro e amichevole.\n\n") +
          `CATALOGO PRODOTTI DISPONIBILI:\n${catalog}\n\n` +
          `ISTRUZIONI:
1. Rispondi alla domanda dell'utente in modo amichevole
2. Se la domanda riguarda prodotti, indica quelli pertinenti usando i loro ID
3. Alla fine della risposta aggiungi SEMPRE una riga così (anche se vuota):
PRODOTTI_IDS: [1,5,12] oppure PRODOTTI_IDS: []`,
      },
      ...chatHistories[sessionId],
    ];

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      messages,
    });

    const rawReply = completion.choices[0].message.content;

    // Estrae gli ID dalla risposta
    const idsMatch = rawReply.match(/PRODOTTI_IDS:\s*\[([^\]]*)\]/);
    const ids = idsMatch && idsMatch[1].trim()
      ? idsMatch[1].split(",").map((id) => parseInt(id.trim())).filter(Boolean)
      : [];

    // Rimuove la riga PRODOTTI_IDS dalla risposta visibile
    const reply = rawReply.replace(/PRODOTTI_IDS:\s*\[[^\]]*\]/g, "").trim();

    // Filtra i prodotti trovati
    const productsList = ids.length > 0
      ? allProducts.filter((p) => ids.includes(p.id_prodotto))
      : [];

    chatHistories[sessionId].push({ role: "assistant", content: reply });

    return res.json({
      products: productsList,
    });

  } catch (error) {
    console.error("Errore AI:", error.message);
    res.status(500).json({ error: "Errore nella chiamata AI", detail: error.message });
  }
};

exports.resetChat = (req, res) => {
  const { sessionId = "default" } = req.body;
  chatHistories[sessionId] = [];
  res.json({ message: "Cronologia resettata", sessionId });
};