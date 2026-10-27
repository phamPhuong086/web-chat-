#  Realtime Chat Application - Starter Template

Dự án ứng dụng nhắn tin và gọi thoại/video thời gian thực (Realtime Chat & Call Web App).
Bộ khung này được thiết kế theo kiến trúc **Module hóa (Feature-based)** để 3 thành viên (**A, B, C**) phát triển độc lập song song mà **không bị xung đột code (Git Conflict)**.

---

##  1. Thống số kỹ thuật & Cổng mặc định (Default Ports & Tech Stack)

| Thành phần | Công nghệ | Cổng mặc định (Port) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Backend** | Node.js, Express, Socket.IO, Mongoose | `http://localhost:3001` | Config tại `server/.env` |
| **Frontend** | React 19, Vite, Socket.IO-Client, Axios | `http://localhost:5173` | Config tại `client/.env` |
| **Database** | MongoDB | `mongodb://localhost:27017/chat_app` | MongoDB Local hoặc Atlas |

---

##  2. Phân công công việc (Task Assignment)

###  Thành viên A 
* **Khung & Hạ tầng**: Khởi tạo cấu trúc thư mục, kết nối MongoDB, cấu hình JWT + Bcrypt, Middleware xác thực (`auth.js`).
* **Xác thực (Auth)**: API & UI Đăng ký, Đăng nhập, Đăng xuất, Lưu trữ Token.
* **Hồ sơ cá nhân (Profile)**: API & UI Cập nhật avatar, ngày sinh, sở thích, tiểu sử, đổi mật khẩu.
* **Bạn bè (Friends)**: API & UI Tìm kiếm người dùng, gửi/chấp nhận/từ chối lời mời kết bạn, danh sách bạn bè, hủy kết bạn.
* **Hội thoại & Nhóm (Rooms)**: API & UI Tạo phòng chat 1-1, tạo nhóm chat; đổi tên, ảnh, mô tả nhóm; thêm/xóa thành viên.
* **Cơ sở dữ liệu & E2EE Support**: Thiết kế Model `User`, `Room`, `FriendRequest`. Thêm trường `publicKey` trong `User` và cung cấp API lưu/lấy `publicKey` phục vụ cho E2EE của B.

###  Thành viên B 
* **Giao diện Chat**: Danh sách tin nhắn (`MessageList`), khung soạn thảo (`MessageInput`), đính kèm ảnh, emoji picker.
* **Realtime Socket**: Xử lý event `send_message`, `receive_message`, `edit_message`, `delete_message`, `react_message`.
* **Lưu trữ & Lịch sử**: Thiết kế Model `Message`, lưu tin nhắn vào MongoDB, tải 100 tin nhắn gần nhất khi vào phòng (`load_history`).
* **Trải nghiệm mạng**: Xử lý mất kết nối, kết nối lại (reconnect), tránh render trùng lặp tin nhắn (`deduplication`).
* **Bảo mật E2EE (Chat cá nhân 1-1)**:
  * Sinh cặp khóa (Public/Private Key) phía Client bằng Web Crypto API hoặc lib tương đương.
  * Phối hợp với A: Gọi API của A để tải Public Key của đối phương và cập nhật Public Key của mình lên Server.
  * Mã hóa tin nhắn trước khi emit qua Socket, giải mã khi nhận tin nhắn. Lưu Private Key an toàn tại `localStorage` hoặc `IndexedDB` của Client.

###  Thành viên C 
* **Giao diện Cuộc gọi**: Overlay hiển thị cuộc gọi đến (`CallIncomingModal`), màn hình video call (`CallOverlay`), nút bật/tắt mic/camera, nút kết thúc cuộc gọi.
* **WebRTC Signaling qua Socket.IO**: Xử lý các event `call_offer`, `incoming_call`, `call_answer`, `call_answered`, `ice_candidate`, `call_rejected`, `end_call`.
* **Quản lý quyền & Thiết bị**: Xin quyền truy cập Camera/Microphone, xử lý khi người dùng từ chối quyền.
* **Timeout & Hủy gọi**: Tự động kết thúc cuộc gọi nếu sau 30 giây đối phương không nhấc máy.
* **Cấu hình STUN/TURN**: Cấu hình Google STUN public server (`stun:stun.l.google.com:19302`).
* **Tính năng mở rộng (Nếu còn thời gian)**: Ghim tin nhắn (`pin_message`), tìm kiếm nội dung tin nhắn, xem danh sách ảnh/tệp đã gửi trong phòng.

