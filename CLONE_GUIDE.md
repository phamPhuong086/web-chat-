# 📖 Hướng Dẫn Clone & Khởi Chạy Dự Án (Dành Cho Thành Viên Nhóm)

Tài liệu này hướng dẫn chi tiết từng bước cho các thành viên trong nhóm (**A, B, C**) sau khi clone mã nguồn từ GitHub về máy tính cá nhân để có thể cài đặt và chạy ứng dụng mà không gặp lỗi.

---

## 🛠 1. Yêu cầu môi trường trước khi bắt đầu (Prerequisites)

Trước khi thực hiện các lệnh bên dưới, hãy đảm bảo máy tính của bạn đã cài đặt:

1. **Git**: [Tải tại đây](https://git-scm.com/downloads) (Kiểm tra bằng lệnh: `git --version`)
2. **Node.js** (Khuyên dùng bản LTS từ `v18.x` hoặc `v20.x` trở lên): [Tải tại đây](https://nodejs.org/) (Kiểm tra bằng: `node -v` và `npm -v`)
3. **MongoDB**:
   * **Cách 1 (Khuyên dùng)**: Cài đặt **MongoDB Community Server** chạy trên máy local tại cổng `27017`.
   * **Cách 2**: Sử dụng đường dẫn kết nối đám mây **MongoDB Atlas** (nếu không cài MongoDB local).

---

## 🚀 2. Các bước thiết lập dự án từ A - Z

### Bước 1: Clone kho chứa (Repository) về máy
Mở Terminal / PowerShell và gõ:
```bash
git clone <URL_REPO_GITHUB_CUA_NHOM>
cd chat-app-starter
```

---

### Bước 2: Cài đặt & Khởi chạy Backend (`server`)

Mở **Cửa sổ Terminal số 1**:

1. **Di chuyển vào thư mục `server/`**:
   ```bash
   cd server
   ```

2. **Cài đặt toàn bộ thư viện cần thiết**:
   ```bash
   npm install
   ```

3. **Tạo file cấu hình môi trường `.env`**:
   * *Trên Windows (PowerShell / CMD):*
     ```bash
     copy .env.example .env
     ```
   * *Trên macOS / Linux:*
     ```bash
     cp .env.example .env
     ```

4. **Kiểm tra file `server/.env`**:
   Mở file `.env` vừa tạo để kiểm tra, mặc định sẽ như sau:
   ```env
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/chat_app
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   ```
   *(Nếu dùng MongoDB Atlas, hãy thay chuỗi `MONGO_URI` bằng link kết nối của bạn).*

5. **Khởi chạy Server**:
   ```bash
   npm run dev
   # Hoặc: npm start
   ```
   *Khi thấy thông báo sau là Server đã chạy thành công:*
   ```text
   ✅ [Database] Đã kết nối MongoDB thành công: mongodb://localhost:27017/chat_app
   🚀 [Server] Đang chạy tại: http://localhost:3001
   📡 [Socket] Đang lắng nghe kết nối từ: http://localhost:5173
   ```

---

### Bước 3: Cài đặt & Khởi chạy Frontend (`client`)

Mở **Cửa sổ Terminal số 2** (giữ nguyên Terminal 1 đang chạy server):

1. **Di chuyển vào thư mục `client/`**:
   ```bash
   cd client
   ```

2. **Cài đặt toàn bộ thư viện giao diện**:
   ```bash
   npm install
   ```

3. **Tạo file cấu hình môi trường `.env`**:
   * *Trên Windows (PowerShell / CMD):*
     ```bash
     copy .env.example .env
     ```
   * *Trên macOS / Linux:*
     ```bash
     cp .env.example .env
     ```

4. **Kiểm tra file `client/.env`**:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SOCKET_URL=http://localhost:3001
   ```

5. **Khởi chạy ứng dụng Web (Vite)**:
   ```bash
   npm run dev
   ```
   *Màn hình hiển thị:*
   ```text
   VITE v5.4.8  ready in 200 ms
   ➜  Local:   http://localhost:5173/
   ```
6. **Mở trình duyệt web**: Truy cập vào `http://localhost:5173` để sử dụng ứng dụng.

---

## 🌿 3. Quy trình làm việc nhóm qua Git (Tránh Conflict)

Tất cả các thành viên khi bắt tay vào làm việc cần tuân theo đúng 5 bước sau:

1. **Chuyển sang nhánh `develop` và kéo code mới nhất về**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Tạo nhánh riêng theo công việc được phân công**:
   * **Thành viên A** (Auth, Profile, Rooms, Quản lý nhóm):
     ```bash
     git checkout -b feature/task-a-auth-profile
     ```
   * **Thành viên B** (Socket Chat, Tin nhắn, E2EE):
     ```bash
     git checkout -b feature/task-b-chat-e2ee
     ```
   * **Thành viên C** (WebRTC Video/Audio Call, Signaling):
     ```bash
     git checkout -b feature/task-c-webrtc-call
     ```

3. **Làm việc & Commit code thường xuyên**:
   Chỉ chỉnh sửa các file thuộc phạm vi phân công của mình (đã ghi chú rõ trong từng file).
   ```bash
   git add .
   git commit -m "feat: mo ta ngan gon chuc nang da lam"
   ```

4. **Đẩy nhánh lên GitHub**:
   ```bash
   git push -u origin <ten-nhanh-cua-ban>
   ```

5. **Tạo Pull Request (PR)**:
   * Lên GitHub tạo Pull Request từ nhánh của bạn vào nhánh `develop`.
   * Nhờ các thành viên khác kiểm tra và duyệt (Merge).

---

## ❓ 4. Các lỗi thường gặp & Cách xử lý nhanh

| Lỗi | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| `Error: connect ECONNREFUSED 127.0.0.1:27017` | Dịch vụ MongoDB trên máy chưa được bật. | Mở `services.msc` trên Windows -> Tìm `MongoDB Server` -> Chuột phải chọn **Start**. |
| `Không load được biến môi trường / Port undefined` | Quên chưa tạo file `.env`. | Chạy lệnh `copy .env.example .env` ở cả thư mục `server/` và `client/`. |
| `Error: listen EADDRINUSE: address already in use :::3001` | Cổng 3001 đang bị tiến trình khác chiếm dụng. | Mở Task Manager tắt tiến trình Node cũ, hoặc đổi `PORT=3002` trong `server/.env` và cập nhật lại `client/.env`. |
| `Cross-Origin Request Blocked (CORS)` | Frontend và Backend lệch cổng cấu hình. | Đảm bảo `CLIENT_URL` ở `server/.env` khớp với port của client (thường là `http://localhost:5173`). |
