"use strict"
require("dotenv").config();

console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

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
  console.log(`FRONT END: ${process.env.FRONTEND_URL}`);
})