---

##  3. Cấu trúc thư mục Module hóa (Project Structure)

```text
chat-app-starter/
├── client/                              # GIAO DIỆN FRONTEND (Vite + React)
│   ├── src/
│   │   ├── config/                      # Cấu hình Axios API, Socket client
│   │   │   ├── api.js                   # [Chung] Axios instance có kèm Bearer token
│   │   │   └── socket.js                # [Chung] Socket instance kết nối tới Server
│   │   ├── context/                     # Context dùng chung toàn ứng dụng
│   │   │   ├── AuthContext.jsx          # [A] Quản lý state đăng nhập, user hiện tại
│   │   │   └── SocketContext.jsx        # [Chung] Cung cấp kết nối socket cho các component
│   │   ├── features/                    # Chia theo tính năng để tránh conflict code
│   │   │   ├── auth/                    # [A] Giao diện Login, Register
│   │   │   ├── profile/                 # [A] Modal xem & sửa hồ sơ cá nhân
│   │   │   ├── friends/                 # [A] Danh sách bạn bè, tìm kiếm user, lời mời kết bạn
│   │   │   ├── rooms/                   # [A] Danh sách phòng, Modal tạo nhóm, Cài đặt nhóm
│   │   │   ├── chat/                    # [B] Khung chat, danh sách tin nhắn, nhập tin nhắn, reaction
│   │   │   └── calls/                   # [C] Overlay cuộc gọi video/audio, thông báo cuộc gọi đến
│   │   ├── hooks/
│   │   │   └── useWebRTC.js             # [C] Custom hook kết nối WebRTC P2P
│   │   ├── utils/
│   │   │   ├── constants.js             # [Chung] Các hằng số URL, Timeout 30s, Reaction icons
│   │   │   └── crypto.js                # [B] Hàm mã hóa, giải mã, sinh key E2EE
│   │   ├── App.jsx                      # Component gốc ráp các Layout
│   │   ├── main.jsx                     # Entry point React
│   │   └── index.css                    # Global Styles
│   ├── .env.example                     # Biến môi trường mẫu client
│   └── package.json
│
├── server/                              # MÃ NGUỒN BACKEND (Node.js + Express + Socket.IO)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js              # [A] Kết nối MongoDB bằng Mongoose
│   │   ├── middleware/
│   │   │   └── auth.js                  # [A] Middleware xác thực JWT token
│   │   ├── models/                      # MongoDB Schemas
│   │   │   ├── User.js                  # [A] Schema người dùng (thông tin + publicKey E2EE)
│   │   │   ├── Room.js                  # [A] Schema phòng chat 1-1 và nhóm chat
│   │   │   ├── FriendRequest.js         # [A] Schema lời mời kết bạn
│   │   │   ├── Message.js               # [B] Schema tin nhắn (text mã hóa, image, reaction)
│   │   │   └── index.js                 # Export toàn bộ models
│   │   ├── routes/                      # REST API Endpoints
│   │   │   ├── authRoutes.js            # [A] POST /api/auth/register, login, logout
│   │   │   ├── userRoutes.js            # [A] GET /api/users/profile, search, publicKey
│   │   │   ├── friendRoutes.js          # [A] POST /api/friends/request, accept, reject
│   │   │   ├── roomRoutes.js            # [A] POST /api/rooms, GET /api/rooms, PUT /api/rooms/:id
│   │   │   ├── messageRoutes.js         # [B] GET /api/messages/:roomId (nếu cần tải thêm lịch sử)
│   │   │   └── index.js                 # Gộp toàn bộ routes
│   │   └── sockets/                     # Xử lý Realtime Socket.IO
│   │       ├── userSocket.js            # [A] Báo online/offline khi user kết nối
│   │       ├── chatSocket.js            # [B] join_room, send_message, edit, delete, react
│   │       ├── callSocket.js            # [C] call_offer, call_answer, ice_candidate, end_call
│   │       └── index.js                 # Đăng ký các socket handlers
│   ├── index.js                         # Entry point server (khởi tạo app, HTTP server, socket.io)
│   ├── .env.example                     # Biến môi trường mẫu server
│   └── package.json
│
├── .gitignore                           # Bỏ qua node_modules, .env, build files
└── README.md                            # Tài liệu hướng dẫn này
```

