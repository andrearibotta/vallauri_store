"use stict"

// Importa express
const express = require('express');
const app = express();
const PORT = 3000;

// Definizione di una route base
app.get('/', (req, res) => {
  res.send('Ciao! Il server Express è attivo e funzionante.');
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
