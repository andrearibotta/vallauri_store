const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Ogni utente ha la sua cronologia in memoria (opzionale)
const chatHistories = {};

exports.chat = async (req, res) => {
  try {
    const { message, sessionId ,systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Messaggio mancante" });
    }

    // Inizializza cronologia sessione se non esiste
    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    // Aggiunge messaggio utente alla cronologia
    chatHistories[sessionId].push({
      role: "user",
      content: message,
    });

    // Costruisce i messaggi con eventuale system prompt
    const messages = [
      {
        role: "system",
        content: systemPrompt || "Sei un assistente utile e rispondi in italiano.",
      },
      ...chatHistories[sessionId],
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
    });

    const reply = completion.choices[0].message.content;

    // Salva risposta nella cronologia
    chatHistories[sessionId].push({
      role: "assistant",
      content: reply,
    });

    res.json({
      reply,
      sessionId,
      usage: completion.usage,
    });

  } catch (error) {
    console.error("Errore AI:", error.message);
    res.status(500).json({ error: "Errore nella chiamata AI" });
  }
};

// Reset cronologia sessione
exports.resetChat = (req, res) => {
  const { sessionId = "default" } = req.body;
  chatHistories[sessionId] = [];
  res.json({ message: "Cronologia resettata", sessionId });
};