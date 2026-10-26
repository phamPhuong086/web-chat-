/**
 * @file Message.js
 * @description Schema tin nhắn, hỗ trợ phản hồi, chỉnh sửa, thu hồi và reaction
 * @assigned_to Thành viên B
 * 
 * THỐNG NHẤT TRƯỜNG DỮ LIỆU:
 * - roomID: ObjectId ref 'Room' (Phòng chat chứa tin nhắn)
 * - sender: String (Username người gửi)
 * - senderId: String / ObjectId (ID người gửi)
 * - text: String (Nội dung văn bản - là chuỗi mã hóa nếu là chat E2EE 1-1)
 * - image: String (URL ảnh hoặc base64, null nếu không có)
 * - replyTo: { _id, sender, text, image } (Thông tin tin nhắn được trả lời)
 * - edited: Boolean (Đánh dấu đã qua chỉnh sửa hay chưa)
 * - editedAt: Date (Thời điểm sửa lần cuối)
 * - deleted: Boolean (Đánh dấu tin nhắn đã thu hồi/xóa hay chưa)
 * - reactions: Map of [String] (Key là emoji, Value là danh sách ID user đã thả)
 * 
 * CẦN THÊM GÌ:
 * - Index theo roomID và createdAt để tối ưu tải lịch sử tin nhắn.
 * - Validation độ dài tin nhắn văn bản.
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: null,
    },
    replyTo: {
      _id: { type: String, default: null },
      sender: { type: String, default: "" },
      text: { type: String, default: "" },
      image: { type: String, default: null },
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    reactions: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
