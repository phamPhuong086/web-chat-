/**
 * @file crypto.js
 * @description Các hàm hỗ trợ mã hóa E2EE (End-to-End Encryption) cho Chat cá nhân 1-1
 * @assigned_to Thành viên B
 * 
 * LUỒNG E2EE DỰ KIẾN:
 * 1. generateKeyPair(): Sinh cặp khóa RSA hoặc ECDH phía client khi người dùng đăng nhập lần đầu.
 * 2. Lưu privateKey vào IndexedDB hoặc localStorage (chỉ client này biết).
 * 3. Gửi publicKey lên server thông qua API: PUT /api/users/public-key (của A).
 * 4. Khi chat với người khác:
 *    - Lấy publicKey của người đó qua API: GET /api/users/:userId/public-key (của A).
 *    - encryptMessage(plainText, recipientPublicKey): Mã hóa trước khi emit send_message qua Socket.
 *    - decryptMessage(cipherText, myPrivateKey): Giải mã khi nhận receive_message từ Socket.
 */

// TODO: [B] Triển khai hàm sinh cặp khóa
export async function generateKeyPair() {
  console.log("TODO: [B] Triển khai sinh cặp khóa Public/Private");
  return { publicKey: "", privateKey: "" };
}

// TODO: [B] Triển khai hàm mã hóa tin nhắn
export async function encryptMessage(plainText, recipientPublicKey) {
  console.log("TODO: [B] Triển khai mã hóa tin nhắn bằng recipientPublicKey");
  return plainText; // Tạm thời trả về plainText để test
}

// TODO: [B] Triển khai hàm giải mã tin nhắn
export async function decryptMessage(cipherText, myPrivateKey) {
  console.log("TODO: [B] Triển khai giải mã tin nhắn bằng myPrivateKey");
  return cipherText;
}
