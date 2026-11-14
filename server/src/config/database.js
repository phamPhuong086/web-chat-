/**
 * @file database.js
 * @description Cấu hình kết nối cơ sở dữ liệu MongoDB qua Mongoose
 * @assigned_to Thành viên A
 */

const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/chat_app";

  // Lắng nghe các sự kiện kết nối của Mongoose
  mongoose.connection.on("connected", () => {
    console.log("✅ [Database] Đã kết nối MongoDB thành công:", uri);
  });

  mongoose.connection.on("error", (error) => {
    console.error("❌ [Database] Lỗi kết nối MongoDB:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ [Database] Đã mất kết nối tới MongoDB");
  });

  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error("❌ [Database] Không thể khởi tạo kết nối MongoDB ban đầu:", error.message);
    // Không thoát process để server vẫn có thể dev test các route độc lập
  }
};

// Đóng kết nối an toàn khi tiến trình Node.js dừng (graceful shutdown)
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 [Database] Đã đóng kết nối MongoDB do tiến trình dừng (SIGINT)");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Database] Lỗi khi đóng kết nối MongoDB:", err.message);
    process.exit(1);
  }
});

/**
 * Kiểm tra trạng thái kết nối MongoDB
 * @returns {boolean} true nếu đã kết nối (readyState === 1)
 */
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDatabase, isDatabaseConnected };
