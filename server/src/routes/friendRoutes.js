/**
 * @file friendRoutes.js
 * @description API Quản lý danh sách bạn bè, gửi / chấp nhận / từ chối lời mời kết bạn
 * @assigned_to Thành viên A
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { User, FriendRequest } = require("../models");

// GET /api/friends - Lấy danh sách bạn bè của user hiện tại
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "username avatar isOnline bio");
    return res.json(user ? user.friends : []);
  } catch (error) {
    console.error("Lỗi lấy danh sách bạn bè:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// POST /api/friends/request - Gửi lời mời kết bạn
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.body;
    const myId = req.user.id;

    if (!targetId) {
      return res.status(400).json({ message: "Thiếu targetId" });
    }

    if (targetId.toString() === myId.toString()) {
      return res.status(400).json({ message: "Không thể tự kết bạn với chính mình" });
    }

    const me = await User.findById(myId);
    if (me.friends.map(String).includes(targetId)) {
      return res.status(400).json({ message: "Hai người đã là bạn bè" });
    }

    const existingReq = await FriendRequest.findOne({ from: myId, to: targetId, status: "pending" });
    if (existingReq) {
      return res.status(400).json({ message: "Đã gửi lời mời kết bạn rồi" });
    }

    // Nếu người kia đã gửi lời mời cho mình trước đó -> tự động chấp nhận luôn
    const reverseReq = await FriendRequest.findOne({ from: targetId, to: myId, status: "pending" });
    if (reverseReq) {
      reverseReq.status = "accepted";
      await reverseReq.save();
      await User.findByIdAndUpdate(myId, { $addToSet: { friends: targetId } });
      await User.findByIdAndUpdate(targetId, { $addToSet: { friends: myId } });
      return res.json({ message: "Đã kết bạn thành công (chấp nhận lời mời ngược lại)" });
    }

    const newRequest = new FriendRequest({
      from: myId,
      fromUsername: req.user.username,
      to: targetId,
    });
    await newRequest.save();

    return res.status(201).json({ message: "Đã gửi lời mời kết bạn" });
  } catch (error) {
    console.error("Lỗi gửi lời mời kết bạn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// GET /api/friends/requests - Lấy danh sách lời mời kết bạn gửi đến mình
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.user.id, status: "pending" })
      .populate("from", "username avatar isOnline bio")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// POST /api/friends/accept - Chấp nhận lời mời kết bạn
router.post("/accept", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    if (request.to.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền chấp nhận lời mời này" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Lời mời đã được xử lý trước đó" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
    await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });

    return res.json({ message: "Đã chấp nhận kết bạn thành công" });
  } catch (error) {
    console.error("Lỗi chấp nhận kết bạn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// POST /api/friends/reject - Từ chối lời mời kết bạn
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    if (request.to.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền từ chối lời mời này" });
    }

    request.status = "rejected";
    await request.save();

    return res.json({ message: "Đã từ chối lời mời kết bạn" });
  } catch (error) {
    console.error("Lỗi từ chối kết bạn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

// POST /api/friends/unfriend - Hủy kết bạn
router.post("/unfriend", authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.body;
    if (!targetId) {
      return res.status(400).json({ message: "Thiếu targetId" });
    }

    await User.findByIdAndUpdate(req.user.id, { $pull: { friends: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { friends: req.user.id } });

    return res.json({ message: "Đã hủy kết bạn thành công" });
  } catch (error) {
    console.error("Lỗi hủy kết bạn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
});

module.exports = router;
