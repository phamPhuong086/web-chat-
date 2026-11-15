
/**
 * @file App.jsx
 * @description Root Component kết nối các Module tính năng của A, B, C
 */

import { useState } from "react";
import "./App.css";

import { useAuth } from "./context/AuthContext";
import { useSocket } from "./context/SocketContext";
import useWebRTC from "./hooks/useWebRTC";

// Module Thành viên A
import AuthScreen from "./features/auth/AuthScreen";
import ProfileModal from "./features/profile/ProfileModal";
import FriendList from "./features/friends/FriendList";
import FriendRequests from "./features/friends/FriendRequests";
import RoomList from "./features/rooms/RoomList";
import CreateGroupModal from "./features/rooms/CreateGroupModal";
import GroupSettingsModal from "./features/rooms/GroupSettingsModal";

// Module Thành viên B
import ChatWindow from "./features/chat/ChatWindow";

// Module Thành viên C
import CallOverlay from "./features/calls/CallOverlay";
import CallIncomingModal from "./features/calls/CallIncomingModal";

// ========================================
// DỮ LIỆU GIẢ DÙNG ĐỂ XEM THỬ GIAO DIỆN
// ========================================

const DEMO_USER = {
  id: "demo-user-1",
  username: "Phuong",
  avatar: "",
};

const DEMO_ROOM = {
  _id: "demo-room-1",
  name: "Minh Anh",
  isGroup: false,
  members: ["demo-user-1", "demo-user-2"],
};

export default function App() {
  const { user: realUser, logout } = useAuth();
  const { socket } = useSocket();

  // Chỉ bật chế độ xem thử khi URL có ?demo=true
  const isDemo =
    new URLSearchParams(window.location.search).get("demo") === "true";

  // Ưu tiên tài khoản thật nếu đã đăng nhập
  const user = realUser || (isDemo ? DEMO_USER : null);

  // Tab bên trái
  const [activeTab, setActiveTab] = useState("rooms");

  // Phòng chat đang chọn
  const [selectedRoom, setSelectedRoom] = useState(
    isDemo && !realUser ? DEMO_ROOM : null
  );

  // Quản lý Modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);

  // Hook WebRTC của thành viên C
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

  // Chưa đăng nhập và không bật chế độ demo
  if (!user) {
    return <AuthScreen />;
  }

  // Xử lý gọi điện
  const handleStartCall = (type) => {
    if (isDemo) {
      alert("Chế độ xem thử không hỗ trợ gọi điện.");
      return;
    }

    if (!selectedRoom) return;

    const target = selectedRoom.members?.find(
      (m) => (m._id || m) !== user.id
    );

    const targetId = target?._id || target;

    if (targetId) {
      startCall(targetId, type);
    } else {
      alert("Chỉ hỗ trợ gọi P2P cho cuộc trò chuyện 1-1");
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    if (!isDemo) {
      logout();
    }

    setSelectedRoom(null);
    window.history.replaceState({}, "", "/");
    window.location.reload();
  };

  return (
    <div className="app-container">

      {/* ================================= */}
      {/* SIDEBAR - THÀNH VIÊN A */}
      {/* ================================= */}

      <div className="sidebar">

        <div className="sidebar-header">
          <div>
            <strong>{user.username}</strong>
            <div style={{ fontSize: 12, color: "green" }}>
              ● Trực tuyến
            </div>

            {isDemo && (
              <div style={{ fontSize: 11, color: "#d97706" }}>
                Chế độ xem thử
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {!isDemo && (
              <>
                <button
                  onClick={() => setIsProfileOpen(true)}
                  title="Hồ sơ"
                >
                  👤
                </button>

                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                >
                  🚪
                </button>
              </>
            )}

            {isDemo && (
              <button onClick={handleLogout} title="Thoát xem thử">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Các tab */}
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab-btn ${
              activeTab === "rooms" ? "active" : ""
            }`}
            onClick={() => setActiveTab("rooms")}
          >
            Chat
          </button>

          <button
            className={`sidebar-tab-btn ${
              activeTab === "friends" ? "active" : ""
            }`}
            onClick={() => setActiveTab("friends")}
          >
            Bạn Bè
          </button>

          <button
            className={`sidebar-tab-btn ${
              activeTab === "requests" ? "active" : ""
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Lời Mời
          </button>
        </div>

        {/* Nội dung sidebar */}
        <div className="sidebar-content">

          {activeTab === "rooms" && (
            isDemo ? (
              <div style={{ padding: 12 }}>
                <button
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "#e0e7ff",
                    padding: 14,
                  }}
                  onClick={() => setSelectedRoom(DEMO_ROOM)}
                >
                  <strong>👤 Minh Anh</strong>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Cuộc trò chuyện mẫu
                  </div>
                </button>
              </div>
            ) : (
              <RoomList
                currentUserId={user.id}
                selectedRoomId={selectedRoom?._id}
                onSelectRoom={(room) => setSelectedRoom(room)}
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
              />
            )
          )}

          {activeTab === "friends" && (
            isDemo ? (
              <p style={{ padding: 16, color: "#64748b" }}>
                Danh sách bạn bè sẽ hiển thị tại đây.
              </p>
            ) : (
              <FriendList
                onSelectFriendToChat={(friendId) => {
                  alert(
                    `TODO: Mở phòng chat với friend: ${friendId}`
                  );
                }}
              />
            )
          )}

          {activeTab === "requests" && (
            isDemo ? (
              <p style={{ padding: 16, color: "#64748b" }}>
                Danh sách lời mời sẽ hiển thị tại đây.
              </p>
            ) : (
              <FriendRequests />
            )
          )}

        </div>
      </div>

      {/* ================================= */}
      {/* CHAT WINDOW - THÀNH VIÊN B */}
      {/* ================================= */}

      <div className="main-chat-area">
        <ChatWindow
          room={selectedRoom}
          currentUserId={user.id}
          onStartCall={handleStartCall}
          onOpenGroupSettings={() =>
            setIsGroupSettingsOpen(true)
          }
        />
      </div>

      {/* ================================= */}
      {/* MODAL - THÀNH VIÊN A */}
      {/* ================================= */}

      {!isDemo && (
        <>
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />

          <CreateGroupModal
            isOpen={isCreateGroupOpen}
            onClose={() => setIsCreateGroupOpen(false)}
            onGroupCreated={(newGroup) =>
              setSelectedRoom(newGroup)
            }
          />

          <GroupSettingsModal
            isOpen={isGroupSettingsOpen}
            onClose={() => setIsGroupSettingsOpen(false)}
            room={selectedRoom}
            currentUserId={user.id}
            onGroupUpdated={(updated) =>
              setSelectedRoom(updated)
            }
          />
        </>
      )}

      {/* ================================= */}
      {/* WEBRTC - THÀNH VIÊN C */}
      {/* ================================= */}

      {!isDemo && (
        <>
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
        </>
      )}

    </div>
  );
}
