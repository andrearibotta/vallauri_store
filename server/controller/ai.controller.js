const Groq = require("groq-sdk");
const { query } = require("../db/mysql"); // adatta il path al tuo progetto

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatHistories = {};

// ──────────────────────────────────────────────
// Ricerca prodotti nel DB
// ──────────────────────────────────────────────
async function searchProducts(keyword) {
  return await query(
    `SELECT p.id_prodotto, p.descrizione, p.prezzo,
            u.nome AS venditore, c.nomeCategoria AS categoria
     FROM prodotto p
     JOIN utente u ON p.id_venditore = u.id_utente
     JOIN categorie c ON p.id_categoria = c.id_categoria
     WHERE p.descrizione LIKE ?
     LIMIT 10`,
    [`%${keyword}%`]
  );
}

// ──────────────────────────────────────────────
// Estrae keyword dal messaggio utente
// Ritorna null se il messaggio non riguarda prodotti
// ──────────────────────────────────────────────
async function extractKeyword(message) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.0,
    max_tokens: 60,
    messages: [
      {
        role: "system",
        content: `Sei un estrattore di parole chiave. 
Analizza il messaggio e rispondi SOLO con un oggetto JSON valido.
Se l'utente cerca prodotti, articoli, lezioni o materiale: {"keyword": "parola_chiave"}
Se è una domanda generica o saluto: {"keyword": null}
NON aggiungere altro testo, solo il JSON.`,
      },
      { role: "user", content: message },
    ],
  });

  try {
    const raw = response.choices[0].message.content.trim();
    // Rimuove eventuali backtick o markdown residui
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.keyword || null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// POST /chat
// ──────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, sessionId = "default", systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Messaggio mancante" });
    }

    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    // ── STEP 1: estrai keyword dal messaggio ──
    const keyword = await extractKeyword(message);

    // ── STEP 2: se c'è una keyword, cerca nel DB ──
    let productContext = "";
    let productsList = [];

    if (keyword) {
      try {
        productsList = await searchProducts(keyword);

        if (productsList.length > 0) {
          const list = productsList
            .map(
              (p) =>
                `- [ID ${p.id_prodotto}] ${p.categoria} | €${p.prezzo} | Venditore: ${p.venditore} | ${p.descrizione}`
            )
            .join("\n");
          productContext = `\n\n[PRODOTTI TROVATI NEL DATABASE per "${keyword}":]\n${list}`;
        } else {
          productContext = `\n\n[Nessun prodotto trovato nel database per "${keyword}".]`;
        }
      } catch (dbError) {
        console.error("Errore DB:", dbError.message);
        productContext = "\n\n[Errore nel recupero prodotti dal database.]";
      }
    }

    // ── STEP 3: costruisci i messaggi con il contesto DB ──
    chatHistories[sessionId].push({ role: "user", content: message });

    const messages = [
      {
        role: "system",
        content:
          (systemPrompt ||
            "Sei un assistente per uno store scolastico. " +
            "Aiuta gli utenti a trovare prodotti, lezioni e materiale. " +
            "Rispondi in italiano in modo chiaro e amichevole.") + productContext,
      },
      ...chatHistories[sessionId],
    ];

    // ── STEP 4: risposta finale dell'AI ──
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      messages,
    });

    const reply = completion.choices[0].message.content;
    chatHistories[sessionId].push({ role: "assistant", content: reply });

    return res.json({
      products: productsList,
    });

  } catch (error) {
    console.error("Errore AI:", error.message);
    res.status(500).json({ error: "Errore nella chiamata AI" });
  }
};

// ──────────────────────────────────────────────
// POST /reset
// ──────────────────────────────────────────────
exports.resetChat = (req, res) => {
  const { sessionId = "default" } = req.body;
  chatHistories[sessionId] = [];
  res.json({ message: "Cronologia resettata", sessionId });
};