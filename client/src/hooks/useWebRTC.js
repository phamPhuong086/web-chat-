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

  // Xin quyền truy cập Camera và Microphone
  const getMedia = useCallback(async (type = "video") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });

      // Lưu luồng âm thanh và hình ảnh
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
    pc.onconnectionstatechange = () => {
      console.log("WebRTC:", pc.connectionState);

      if (pc.connectionState === "connected") {
        setCallActive(true);
        callStatusRef.current = "active";
      }

      if (pc.connectionState === "failed") {
        console.error("Kết nối WebRTC thất bại");
      }
    };

    return pc;
  }, [socket]);


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

    try {
      // 1. Xin quyền camera/microphone
      const stream = await getMedia(type);

      // 2. Tạo kết nối WebRTC
      const pc = createPeerConnection(targetId);

      // 3. Thêm âm thanh/video vào kết nối
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 4. Tạo WebRTC Offer
      const offer = await pc.createOffer();

      // 5. Lưu Offer vào kết nối
      await pc.setLocalDescription(offer);

      // 6. Gửi Offer cho người nhận qua Socket.IO
      socket.emit("call_offer", {
        targetId,
        offer: pc.localDescription.toJSON(),
        callType: type,
      });

      console.log("Đã gửi yêu cầu gọi đến:", targetId);

      // 7. Tự hủy nếu không có phản hồi sau 30 giây
      callTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === "calling") {
          console.log("Cuộc gọi không được trả lời sau 30 giây");

          socket.emit("end_call", { targetId });

          localStreamRef.current?.getTracks().forEach(
            (track) => track.stop()
          );

          pcRef.current?.close();
          pcRef.current = null;
          localStreamRef.current = null;
          targetIdRef.current = null;
          callStatusRef.current = "idle";

          setLocalStream(null);
          setRemoteStream(null);
          setCallActive(false);
        }
      }, 30000);

    } catch (error) {
      console.error("Không thể bắt đầu cuộc gọi:", error);

      localStreamRef.current?.getTracks().forEach(
        (track) => track.stop()
      );

      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current = null;
      targetIdRef.current = null;
      callStatusRef.current = "idle";

      setLocalStream(null);
      setCallActive(false);
    }
  }, [socket, currentUserId, getMedia, createPeerConnection]);


  
  // [C] Chấp nhận cuộc gọi WebRTC
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;

    try {
      // 1. Lấy thông tin người gọi
      const { callerId, offer, callType: type } = incomingCall;

      callStatusRef.current = "connecting";
      
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;

      // 2. Xin quyền camera/microphone
      const stream = await getMedia(type);

      // 3. Tạo kết nối WebRTC
      const pc = createPeerConnection(callerId);

      // 4. Thêm các track âm thanh/video
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 5. Nhận và lưu Offer từ người gọi
      await pc.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      await flushIceCandidates();

      // 6. Tạo Answer để phản hồi
      const answer = await pc.createAnswer();

      // 7. Lưu Answer vào kết nối
      await pc.setLocalDescription(answer);

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
      // Sẽ bổ sung dọn dẹp kết nối ở bước xử lý endCall
    }
  }, [incomingCall, socket, getMedia, createPeerConnection, flushIceCandidates]);


  
  // [C] Từ chối cuộc gọi đến
  const rejectCall = useCallback(() => {

    // 1. Kiểm tra thông tin cuộc gọi đến
    if (!incomingCall) return;

    // 2. Thông báo từ chối cho người gọi
    if (socket) {
      socket.emit("call_rejected", {
        callerId: incomingCall.callerId,
      });
    }

    // 3. Hủy bộ đếm thời gian
    clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = null;

    // 4. Đóng kết nối WebRTC nếu đã được tạo
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // 5. Dừng camera và microphone nếu đang sử dụng
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // 6. Xóa thông tin cuộc gọi
    targetIdRef.current = null;
    pendingIceRef.current = [];
    callStatusRef.current = "idle";

    // 7. Cập nhật giao diện
    setIncomingCall(null);
    setCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);

    console.log("Đã từ chối cuộc gọi");

  }, [incomingCall, socket]);


  
  // [C] Kết thúc cuộc gọi WebRTC
  const endCall = useCallback(() => {

    // 1. Lấy ID người đang gọi cùng
    const targetId = targetIdRef.current;

    // 2. Thông báo cho đối phương
    if (socket && targetId) {
      socket.emit("end_call", { targetId });
    }

    // 3. Xóa bộ đếm thời gian 30 giây
    clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = null;

    // 4. Dừng camera và microphone
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // 5. Đóng kết nối WebRTC
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // 6. Xóa các thông tin cuộc gọi
    targetIdRef.current = null;
    pendingIceRef.current = [];
    callStatusRef.current = "idle";

    // 7. Đưa giao diện về trạng thái ban đầu
    setCallActive(false);
    setIncomingCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);

    console.log("Đã kết thúc cuộc gọi WebRTC");

  }, [socket]);


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

          socket.emit("call_rejected", {
            callerId: data.callerId,
          });

          targetIdRef.current = null;
          pendingIceRef.current = [];
          callStatusRef.current = "idle";
          callTimeoutRef.current = null;

          setIncomingCall(null);
          setCallActive(false);
        }
      }, 30000);

    };

    // Người nhận đã chấp nhận cuộc gọi
    const handleCallAnswered = async (data) => {
      const pc = pcRef.current;

      if (!pc || callStatusRef.current !== "calling") {
        return;
      }

      try {
        clearTimeout(callTimeoutRef.current);

        await pc.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        await flushIceCandidates();

        callStatusRef.current = "active";
        setCallActive(true);

        console.log("Đối phương đã chấp nhận cuộc gọi");
      } catch (error) {
        console.error("Lỗi xử lý WebRTC Answer:", error);
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

    // Đối phương từ chối hoặc kết thúc cuộc gọi
    const handleCallEnded = () => {
      clearTimeout(callTimeoutRef.current);

      localStreamRef.current?.getTracks().forEach(
        (track) => track.stop()
      );

      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current = null;
      targetIdRef.current = null;
      pendingIceRef.current = [];
      callStatusRef.current = "idle";

      setCallActive(false);
      setIncomingCall(null);
      setLocalStream(null);
      setRemoteStream(null);
      setIsMuted(false);
      setIsVideoOff(false);

      console.log("Cuộc gọi đã kết thúc");
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_answered", handleCallAnswered);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_rejected", handleCallEnded);
    socket.on("call_ended", handleCallEnded);

    // Hủy đăng ký sự kiện để tránh lắng nghe trùng
    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_answered", handleCallAnswered);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_rejected", handleCallEnded);
      socket.off("call_ended", handleCallEnded);
    };
  }, [socket, addRemoteCandidate, flushIceCandidates]);

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
