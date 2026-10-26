/**
 * @file User.js
 * @description Schema người dùng, thông tin cá nhân và lưu trữ Public Key E2EE
 * @assigned_to Thành viên A
 * 
 * THỐNG NHẤT TRƯỜNG DỮ LIỆU:
 * - username: String (bắt buộc, unique)
 * - password: String (đã băm bằng bcryptjs)
 * - avatar: String (URL ảnh hoặc base64, mặc định "")
 * - bio: String (tiểu sử cá nhân, mặc định "")
 * - hobbies: [String] (danh sách sở thích)
 * - birthday: Date (ngày sinh)
 * - isOnline: Boolean (trạng thái online, mặc định false)
 * - friends: [ObjectId ref 'User'] (danh sách ID bạn bè)
 * - publicKey: String (Khóa công khai dùng cho E2EE - phục vụ thành viên B)
 * 
 * CẦN THÊM GÌ:
 * - Hoàn thiện các validation (độ dài username, email nếu cần).
 * - Cung cấp helper method nếu cần (như ẩn mật khẩu khi return toJSON).
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    hobbies: {
      type: [String],
      default: [],
    },
    birthday: {
      type: Date,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Dành cho Thành viên B phục vụ mã hóa E2EE:
    publicKey: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
