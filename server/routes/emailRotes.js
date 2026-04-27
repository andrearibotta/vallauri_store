const express = require('express');
const router = express.Router();

const{sendContantEmail,sendCustomEmail} = require('../controller/emailController');

router.post("/conntact",sendContantEmail);

router.post("/send",sendCustomEmail);

module.exports = router;