/**
 * @file database.js
 * @description Cấu hình kết nối cơ sở dữ liệu MongoDB qua Mongoose
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Đọc MONGO_URI từ biến môi trường process.env.MONGO_URI (fallback về mongodb://localhost:27017/chat_app).
 * - Kết nối MongoDB với mongoose.connect().
 * - Xử lý log khi kết nối thành công hoặc in lỗi khi kết nối thất bại.
 */

const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/chat_app";
  try {
    await mongoose.connect(uri);
    console.log("✅ [Database] Đã kết nối MongoDB thành công:", uri);
  } catch (error) {
    console.error("❌ [Database] Lỗi kết nối MongoDB:", error.message);
    // Không thoát process để server vẫn có thể dev test các route độc lập
  }
};

module.exports = { connectDatabase };
