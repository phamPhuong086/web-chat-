/**
 * @file userRoutes.js
 * @description API Quản lý hồ sơ cá nhân, tìm kiếm người dùng và lưu trữ Public Key E2EE
 * @assigned_to Thành viên A
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middleware/auth");
const { User } = require("../models");

// GET /api/users/profile - Lấy thông tin hồ sơ của user đang đăng nhập
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Lỗi lấy thông tin hồ sơ:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// PUT /api/users/profile - Cập nhật thông tin hồ sơ
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { bio, hobbies, birthday, avatar } = req.body;
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (hobbies !== undefined) updateData.hobbies = Array.isArray(hobbies) ? hobbies : [];
    if (birthday !== undefined) updateData.birthday = birthday || null;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    return res.json({ message: "Cập nhật hồ sơ thành công", user });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// PUT /api/users/password - Đổi mật khẩu
router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập cả mật khẩu cũ và mật khẩu mới" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// GET /api/users/search?keyword=abc - Tìm kiếm người dùng theo username
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || !keyword.trim()) {
      return res.json([]);
    }

    const cleanKeyword = keyword.trim();
    const users = await User.find({
      username: { $regex: cleanKeyword, $options: "i" },
      _id: { $ne: req.user.id },
    })
      .select("-password")
      .limit(20);

    return res.json(users);
  } catch (error) {
    console.error("Lỗi tìm kiếm người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// PUT /api/users/public-key - Cập nhật Public Key E2EE
router.put("/public-key", authMiddleware, async (req, res) => {
  try {
    const { publicKey } = req.body;
    await User.findByIdAndUpdate(req.user.id, { publicKey: publicKey || "" });
    return res.json({ message: "Lưu Public Key thành công" });
  } catch (error) {
    console.error("Lỗi lưu public key:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// GET /api/users/:userId/public-key - Lấy Public Key của đối phương
router.get("/:userId/public-key", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("publicKey username");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.json({ userId: user._id, publicKey: user.publicKey || "" });
  } catch (error) {
    console.error("Lỗi lấy public key:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

module.exports = router;
