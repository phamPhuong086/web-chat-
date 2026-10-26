/**
 * @file App.jsx
 * @description Root Component kết nối các Module tính năng của A, B, C
 * @assigned_to Bộ khung điều phối (Thành viên A phụ trách cấu trúc)
 */

import { useState } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import { useSocket } from "./context/SocketContext";
import useWebRTC from "./hooks/useWebRTC";

// Module Thành viên A:
import AuthScreen from "./features/auth/AuthScreen";
import ProfileModal from "./features/profile/ProfileModal";
import FriendList from "./features/friends/FriendList";
import FriendRequests from "./features/friends/FriendRequests";
import RoomList from "./features/rooms/RoomList";
import CreateGroupModal from "./features/rooms/CreateGroupModal";
import GroupSettingsModal from "./features/rooms/GroupSettingsModal";

// Module Thành viên B:
import ChatWindow from "./features/chat/ChatWindow";

// Module Thành viên C:
import CallOverlay from "./features/calls/CallOverlay";
import CallIncomingModal from "./features/calls/CallIncomingModal";

export default function App() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  // Tab chuyển đổi ở thanh bên: "rooms" | "friends" | "requests" (Của A)
  const [activeTab, setActiveTab] = useState("rooms");

  // Quản lý phòng đang chọn (Của A truyền cho B)
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Trạng thái mở các Modal của A
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);

  // Hook WebRTC của C
  const {
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
  } = useWebRTC(socket, user?.id);

  // 1. Nếu chưa đăng nhập -> Hiển thị Màn hình Auth (Do A phụ trách)
  if (!user) {
    return <AuthScreen />;
  }

  // 2. Kích hoạt cuộc gọi WebRTC tới thành viên trong phòng (Do C phụ trách)
  const handleStartCall = (type) => {
    if (!selectedRoom) return;
    // Tìm đối phương trong phòng chat 1-1
    const target = selectedRoom.members?.find((m) => (m._id || m) !== user.id);
    const targetId = target?._id || target;
    if (targetId) {
      startCall(targetId, type);
    } else {
      alert("Chỉ hỗ trợ gọi P2P cho cuộc trò chuyện 1-1");
    }
  };

  return (
    <div className="app-container">
      {/* CỘT BÊN TRÁI: Thanh điều hướng, bạn bè và danh sách phòng (Module A) */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div>
            <strong>{user.username}</strong>
            <div style={{ fontSize: 12, color: "green" }}>● Trực tuyến</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setIsProfileOpen(true)} title="Hồ sơ">👤</button>
            <button onClick={logout} title="Đăng xuất">🚪</button>
          </div>
        </div>

        {/* Tab chuyển đổi tính năng của A */}
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab-btn ${activeTab === "rooms" ? "active" : ""}`}
            onClick={() => setActiveTab("rooms")}
          >
            Chat
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            Bạn Bè
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Lời Mời
          </button>
        </div>

        {/* Nội dung thanh bên theo Tab */}
        <div className="sidebar-content">
          {activeTab === "rooms" && (
            <RoomList
              currentUserId={user.id}
              selectedRoomId={selectedRoom?._id}
              onSelectRoom={(room) => setSelectedRoom(room)}
              onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            />
          )}

          {activeTab === "friends" && (
            <FriendList
              onSelectFriendToChat={(friendId) => {
                // TODO: [A] Gọi API tạo hoặc mở phòng 1-1 với friendId rồi setSelectedRoom(room)
                alert(`TODO: [A] Mở phòng chat với friend: ${friendId}`);
              }}
            />
          )}

          {activeTab === "requests" && <FriendRequests />}
        </div>
      </div>

      {/* KHUNG CHÍNH Ở GIỮA: Cửa sổ Chat thời gian thực (Module B) */}
      <div className="main-chat-area">
        <ChatWindow
          room={selectedRoom}
          currentUserId={user.id}
          onStartCall={handleStartCall}
          onOpenGroupSettings={() => setIsGroupSettingsOpen(true)}
        />
      </div>

      {/* CÁC MODAL HỖ TRỢ CỦA A */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={(newGroup) => setSelectedRoom(newGroup)}
      />
      <GroupSettingsModal
        isOpen={isGroupSettingsOpen}
        onClose={() => setIsGroupSettingsOpen(false)}
        room={selectedRoom}
        currentUserId={user.id}
        onGroupUpdated={(updated) => setSelectedRoom(updated)}
      />

      {/* CÁC COMPONENT GỌI WEBRTC CỦA C */}
      <CallIncomingModal
        incomingCall={incomingCall}
        onAcceptCall={acceptCall}
        onRejectCall={rejectCall}
      />
      <CallOverlay
        callActive={callActive}
        callType={callType}
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={endCall}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isVideoOff={isVideoOff}
        onToggleVideo={toggleVideo}
      />
    </div>
  );
}
