/**
 * @file FriendRequest.js
 * @description Schema lời mời kết bạn giữa hai người dùng
 * @assigned_to Thành viên A
 * 
 * THỐNG NHẤT TRƯỜNG DỮ LIỆU:
 * - from: ObjectId ref 'User' (Người gửi lời mời)
 * - fromUsername: String (Tên người gửi để hiển thị nhanh)
 * - to: ObjectId ref 'User' (Người nhận lời mời)
 * - status: 'pending' | 'accepted' | 'rejected' (Trạng thái)
 * - createdAt: Date
 * 
 * CẦN THÊM GÌ:
 * - Đảm bảo không tạo trùng lời mời pending giữa 2 user.
 */

const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUsername: {
      type: String,
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FriendRequest", friendRequestSchema);
