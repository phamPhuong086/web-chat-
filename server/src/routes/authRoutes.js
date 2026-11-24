/**
 * @file authRoutes.js
 * @description API Đăng ký, Đăng nhập, Đăng xuất tài khoản
 * @assigned_to Thành viên A
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateToken } = require("../middleware/auth");

// POST /api/auth/register - Đăng ký tài khoản mới
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ message: "Tên đăng nhập phải có ít nhất 3 ký tự" });
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: cleanUsername,
      password: hashedPassword,
    });
    await newUser.save();

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công",
      user: {
        id: newUser._id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi đăng ký: " + error.message });
  }
});

// POST /api/auth/login - Đăng nhập tài khoản
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(400).json({ message: "Tên đăng nhập hoặc mật khẩu không chính xác" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Tên đăng nhập hoặc mật khẩu không chính xác" });
    }

    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
    });

    return res.json({
      message: "Đăng nhập thành công",
      token,
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatar || "",
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập: " + error.message });
  }
});

// POST /api/auth/logout - Đăng xuất tài khoản
router.post("/logout", async (req, res) => {
  return res.json({ message: "Đăng xuất thành công" });
});

module.exports = router;