---

##  4. Thống nhất danh mục REST API (API Contracts)

> **Lưu ý**: Tất cả các API dưới đây (trừ `/api/auth/*`) đều bắt buộc gửi kèm header:
> `Authorization: Bearer <token>`

### 4.1. Xác thực (`authRoutes.js` - Do A phụ trách)
* `POST /api/auth/register`: Đăng ký tài khoản mới.
  * Body: `{ "username": "alice", "password": "123" }`
  * Response (201): `{ "message": "Đăng ký thành công" }`
* `POST /api/auth/login`: Đăng nhập hệ thống.
  * Body: `{ "username": "alice", "password": "123" }`
  * Response (200): `{ "token": "jwt...", "id": "user_id", "username": "alice", "avatar": "" }`
* `POST /api/auth/logout`: Đăng xuất (Client chủ động xoá token).

### 4.2. Người dùng & Hồ sơ (`userRoutes.js` - Do A phụ trách)
* `GET /api/users/profile`: Lấy thông tin hồ sơ của chính mình.
  * Response (200): `{ "_id", "username", "avatar", "bio", "hobbies", "birthday", "isOnline" }`
* `PUT /api/users/profile`: Cập nhật thông tin hồ sơ.
  * Body: `{ "bio": "...", "hobbies": ["game"], "birthday": "2000-01-01", "avatar": "base64/url" }`
* `PUT /api/users/password`: Đổi mật khẩu.
  * Body: `{ "currentPassword": "123", "newPassword": "456" }`
* `GET /api/users/search?keyword=abc`: Tìm kiếm người dùng theo username.
* `PUT /api/users/public-key`: Cập nhật Public Key E2EE (B sẽ gọi API này khi sinh khóa).
  * Body: `{ "publicKey": "PEM_OR_JWK_STRING" }`
* `GET /api/users/:userId/public-key`: Lấy Public Key của đối phương để B mã hóa tin nhắn.
  * Response (200): `{ "userId": "...", "publicKey": "..." }`

### 4.3. Bạn bè (`friendRoutes.js` - Do A phụ trách)
* `GET /api/friends`: Lấy danh sách bạn bè hiện tại.
* `POST /api/friends/request`: Gửi lời mời kết bạn.
  * Body: `{ "targetId": "receiver_id" }`
* `GET /api/friends/requests`: Lấy danh sách lời mời kết bạn gửi đến mình.
* `POST /api/friends/accept`: Chấp nhận lời mời kết bạn.
  * Body: `{ "requestId": "request_id" }`
* `POST /api/friends/reject`: Từ chối lời mời kết bạn.
  * Body: `{ "requestId": "request_id" }`
* `POST /api/friends/unfriend`: Hủy kết bạn.
  * Body: `{ "targetId": "friend_id" }`

### 4.4. Hội thoại & Nhóm (`roomRoutes.js` - Do A phụ trách)
* `GET /api/rooms`: Lấy danh sách các phòng chat (cá nhân & nhóm) mà user đang tham gia.
* `POST /api/rooms`: Tạo phòng chat mới.
  * Chat 1-1 Body: `{ "isGroup": false, "memberIds": ["target_user_id"] }`
  * Nhóm Body: `{ "name": "Nhóm bạn", "isGroup": true, "memberIds": ["user_1", "user_2"] }`
* `PUT /api/rooms/:roomId`: Cập nhật thông tin nhóm (Chỉ trưởng nhóm `creator` được sửa).
  * Body: `{ "name": "...", "description": "...", "avatar": "...", "memberIds": [...] }`

---

##  5. Thống nhất danh mục Socket.IO Events (Socket Contracts)

Khi Client kết nối Socket, **bắt buộc** truyền token qua handshake:
```javascript
const socket = io("http://localhost:3001", {
  auth: { token: localStorage.getItem("token") }
});
```

### 5.1. Trạng thái kết nối (`userSocket.js` - Do A phụ trách)
| Event Name | Direction | Payload | Mô tả |
| :--- | :--- | :--- | :--- |
| `user_status_change` | Server -> Broadcast | `{ userId, isOnline }` | Thông báo khi một user vừa online hoặc offline |

