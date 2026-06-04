const express = require('express');
const router = express.Router();

const{sendContantEmail,sendCustomEmail} = require('../controller/emailController');

router.post("/contact",sendContantEmail);

router.post("/send",sendCustomEmail);

module.exports = router;