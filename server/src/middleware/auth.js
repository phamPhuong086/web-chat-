/**
 * @file auth.js
 * @description Middleware và tiện ích xác thực JWT token cho REST API và Socket.IO
 * @assigned_to Thành viên A
 */

const jwt = require("jsonwebtoken");

const getSecretKey = () => process.env.JWT_SECRET || "your_super_secret_jwt_key_here";

/**
 * Sinh mã JWT Token từ payload (dùng khi đăng nhập, đăng ký)
 * @param {object} payload - Dữ liệu đưa vào token (ví dụ: { id, username })
 * @param {string|number} expiresIn - Thời hạn token (mặc định "7d")
 * @returns {string} Token đã ký
 */
const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, getSecretKey(), { expiresIn });
};

/**
 * Giải mã và kiểm tra tính hợp lệ của JWT Token
 * @param {string} token - Chuỗi token cần kiểm tra
 * @returns {object} Payload giải mã
 */
const verifyToken = (token) => {
  return jwt.verify(token, getSecretKey());
};

/**
 * Middleware bảo vệ các REST API yêu cầu người dùng phải đăng nhập
 * Client gửi token qua Header: "Authorization: Bearer <token>"
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực hoặc sai định dạng (Bearer <token>)",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token xác thực rỗng",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // { id, username, iat, exp, ... }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token xác thực đã hết hạn, vui lòng đăng nhập lại",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Token xác thực không hợp lệ",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Lỗi xác thực người dùng: " + error.message,
    });
  }
};

/**
 * Middleware xác thực tùy chọn:
 * Nếu client có gửi kèm token thì giải mã và gán vào req.user,
 * nếu không gửi thì vẫn cho phép tiếp tục với req.user = null.
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        req.user = verifyToken(token);
      }
    }
  } catch {
    req.user = null;
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  generateToken,
  verifyToken,
};
