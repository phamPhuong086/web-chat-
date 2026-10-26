/**
 * @file Room.js
 * @description Schema hội thoại (hỗ trợ cả Chat cá nhân 1-1 và Nhóm chat)
 * @assigned_to Thành viên A
 * 
 * THỐNG NHẤT TRƯỜNG DỮ LIỆU:
 * - name: String (Tên nhóm, nếu là chat 1-1 có thể để rỗng)
 * - isGroup: Boolean (false = chat 1-1, true = nhóm)
 * - avatar: String (Ảnh đại diện nhóm)
 * - description: String (Mô tả nhóm)
 * - creator: ObjectId ref 'User' (Người tạo nhóm / Trưởng nhóm)
 * - members: [ObjectId ref 'User'] (Danh sách thành viên)
 * - createdAt: Date
 * 
 * CẦN THÊM GÌ:
 * - Index cho mảng members để query danh sách phòng nhanh hơn.
 * - Validation số lượng thành viên khi tạo phòng 1-1 (tối đa 2) hoặc nhóm (>= 2).
 */

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
