/**
 * @file callSocket.integration.test.js
 * @description Kiểm thử tích hợp WebRTC Signaling qua Socket.IO
 * @assigned_to Thành viên C
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const { createRequire } = require("node:module");

const { Server } = require("socket.io");

// Sử dụng socket.io-client từ thư mục Frontend
const clientRequire = createRequire(
  path.resolve(__dirname, "../../client/package.json")
);

const { io: Client } = clientRequire("socket.io-client");

// Import Backend WebRTC Signaling
const {
  registerCallSocket,
} = require("../src/sockets/callSocket");


// ==================================================
// 1. Hàm chờ nhận sự kiện Socket.IO
// ==================================================

function waitForEvent(socket, eventName, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timeout: Không nhận được ${eventName}`));
    }, timeout);

    function handler(data) {
      clearTimeout(timer);
      resolve(data);
    }

    socket.once(eventName, handler);
  });
}


// ==================================================
// 2. Hàm tạo Socket.IO Client kiểm thử
// ==================================================

function createTestClient(port, userId, username) {
  return Client(`http://localhost:${port}`, {
    autoConnect: false,
    reconnection: false,

    // Thông tin giả lập chỉ dành cho server kiểm thử
    auth: {
      testUserId: userId,
      testUsername: username,
    },
  });
}


// ==================================================
// 3. Kiểm thử tích hợp WebRTC Signaling
// ==================================================

test("WebRTC Signaling: Kiểm thử tích hợp Socket.IO", async () => {

  // Tạo HTTP Server riêng cho kiểm thử
  const httpServer = http.createServer();

  // Khởi tạo Socket.IO Server
  const io = new Server(httpServer);

  // Đăng ký WebRTC Signaling
  io.on("connection", (socket) => {

    // Giả lập thông tin người dùng đã xác thực
    const { testUserId, testUsername } = socket.handshake.auth;

    socket.userData = {
      id: testUserId,
      username: testUsername,
    };

    // Mỗi người dùng tham gia room riêng
    socket.join(testUserId);

    // Sử dụng module WebRTC Signaling thật
    registerCallSocket(io, socket);
  });

  // Tạo hai client giả lập
  let clientA;
  let clientB;

  try {

    // Khởi động server trên cổng trống do hệ điều hành chọn
    await new Promise((resolve) => {
      httpServer.listen(0, "127.0.0.1", resolve);
    });

    const port = httpServer.address().port;

    console.log(`Socket.IO Test Server: ${port}`);

    // Người dùng A và B
    clientA = createTestClient(port, "userA", "Nam");
    clientB = createTestClient(port, "userB", "Minh");

    // Đợi cả hai người dùng kết nối
    const connectA = waitForEvent(clientA, "connect");
    const connectB = waitForEvent(clientB, "connect");

    clientA.connect();
    clientB.connect();

    await Promise.all([connectA, connectB]);

    console.log("Hai người dùng đã kết nối thành công");


    // ==============================================
    // TEST 1: Gửi WebRTC Offer
    // ==============================================

    const offer = {
      type: "offer",
      sdp: "fake-offer-sdp",
    };

    const incomingCall = waitForEvent(
      clientB,
      "incoming_call"
    );

    clientA.emit("call_offer", {
      targetId: "userB",
      offer,
      callType: "video",
      roomId: "room123",
    });

    const offerData = await incomingCall;

    assert.equal(offerData.callerId, "userA");
    assert.equal(offerData.callerName, "Nam");
    assert.equal(offerData.callType, "video");
    assert.equal(offerData.roomId, "room123");
    assert.deepEqual(offerData.offer, offer);

    console.log("PASS: call_offer");


    // ==============================================
    // TEST 2: Gửi WebRTC Answer
    // ==============================================

    const answer = {
      type: "answer",
      sdp: "fake-answer-sdp",
    };

    const callAnswered = waitForEvent(
      clientA,
      "call_answered"
    );

    clientB.emit("call_answer", {
      callerId: "userA",
      answer,
    });

    const answerData = await callAnswered;

    assert.equal(answerData.answererId, "userB");
    assert.deepEqual(answerData.answer, answer);

    console.log("PASS: call_answer");


    // ==============================================
    // TEST 3: Trao đổi ICE Candidate
    // ==============================================

    const candidate = {
      candidate: "candidate:123456 1 udp 123456 192.168.1.10 5000 typ host",
      sdpMid: "0",
      sdpMLineIndex: 0,
    };

    const iceReceived = waitForEvent(
      clientB,
      "ice_candidate"
    );

    clientA.emit("ice_candidate", {
      targetId: "userB",
      candidate,
    });

    const iceData = await iceReceived;

    assert.equal(iceData.from, "userA");
    assert.deepEqual(iceData.candidate, candidate);

    console.log("PASS: ice_candidate");


    // ==============================================
    // TEST 4: Từ chối cuộc gọi
    // ==============================================

    const callRejected = waitForEvent(
      clientA,
      "call_rejected"
    );

    clientB.emit("call_rejected", {
      callerId: "userA",
    });

    const rejectData = await callRejected;

    assert.equal(rejectData.rejectorId, "userB");
    assert.equal(rejectData.rejectorName, "Minh");

    console.log("PASS: call_rejected");


    // ==============================================
    // TEST 5: Kết thúc cuộc gọi
    // ==============================================

    const callEnded = waitForEvent(
      clientB,
      "call_ended"
    );

    clientA.emit("end_call", {
      targetId: "userB",
    });

    await callEnded;

    console.log("PASS: end_call");

  } finally {

    // ==============================================
    // 4. Dọn dẹp sau kiểm thử
    // ==============================================

    clientA?.disconnect();
    clientB?.disconnect();

    await new Promise((resolve) => {
      io.close(resolve);
    });

    console.log("Đã đóng Socket.IO Test Server");
  }
});