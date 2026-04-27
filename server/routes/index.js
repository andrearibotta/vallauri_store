"use strict"

const express = require("express");

const publicRoutes = require("./public_routers");
const authRoutes = require("./auth_routes");
const dbRoutes = require("./db_routes");
const privateRoutes = require("./private_routes");
const aiRoutes = require("./ai_router");
//const emailRoutes = require('./emailRotes');

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();
router.use("/public",publicRoutes);

router.use("/auth",authRoutes);

router.use("/db", dbRoutes);

router.use("/private",verifyToken(),privateRoutes);

router.use("/ai",aiRoutes);

//router.use("/email",emailRoutes);

module.exports = router;