/**
 * @file callSocket.js
 * @description Xử lý WebRTC Signaling phục vụ cuộc gọi thoại và gọi video P2P
 * @assigned_to Thành viên C
 * 
 * DANH SÁCH EVENT THỐNG NHẤT:
 * 1. call_offer:
 *    - Client emit: { targetId, offer, callType, roomId }
 *    - Server forward: socket.to(targetId).emit("incoming_call", { callerId, callerName, offer, callType, roomId })
 * 2. call_answer:
 *    - Client emit: { callerId, answer }
 *    - Server forward: socket.to(callerId).emit("call_answered", { answer, answererId })
 * 3. ice_candidate:
 *    - Client emit: { targetId, candidate }
 *    - Server forward: socket.to(targetId).emit("ice_candidate", { candidate, from })
 * 4. call_rejected:
 *    - Client emit: { callerId }
 *    - Server forward: socket.to(callerId).emit("call_rejected", { rejectorId, rejectorName })
 * 5. end_call:
 *    - Client emit: { targetId }
 *    - Server forward: socket.to(targetId).emit("call_ended")
 */

function registerCallSocket(io, socket) {
  const { id: myId, username: myUsername } = socket.userData || {};

  // 1. Người gọi gửi WebRTC Offer
  socket.on("call_offer", ({ targetId, offer, callType, roomId }) => {
    socket.to(targetId).emit("incoming_call", {
      callerId: myId,
      callerName: myUsername,
      offer,
      callType, // "audio" hoặc "video"
      roomId,
    });
  });

  // 2. Người nhận trả lời WebRTC Answer
  socket.on("call_answer", ({ callerId, answer }) => {
    socket.to(callerId).emit("call_answered", {
      answer,
      answererId: myId,
    });
  });

  // 3. Trao đổi ứng viên ICE (ICE Candidates)
  socket.on("ice_candidate", ({ targetId, candidate }) => {
    socket.to(targetId).emit("ice_candidate", {
      candidate,
      from: myId,
    });
  });

  // 4. Từ chối cuộc gọi hoặc hết thời gian 30s
  socket.on("call_rejected", ({ callerId }) => {
    socket.to(callerId).emit("call_rejected", {
      rejectorId: myId,
      rejectorName: myUsername,
    });
  });

  // 5. Kết thúc cuộc gọi
  socket.on("end_call", ({ targetId }) => {
    if (targetId) {
      socket.to(targetId).emit("call_ended");
    }
  });
}

module.exports = { registerCallSocket };
