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


  // TODO: [C] Triển khai hàm chấp nhận cuộc gọi (Người nhận)
  const acceptCall = useCallback(async () => {
    console.log("TODO: [C] Chấp nhận cuộc gọi WebRTC");
  }, []);

  // TODO: [C] Triển khai hàm từ chối cuộc gọi
  const rejectCall = useCallback(() => {
    if (incomingCall && socket) {
      socket.emit("call_rejected", { callerId: incomingCall.callerId });
      setIncomingCall(null);
    }
  }, [incomingCall, socket]);

  // TODO: [C] Triển khai hàm kết thúc cuộc gọi
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
  }, [localStream]);

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