### 5.2. Nhắn tin thời gian thực (`chatSocket.js` - Do B phụ trách)
| Event Name | Direction | Payload | Mô tả |
| :--- | :--- | :--- | :--- |
| `join_room` | Client -> Server | `{ roomId }` | Tham gia vào room socket để nghe tin nhắn |
| `load_history` | Server -> Client | `[ { _id, senderId, text, ... } ]` | Trả về 100 tin nhắn cũ nhất của room |
| `send_message` | Client -> Server | `{ roomId, text, image, replyTo }` | Gửi tin nhắn mới (text có thể đã mã hóa E2EE) |
| `receive_message` | Server -> Room | `{ _id, roomID, sender, text, ... }` | Phát tin nhắn mới tới toàn bộ thành viên trong phòng |
| `edit_message` | Client -> Server | `{ messageId, roomId, newText }` | Yêu cầu sửa nội dung tin nhắn |
| `message_edited` | Server -> Room | `{ messageId, newText, editedAt }` | Phát cập nhật tin nhắn đã sửa |
| `delete_message` | Client -> Server | `{ messageId, roomId }` | Yêu cầu xóa/thu hồi tin nhắn |
| `message_deleted` | Server -> Room | `{ messageId }` | Thông báo tin nhắn đã bị xóa |
| `react_message` | Client -> Server | `{ messageId, roomId, emoji }` | Thả biểu cảm cảm xúc vào tin nhắn |
| `reaction_update` | Server -> Room | `{ messageId, reactions: { "❤️": 2 } }`| Cập nhật danh sách reaction của tin |

### 5.3. Cuộc gọi WebRTC Signaling (`callSocket.js` - Do C phụ trách)
| Event Name | Direction | Payload | Mô tả |
| :--- | :--- | :--- | :--- |
| `call_offer` | Client -> Server | `{ targetId, offer, callType, roomId }` | Người gọi gửi WebRTC Offer |
| `incoming_call` | Server -> Target | `{ callerId, callerName, offer, callType }` | Báo cho người nhận có cuộc gọi đến |
| `call_answer` | Client -> Server | `{ callerId, answer }` | Người nhận chấp nhận và gửi WebRTC Answer |
| `call_answered` | Server -> Caller | `{ answer, answererId }` | Gửi Answer lại cho người gọi để thiết lập P2P |
| `ice_candidate` | 2 chiều qua Server | `{ targetId, candidate, from }` | Trao đổi ứng viên mạng ICE giữa 2 máy |
| `call_rejected` | Client -> Server | `{ callerId }` | Từ chối hoặc quá 30 giây không nghe máy |
| `end_call` | Client -> Server | `{ targetId }` | Bấm kết thúc cuộc gọi |
| `call_ended` | Server -> Target | `{}` | Thông báo đối phương đã ngắt kết nối cuộc gọi |

---

## 6. Hướng dẫn cài đặt & Khởi chạy (Getting Started)

### 1. Khởi chạy Backend (`server`)
```bash
cd server
npm install
# Tạo file cấu hình từ file mẫu:
cp .env.example .env
# Chạy server ở chế độ phát triển:
npm run dev # hoặc node index.js
```
*Server sẽ chạy tại `http://localhost:3001` và kết nối tới MongoDB.*

### 2. Khởi chạy Frontend (`client`)
Mở cửa sổ dòng lệnh thứ 2:
```bash
cd client
npm install
# Tạo file môi trường mẫu:
cp .env.example .env
# Khởi chạy giao diện Vite:
npm run dev
```
*Ứng dụng sẽ hiển thị tại `http://localhost:5173`.*

---

##  7. Quy tắc làm việc qua Git (Git Workflow)

1. **Nhánh chính**:
   * `main`: Chỉ chứa sản phẩm ổn định, không commit trực tiếp.
   * `develop`: Nhánh tích hợp chung của cả nhóm.
2. **Quy tắc tạo nhánh cho mỗi thành viên**:
   * Người A: Tạo nhánh `feature/task-a-auth-profile-rooms` từ `develop`.
   * Người B: Tạo nhánh `feature/task-b-chat-e2ee` từ `develop`.
   * Người C: Tạo nhánh `feature/task-c-webrtc-call` từ `develop`.
3. **Quy trình đẩy code**:
   * Luôn chạy `git pull origin develop` trước khi tạo PR để giải quyết conflict ở máy mình trước.
   * Tuyệt đối **không commit các file** `node_modules/`, `.env`, `dist/`.
