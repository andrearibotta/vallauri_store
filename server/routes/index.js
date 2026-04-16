"use strict"

const express = require("express");

const publicRoutes = require("./public_routers");
const authRoutes = require("./auth_routes");
const dbRoutes = require("./db_routes");
const privateRoutes = require("./private_routes");
const aiRoutes = require("./ai_router");

const requireSession = require("../middleware/requireSessionAuth");

const router = express.Router();

router.use("/",publicRoutes);

router.use("/auth",authRoutes);

router.use("/db", dbRoutes);

router.use("/private",requireSession(),privateRoutes);

router.use("/ai",aiRoutes);

module.exports = router;