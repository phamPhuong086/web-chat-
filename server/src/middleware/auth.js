/**
 * @file auth.js
 * @description Middleware xác thực JWT token cho các REST API được bảo vệ
 * @assigned_to Thành viên A
 * 
 * THỐNG NHẤT:
 * - Header gửi lên: "Authorization: Bearer <token>"
 * - Khi xác thực thành công, gán thông tin user vào: req.user = { id, username }
 * - Khi xác thực thất bại: trả về HTTP status 401 (Unauthorized) hoặc 403 (Forbidden)
 * 
 * CẦN THÊM GÌ:
 * - Kiểm tra header Authorization có tồn tại và đúng định dạng Bearer hay không.
 * - Sử dụng jwt.verify(token, process.env.JWT_SECRET) để giải mã.
 * - Gán req.user = decoded; gọi next();
 * - Bắt lỗi TokenExpiredError hoặc JsonWebTokenError để phản hồi thông báo cụ thể.
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không tìm thấy token xác thực hoặc sai định dạng" });
  }

  const token = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET || "your_super_secret_jwt_key_here";

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    req.user = decoded; // { id, username, ... }
    next();
  });
};

module.exports = { authMiddleware };
