/**
 * @file index.js
 * @description Master router tập trung kết nối tất cả các route con của dự án
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const friendRoutes = require("./friendRoutes");
const roomRoutes = require("./roomRoutes");
const messageRoutes = require("./messageRoutes");

// Gắn các router con với tiền tố thống nhất
router.use("/auth", authRoutes);       // Phụ trách: A
router.use("/users", userRoutes);     // Phụ trách: A
router.use("/friends", friendRoutes); // Phụ trách: A
router.use("/rooms", roomRoutes);     // Phụ trách: A
router.use("/messages", messageRoutes); // Phụ trách: B

module.exports = router;
