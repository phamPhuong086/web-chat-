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
  socket.on("call_offer", (data) => {
    if (!data || typeof data !== "object") return;

    const { targetId, offer, callType, roomId } = data;

    // Kiểm tra dữ liệu cuộc gọi
    if (!myId || !targetId || !offer) {
      console.warn("call_offer: Thiếu thông tin cuộc gọi");
      return;
    }

    // Kiểm tra loại cuộc gọi
    if (callType !== "audio" && callType !== "video") {
      console.warn("call_offer: Loại cuộc gọi không hợp lệ");
      return;
    }

    // Chuyển tiếp lời mời đến người nhận
    socket.to(targetId).emit("incoming_call", {
      callerId: myId,
      callerName: myUsername,
      offer,
      callType,
      roomId,
    });
  });

  // 2. Người nhận trả lời WebRTC Answer
  socket.on("call_answer", (data) => {
    if (!data || typeof data !== "object") return;

    const { callerId, answer } = data;

    // Kiểm tra thông tin người gọi và WebRTC Answer
    if (!myId || !callerId || !answer) {
      console.warn("call_answer: Thiếu thông tin trả lời cuộc gọi");
      return;
    }

    // Chuyển tiếp Answer đến người gọi
    socket.to(callerId).emit("call_answered", {
      answer,
      answererId: myId,
    });
  });

  // 3. Trao đổi ứng viên ICE (ICE Candidates)
  socket.on("ice_candidate", (data) => {
    if (!data || typeof data !== "object") return;

    const { targetId, candidate } = data;

    // Kiểm tra thông tin người nhận và ICE Candidate
    if (!myId || !targetId || !candidate) {
      console.warn("ice_candidate: Thiếu thông tin ICE Candidate");
      return;
    }

    // Chuyển tiếp ICE Candidate đến người nhận
    socket.to(targetId).emit("ice_candidate", {
      candidate,
      from: myId,
    });
  });

  // 4. Từ chối cuộc gọi hoặc hết thời gian 30s
  socket.on("call_rejected", (data) => {
    if (!data || typeof data !== "object") return;

    const { callerId } = data;

    // Kiểm tra thông tin người gọi
    if (!myId || !callerId) {
      console.warn("call_rejected: Thiếu thông tin người gọi");
      return;
    }

    // Thông báo từ chối cuộc gọi đến người gọi
    socket.to(callerId).emit("call_rejected", {
      rejectorId: myId,
      rejectorName: myUsername,
    });
  });

    // 5. Kết thúc cuộc gọi
  socket.on("end_call", (data) => {
    if (!data || typeof data !== "object") return;

    const { targetId } = data;

    // Kiểm tra thông tin người kết thúc và người nhận
    if (!myId || !targetId) {
      console.warn("end_call: Thiếu thông tin kết thúc cuộc gọi");
      return;
    }

    // Thông báo kết thúc cuộc gọi đến đối phương
    socket.to(targetId).emit("call_ended");
  });
}
module.exports = { registerCallSocket };
