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

  // TODO: [C] Triển khai hàm bắt đầu cuộc gọi (Người gọi)
  const startCall = useCallback(async (targetId, type = "video") => {
    console.log("TODO: [C] Khởi tạo cuộc gọi WebRTC tới:", targetId, "Loại:", type);
  }, []);

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
