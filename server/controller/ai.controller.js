const Groq = require("groq-sdk");
const { query } = require("../db/mysql"); // adatta il path

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatHistories = {};

// ──────────────────────────────────────────────
// Carica tutti i prodotti dal DB
// ──────────────────────────────────────────────
async function getAllProducts() {
  return await query(
    `SELECT p.id_prodotto, p.nome, p.descrizione, p.prezzo,
 u.nome AS venditore, c.nomeCategoria AS categoria
 FROM prodotto p
 JOIN utente u ON p.id_venditore = u.id_utente
 JOIN categorie c ON p.id_categoria = c.id_categoria`
  );
}

// ──────────────────────────────────────────────
// L'AI fa il match semantico tra ricerca e catalogo
// ──────────────────────────────────────────────
async function semanticSearch(userMessage, products) {
  const catalog = products
    .map((p) => `ID:${p.id_prodotto} [${p.categoria}] €${p.prezzo} - ${p.descrizione}`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.0,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `Sei un motore di ricerca semantica per un e-commerce scolastico italiano.
Il tuo unico compito è trovare quali prodotti del catalogo sono pertinenti alla ricerca dell'utente.
 
REGOLE DI MATCHING (applica TUTTE):
- Sinonimi: "t-shirt" = "maglia" = "maglietta" = "felpa"
- Varianti morfologiche: "rosso" = "rossa", "usato" = "usata", "lezione" = "lezioni"
- Concetti correlati: "studiare matematica" → ripetizioni, appunti, libri di matematica
- Traduzioni: "book" = "libro", "lesson" = "lezione", "notes" = "appunti"
- Abbreviazioni: "mate" = "matematica", "info" = "informatica", "elet" = "elettronica"
- Errori di battitura comuni: "matmatica" = "matematica"
 
Rispondi SOLO con JSON valido, nessun altro testo:
- Se trovi prodotti pertinenti: {"ids": [1, 5, 12]}
- Se nessun prodotto è pertinente: {"ids": []}
- Se la ricerca non riguarda prodotti (es. saluti, domande generiche): {"ids": null}`,
      },
      {
        role: "user",
        content: `CATALOGO PRODOTTI:\n${catalog}\n\nRICERCA UTENTE: "${userMessage}"`,
      },
    ],
  });

  try {
    const raw = response.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.ids; // null | [] | [id, id, ...]
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

    // ── STEP 1: carica catalogo e fai il match semantico ──
    let productsList = [];
    let productContext = "";

    try {
      const allProducts = await getAllProducts();
      const matchedIds = await semanticSearch(message, allProducts);

      if (Array.isArray(matchedIds) && matchedIds.length > 0) {
        const idSet = new Set(matchedIds);
        productsList = allProducts.filter((p) => idSet.has(p.id_prodotto));

        const list = productsList
          .map((p) => `- [ID ${p.id_prodotto}] ${p.categoria} | €${p.prezzo} | Venditore: ${p.venditore} | ${p.descrizione}`)
          .join("\n");
        productContext = `\n\n[PRODOTTI PERTINENTI TROVATI NEL DATABASE:]\n${list}`;

      } else if (Array.isArray(matchedIds)) {
        productContext = "\n\n[Nessun prodotto pertinente trovato nel database.]";
      }
      // matchedIds === null → domanda generica, nessun contesto prodotti

    } catch (err) {
      console.error("Errore ricerca semantica:", err.message);
    }

    // ── STEP 2: risposta finale dell'AI ──
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

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      messages,
    });

    const reply = completion.choices[0].message.content;
    chatHistories[sessionId].push({ role: "assistant", content: reply });

    return res.json({
      products: productsList
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