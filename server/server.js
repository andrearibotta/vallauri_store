"use strict"


const https = require("https");
const fs = require("fs");
const path = require("path");
const app = require("./app");

const PORT = process.env.PORT || 3000;

/*const options = {
  cert: fs.readFileSync(path.join(__dirname,"certs","server.crt")),
  key: fs.readFileSync(path.join(__dirname,"certs","server.key"))
} */

/*https.createServer(options,app).listen(PORT,() =>{
  console.log(`Server HTTPS avviato su https://localhost:${PORT}`);
})*/

app.listen(PORT,() =>{
  console.log(`Server HTTPS avviato su https://localhost:${PORT}`);
})
