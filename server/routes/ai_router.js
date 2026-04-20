const express = require("express");
const router = express.Router();
const aiController = require("../controller/ai.controller");

router.post("/chat", aiController.chat);
router.post("/reset", aiController.resetChat);

module.exports = router;