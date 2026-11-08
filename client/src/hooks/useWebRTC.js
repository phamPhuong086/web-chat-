/**
 * @file useWebRTC.js
 * @description Custom hook điều khiển kết nối WebRTC P2P và Signaling qua Socket.IO
 * @assigned_to Thành viên C
 * 
 * LUỒNG WEBRTC:
 * 1. startCall(targetId, callType):
 *    - Xin quyền mic/cam qua navigator.mediaDevices.getUserMedia().
 *    - Tạo new RTCPeerConnection(ICE_SERVERS).
 *    - Thêm tracks từ localStream vào peerConnection.
 *    - pc.createOffer() -> pc.setLocalDescription(offer) -> socket.emit("call_offer", { targetId, offer, callType }).
 * 2. Lắng nghe "incoming_call":
 *    - Lưu thông tin cuộc gọi đến vào state incomingCall (hiển thị CallIncomingModal).
 * 3. acceptCall():
 *    - Xin quyền mic/cam -> Tạo RTCPeerConnection -> Thêm tracks.
 *    - pc.setRemoteDescription(offer) -> pc.createAnswer() -> pc.setLocalDescription(answer).
 *    - socket.emit("call_answer", { callerId, answer }).
 * 4. Lắng nghe "call_answered":
 *    - pc.setRemoteDescription(answer).
 * 5. Trao đổi "ice_candidate":
 *    - pc.onicecandidate = (event) => { socket.emit("ice_candidate", { targetId, candidate: event.candidate }) }
 *    - socket.on("ice_candidate", ({ candidate }) => { pc.addIceCandidate(new RTCIceCandidate(candidate)) }).
 * 6. endCall():
 *    - Dừng tất cả media tracks, đóng RTCPeerConnection, socket.emit("end_call").
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ICE_SERVERS } from "../utils/constants";

export default function useWebRTC(socket, currentUserId) {
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState("video"); // "audio" | "video"
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const pcRef = useRef(null);

  // Luu stream camera/microphone hien tai
  const localStreamRef = useRef(null);

  // Luu ID nguoi dang goi hoac nhan cuoc goi
  const targetIdRef = useRef(null);

  // Luu bo dem 30 giay
  const callTimeoutRef = useRef(null);

  // Luu ICE Candidate den truoc Remote Description
  const pendingIceRef = useRef([]);

  // Theo doi trang thai cuoc goi
  const callStatusRef = useRef("idle");
  
  // Đánh dấu phiên cuộc gọi hiện tại
  const sessionRef = useRef(0);
  
  // [C] Dọn dẹp tài nguyên sau khi cuộc gọi kết thúc
  const cleanupCall = useCallback(() => {

    // 1. Vô hiệu hóa các thao tác của phiên cuộc gọi cũ
    sessionRef.current += 1;

    // 2. Hủy bộ đếm 30 giây
    clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = null;

    // 3. Dừng camera và microphone
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // 4. Đóng kết nối WebRTC
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;

      pcRef.current.close();
      pcRef.current = null;
    }

    // 5. Xóa thông tin kết nối
    targetIdRef.current = null;
    pendingIceRef.current = [];
    callStatusRef.current = "idle";

    // 6. Khôi phục trạng thái giao diện
    setCallActive(false);
    setIncomingCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);

  }, []);

  // Xin quyền truy cập Camera và Microphone
  const getMedia = useCallback(async (type = "video") => {
    try {
      
      // Ghi nhận phiên cuộc gọi đang xin quyền thiết bị
      const session = sessionRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });

      // Nếu cuộc gọi đã bị hủy trong lúc xin quyền
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return null;
      }

      // Chỉ lưu stream khi phiên cuộc gọi còn hợp lệ
      localStreamRef.current = stream;
      setLocalStream(stream);


      // Cập nhật trạng thái thiết bị
      setIsMuted(false);
      setIsVideoOff(type === "audio");

      return stream;
    } catch (error) {
      console.error("Không thể truy cập Camera/Microphone:", error);
      throw error;
    }
  }, []);
  
  // Tạo kết nối WebRTC giữa hai người dùng
  const createPeerConnection = useCallback((targetId) => {

    // Khởi tạo kết nối với cấu hình STUN
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    // Lưu kết nối để sử dụng ở các hàm khác
    pcRef.current = pc;
    targetIdRef.current = targetId;

    // Gửi ICE Candidate cho người còn lại
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice_candidate", {
          targetId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Nhận âm thanh/video từ người còn lại
    pc.ontrack = (event) => {
      const stream = event.streams[0];

      if (stream) {
        setRemoteStream(stream);
      }
    };

    // Theo dõi trạng thái kết nối
    
    // [C] Theo dõi trạng thái kết nối WebRTC
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;

      console.log("Trạng thái WebRTC:", state);

      // Bỏ qua sự kiện của kết nối cũ
      if (pcRef.current !== pc) return;

      // Hai thiết bị đã kết nối thành công
      if (state === "connected") {
        setCallActive(true);
        callStatusRef.current = "active";

        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      // Kết nối thất bại
      if (state === "failed") {
        console.error("Kết nối WebRTC thất bại");

        const targetId = targetIdRef.current;

        if (socket && targetId) {
          socket.emit("end_call", { targetId });
        }

        cleanupCall();
      }

      // Mất kết nối tạm thời
      if (state === "disconnected") {
        console.warn("Kết nối WebRTC bị gián đoạn");
      }
    };


    return pc;
  }, [socket, cleanupCall]);


  // Bắt đầu cuộc gọi thoại hoặc video
  const startCall = useCallback(async (targetId, type = "video") => {
    // Kiểm tra kết nối Socket.IO
    if (!socket?.connected) {
      console.error("Socket.IO chưa kết nối");
      return;
    }

    // Không cho phép bắt đầu nhiều cuộc gọi cùng lúc
    if (callStatusRef.current !== "idle") {
      console.warn("Đang có cuộc gọi khác");
      return;
    }

    if (!targetId || String(targetId) === String(currentUserId)) {
      console.error("Người nhận không hợp lệ");
      return;
    }

    // Đánh dấu trạng thái đang gọi
    callStatusRef.current = "calling";
    targetIdRef.current = targetId;
    setCallType(type);

    // Tạo mã phiên cho cuộc gọi mới
    const session = ++sessionRef.current;

    try {
      // 1. Xin quyền camera/microphone
      const stream = await getMedia(type);
      
      // Dừng nếu không lấy được stream hoặc phiên đã bị hủy
      if (!stream || session !== sessionRef.current) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }

      // 2. Tạo kết nối WebRTC
      const pc = createPeerConnection(targetId);

      // 3. Thêm âm thanh/video vào kết nối
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 4. Tạo WebRTC Offer
      const offer = await pc.createOffer();

      // Kiểm tra cuộc gọi còn hợp lệ không
      if (session !== sessionRef.current) return;


      // 5. Lưu Offer vào kết nối
      await pc.setLocalDescription(offer);

      // Không gửi Offer nếu cuộc gọi đã bị hủy
      if (session !== sessionRef.current) return;

      // 6. Gửi Offer cho người nhận qua Socket.IO
      socket.emit("call_offer", {
        targetId,
        offer: pc.localDescription.toJSON(),
        callType: type,
      });

      console.log("Đã gửi yêu cầu gọi đến:", targetId);

      
      // Tự hủy cuộc gọi nếu không được trả lời sau 30 giây
      callTimeoutRef.current = setTimeout(() => {
        if (
          session === sessionRef.current &&
          callStatusRef.current === "calling"
        ) {
          console.log("Cuộc gọi không được trả lời sau 30 giây");

          socket.emit("end_call", { targetId });

          cleanupCall();
        }
      }, 30000);


    
    } catch (error) {
      console.error("Không thể bắt đầu cuộc gọi:", error);

      // Chỉ dọn dẹp nếu đây vẫn là phiên cuộc gọi hiện tại
      if (session === sessionRef.current) {
        cleanupCall();
      }
    }

  }, [socket, currentUserId, getMedia, createPeerConnection, cleanupCall]);

// [C] Nhận ICE Candidate từ đối phương
  const addRemoteCandidate = useCallback(async (candidate) => {
    if (!candidate) return;

    const pc = pcRef.current;

    // Nếu chưa có Remote Description thì lưu tạm ICE
    if (!pc || !pc.remoteDescription) {
      pendingIceRef.current.push(candidate);
      return;
    }

    await pc.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  }, []);

  // [C] Xử lý các ICE Candidate đã lưu tạm
  const flushIceCandidates = useCallback(async () => {
    const pc = pcRef.current;

    if (!pc || !pc.remoteDescription) return;

    const candidates = pendingIceRef.current.splice(0);

    for (const candidate of candidates) {
      await pc.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }
  }, []);
  
  // [C] Chấp nhận cuộc gọi WebRTC
  
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;

    // Chỉ chấp nhận khi đang có cuộc gọi đến
    if (callStatusRef.current !== "incoming") return;

    // Ghi nhận phiên cuộc gọi bên ngoài try
    const session = ++sessionRef.current;

    callStatusRef.current = "connecting";

    try {
      // 1. Lấy thông tin người gọi
      const { callerId, offer, callType: type } = incomingCall;


      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;

      // 2. Xin quyền camera/microphone
      const stream = await getMedia(type);
      
      // Dừng nếu không lấy được stream hoặc phiên đã bị hủy
      if (!stream || session !== sessionRef.current) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }


      // 3. Tạo kết nối WebRTC
      const pc = createPeerConnection(callerId);

      // 4. Thêm các track âm thanh/video
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Kiểm tra cuộc gọi còn hợp lệ
      if (session !== sessionRef.current) return;

      // 5. Nhận và lưu Offer từ người gọi
      await pc.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Kiểm tra lần nữa trước khi gửi Offer
      if (session !== sessionRef.current) return;

      await flushIceCandidates();

      // 6. Tạo Answer để phản hồi
      const answer = await pc.createAnswer();

      // 7. Lưu Answer vào kết nối
      await pc.setLocalDescription(answer);

      if (session !== sessionRef.current) return;

      // 8. Gửi Answer về người gọi
      socket.emit("call_answer", {
        callerId,
        answer: pc.localDescription.toJSON(),
      });

      // 9. Cập nhật giao diện
      setIncomingCall(null);
      setCallActive(true);

      console.log("Đã chấp nhận cuộc gọi từ:", callerId);

    } catch (error) {
      console.error("Lỗi chấp nhận cuộc gọi:", error);

      // Chỉ xử lý nếu đây vẫn là phiên cuộc gọi hiện tại
      if (session !== sessionRef.current) {
        return;
      }

      // Thông báo cuộc gọi thất bại cho người gọi
      if (socket && incomingCall?.callerId) {
        socket.emit("call_rejected", {
          callerId: incomingCall.callerId,
        });
      }

      // Dọn dẹp camera, microphone và kết nối WebRTC
      cleanupCall();
    }

  }, [incomingCall, socket, getMedia, createPeerConnection, flushIceCandidates, cleanupCall]);

  // [C] Từ chối cuộc gọi đến
  const rejectCall = useCallback(() => {

    // 1. Kiểm tra có cuộc gọi đến hay không
    if (!incomingCall || callStatusRef.current !== "incoming") {
      return;
    }

    // 2. Thông báo từ chối cho người gọi
    if (socket) {
      socket.emit("call_rejected", {
        callerId: incomingCall.callerId,
      });
    }

    // 3. Dọn dẹp toàn bộ tài nguyên
    cleanupCall();

    console.log("Đã từ chối cuộc gọi");

  }, [incomingCall, socket, cleanupCall]);


  // [C] Kết thúc cuộc gọi WebRTC
  const endCall = useCallback(() => {

    // 1. Lấy ID người đang tham gia cuộc gọi
    const targetId = targetIdRef.current;

    // 2. Thông báo cho đối phương
    if (socket && targetId) {
      socket.emit("end_call", { targetId });
    }

    // 3. Dọn dẹp toàn bộ tài nguyên cuộc gọi
    cleanupCall();

    console.log("Đã kết thúc cuộc gọi WebRTC");

  }, [socket, cleanupCall]);


  // [C] Lắng nghe các sự kiện cuộc gọi từ Socket.IO
  useEffect(() => {
    if (!socket) return;

    // Có người gọi đến
    const handleIncomingCall = (data) => {
      if (callStatusRef.current !== "idle") {
        socket.emit("call_rejected", {
          callerId: data.callerId,
        });
        return;
      }

      callStatusRef.current = "incoming";
      targetIdRef.current = data.callerId;

      setIncomingCall(data);
      setCallType(data.callType);

      console.log("Cuộc gọi đến từ:", data.callerId);

      // Tự động từ chối nếu sau 30 giây không trả lời
      clearTimeout(callTimeoutRef.current);

      callTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === "incoming") {

          console.log("Cuộc gọi đến đã hết thời gian chờ");

          // Thông báo cho người gọi
          socket.emit("call_rejected", {
            callerId: data.callerId,
          });

          // Dọn dẹp toàn bộ tài nguyên cuộc gọi
          cleanupCall();
        }
      }, 30000);

    };

    // Người nhận đã chấp nhận cuộc gọi
    
    // [C] Xử lý Answer từ người nhận cuộc gọi
    const handleCallAnswered = async (data) => {
      const pc = pcRef.current;

      // Kiểm tra cuộc gọi còn ở trạng thái chờ trả lời
      if (!pc || callStatusRef.current !== "calling") {
        return;
      }

      // Ghi nhận phiên cuộc gọi hiện tại
      const session = sessionRef.current;

      try {
        // Kiểm tra dữ liệu Answer
        if (!data?.answer) {
          throw new Error("Answer không hợp lệ");
        }

        // Ngăn xử lý Answer trùng lặp
        callStatusRef.current = "connecting";

        // Lưu thông tin Answer từ đối phương
        await pc.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        // Kiểm tra cuộc gọi còn hợp lệ
        if (
          session !== sessionRef.current ||
          pc !== pcRef.current
        ) {
          return;
        }

        // Xử lý ICE Candidate đã lưu tạm
        await flushIceCandidates();

        // Kiểm tra lại sau thao tác bất đồng bộ
        if (
          session !== sessionRef.current ||
          pc !== pcRef.current
        ) {
          return;
        }

        // Đối phương đã trả lời, hủy timeout 30 giây
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;

        console.log("Đã nhận WebRTC Answer");

      } catch (error) {
        console.error("Lỗi xử lý WebRTC Answer:", error);

        // Chỉ kết thúc nếu đây vẫn là phiên hiện tại
        if (
          session === sessionRef.current &&
          pc === pcRef.current
        ) {
          const targetId = targetIdRef.current;

          if (targetId) {
            socket.emit("end_call", { targetId });
          }

          cleanupCall();
        }
      }
    };


    // Nhận ICE Candidate từ đối phương
    const handleIceCandidate = async (data) => {
      try {
        if (callStatusRef.current === "idle") return;

        await addRemoteCandidate(data.candidate);
      } catch (error) {
        console.error("Lỗi xử lý ICE Candidate:", error);
      }
    };

    // [C] Xử lý khi đối phương từ chối hoặc kết thúc cuộc gọi
    const handleCallEnded = () => {

      // Kiểm tra có cuộc gọi đang diễn ra không
      if (callStatusRef.current === "idle") {
        return;
      }

      // Dọn dẹp toàn bộ tài nguyên cuộc gọi
      cleanupCall();

      console.log("Đối phương đã kết thúc hoặc từ chối cuộc gọi");
    };

    
    // [C] Xử lý khi Socket.IO mất kết nối
    const handleDisconnect = (reason) => {

      console.warn("Socket.IO mất kết nối:", reason);

      // Chỉ dọn dẹp khi đang có cuộc gọi
      if (callStatusRef.current !== "idle") {

        console.log("Hủy cuộc gọi do mất kết nối Server");

        cleanupCall();
      }
    };


    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_answered", handleCallAnswered);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_rejected", handleCallEnded);
    socket.on("call_ended", handleCallEnded);
    socket.on("disconnect", handleDisconnect);

    // Hủy đăng ký sự kiện để tránh lắng nghe trùng
    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_answered", handleCallAnswered);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_rejected", handleCallEnded);
      socket.off("call_ended", handleCallEnded);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, addRemoteCandidate, flushIceCandidates, cleanupCall]);

  // Bật / tắt Mic
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Bật / tắt Camera
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return {
    callActive,
    callType,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
