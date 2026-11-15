// Kiểm thử WebRTC Signaling - Công việc C

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  registerCallSocket,
} = require("../src/sockets/callSocket");

// Tạo Socket.IO giả lập phục vụ kiểm thử
function createMockSocket(userId, username) {
  const handlers = {};
  const emittedEvents = [];

  const socket = {
    userData: {
      id: userId,
      username,
    },

    // Ghi nhận các sự kiện Backend đăng ký
    on(event, callback) {
      handlers[event] = callback;
    },

    // Ghi nhận sự kiện Backend gửi đến người nhận
    to(targetId) {
      return {
        emit(event, data) {
          emittedEvents.push({
            targetId,
            event,
            data,
          });
        },
      };
    },
  };

  return { socket, handlers, emittedEvents };
}

// TEST 1: Kiểm tra gửi lời mời gọi WebRTC
test("call_offer: Chuyển tiếp Offer đến đúng người nhận", () => {
  // Giả lập người gọi A
  const { socket, handlers, emittedEvents } =
    createMockSocket("userA", "Nam");

  // Đăng ký các sự kiện WebRTC
  registerCallSocket(null, socket);

  // Giả lập A gọi video cho B
  const offer = {
    type: "offer",
    sdp: "fake-sdp",
  };

  handlers.call_offer({
    targetId: "userB",
    offer,
    callType: "video",
    roomId: "room123",
  });

  // Kiểm tra Backend đã gửi đúng một sự kiện
  assert.equal(emittedEvents.length, 1);

  // Kiểm tra room người nhận
  assert.equal(emittedEvents[0].targetId, "userB");

  // Kiểm tra tên sự kiện
  assert.equal(emittedEvents[0].event, "incoming_call");

  // Kiểm tra thông tin người gọi
  assert.equal(emittedEvents[0].data.callerId, "userA");

  // Kiểm tra loại cuộc gọi
  assert.equal(emittedEvents[0].data.callType, "video");

  // Kiểm tra nội dung Offer
  assert.deepEqual(emittedEvents[0].data.offer, offer);
});

// TEST 2: Kiểm tra trả lời cuộc gọi WebRTC
test("call_answer: Chuyển tiếp Answer đến đúng người gọi", () => {
  // Giả lập người nhận B
  const { socket, handlers, emittedEvents } =
    createMockSocket("userB", "Minh");

  // Đăng ký các sự kiện WebRTC
  registerCallSocket(null, socket);

  // Giả lập WebRTC Answer của B
  const answer = {
    type: "answer",
    sdp: "fake-answer-sdp",
  };

  // B gửi Answer cho A
  handlers.call_answer({
    callerId: "userA",
    answer,
  });

  // Kiểm tra số sự kiện
  assert.equal(emittedEvents.length, 1);

  // Kiểm tra room người gọi
  assert.equal(emittedEvents[0].targetId, "userA");

  // Kiểm tra tên sự kiện
  assert.equal(emittedEvents[0].event, "call_answered");

  // Kiểm tra ID người trả lời
  assert.equal(emittedEvents[0].data.answererId, "userB");

  // Kiểm tra nội dung Answer
  assert.deepEqual(emittedEvents[0].data.answer, answer);
});

// TEST 3: Kiểm tra chuyển tiếp ICE Candidate
test("ice_candidate: Chuyển tiếp Candidate đến đúng người nhận", () => {
  // Giả lập người gửi A
  const { socket, handlers, emittedEvents } =
    createMockSocket("userA", "Nam");

  // Đăng ký các sự kiện WebRTC
  registerCallSocket(null, socket);

  // Giả lập ICE Candidate
  const candidate = {
    candidate: "candidate:123456 1 udp 123456 192.168.1.10 5000 typ host",
    sdpMid: "0",
    sdpMLineIndex: 0,
  };

  // A gửi ICE Candidate cho B
  handlers.ice_candidate({
    targetId: "userB",
    candidate,
  });

  // Kiểm tra số sự kiện
  assert.equal(emittedEvents.length, 1);

  // Kiểm tra room người nhận
  assert.equal(emittedEvents[0].targetId, "userB");

  // Kiểm tra tên sự kiện
  assert.equal(emittedEvents[0].event, "ice_candidate");

  // Kiểm tra ID người gửi
  assert.equal(emittedEvents[0].data.from, "userA");

  // Kiểm tra nội dung ICE Candidate
  assert.deepEqual(emittedEvents[0].data.candidate, candidate);
});

// TEST 4: Kiểm tra từ chối cuộc gọi WebRTC
test("call_rejected: Thông báo từ chối đến đúng người gọi", () => {
  // Giả lập người nhận B
  const { socket, handlers, emittedEvents } =
    createMockSocket("userB", "Minh");

  // Đăng ký các sự kiện WebRTC
  registerCallSocket(null, socket);

  // B từ chối cuộc gọi của A
  handlers.call_rejected({
    callerId: "userA",
  });

  // Kiểm tra số sự kiện
  assert.equal(emittedEvents.length, 1);

  // Kiểm tra room người gọi
  assert.equal(emittedEvents[0].targetId, "userA");

  // Kiểm tra tên sự kiện
  assert.equal(emittedEvents[0].event, "call_rejected");

  // Kiểm tra ID người từ chối
  assert.equal(emittedEvents[0].data.rejectorId, "userB");

  // Kiểm tra tên người từ chối
  assert.equal(emittedEvents[0].data.rejectorName, "Minh");
});

// TEST 5: Kiểm tra kết thúc cuộc gọi WebRTC
test("end_call: Thông báo kết thúc đến đúng người nhận", () => {
  // Giả lập người gọi A
  const { socket, handlers, emittedEvents } =
    createMockSocket("userA", "Nam");

  // Đăng ký các sự kiện WebRTC
  registerCallSocket(null, socket);

  // A kết thúc cuộc gọi với B
  handlers.end_call({
    targetId: "userB",
  });

  // Kiểm tra số sự kiện
  assert.equal(emittedEvents.length, 1);

  // Kiểm tra room người nhận
  assert.equal(emittedEvents[0].targetId, "userB");

  // Kiểm tra tên sự kiện
  assert.equal(emittedEvents[0].event, "call_ended");

  // Kiểm tra sự kiện không kèm dữ liệu
  assert.equal(emittedEvents[0].data, undefined);
});

// TEST 6: Không chuyển tiếp Offer khi dữ liệu không hợp lệ
test("call_offer: Từ chối dữ liệu không hợp lệ", () => {
  const { socket, handlers, emittedEvents } =
    createMockSocket("userA", "Nam");

  registerCallSocket(null, socket);

  // Trường hợp 1: Thiếu targetId
  handlers.call_offer({
    offer: { type: "offer", sdp: "fake-sdp" },
    callType: "video",
  });

  // Trường hợp 2: Loại cuộc gọi không hợp lệ
  handlers.call_offer({
    targetId: "userB",
    offer: { type: "offer", sdp: "fake-sdp" },
    callType: "invalid",
  });

  // Trường hợp 3: Dữ liệu null
  handlers.call_offer(null);

  // Không được chuyển tiếp bất kỳ sự kiện nào
  assert.equal(emittedEvents.length, 0);
});