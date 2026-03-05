# 🚀 Trava Frontend - Productivity & Team Collaboration Platform

[![Angular](https://img.shields.io/badge/Angular-18.2-dd0031.svg?logo=angular)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwind-css)]()
[![PrimeNG](https://img.shields.io/badge/PrimeNG-18.0-e91e63.svg?logo=primefaces)]()
[![Supabase](https://img.shields.io/badge/Supabase-Auth/DB-3ecf8e.svg?logo=supabase)]()

**Trava Frontend** là giao diện người dùng hiện đại của hệ sinh thái Trava, được thiết kế để tối ưu hóa năng suất làm việc cá nhân và cộng tác đội nhóm. Với trải nghiệm người dùng mượt mà, hệ thống giúp việc quản lý không gian làm việc và tiến độ công việc trở nên trực quan và hiệu quả hơn.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Core Frameworks & UI
*   **Framework:** Angular 18 (Cấu trúc modulized, hiệu năng cao).
*   **UI Library:** [PrimeNG 18](https://primeng.org/) - Bộ components phong phú và hiện đại.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS giúp tùy biến giao diện linh hoạt.
*   **Icons:** PrimeIcons.
*   **Charts:** Chart.js hỗ trợ trực quan hóa dữ liệu trên Dashboard.

### Services & Integration
*   **Authentication & Real-time:** [Supabase](https://supabase.com/) (Tích hợp xác thực và quản lý database thời gian thực).
*   **API Client:** Angular HttpClient (Kết nối với .NET Backend).
*   **State Management:** RxJS (Quản lý luồng dữ liệu bất đồng bộ).
*   **Environment Management:** Dotenv & Custom Webpack Config.

---

## ✨ Tính Năng Chính (Core Features)

*   📊 **Dashboard Tổng Quan:** Theo dõi tiến độ công việc, thống kê nhiệm vụ thông qua các biểu đồ trực quan.
*   🏢 **Quản lý Không gian làm việc (Spaces):** Tạo mới, chỉnh sửa và quản lý các không gian làm việc chung hoặc cá nhân.
*   📋 **Bảng Công Việc (Task Board):** 
    *   Quản lý Task theo trạng thái, độ ưu tiên.
    *   Hỗ trợ Sub-tasks, Points và thời hạn hoàn thành (Due dates).
    *   Hệ thống bình luận tương tác trực tiếp trên từng Task.
*   📩 **Quản lý Lời mời (Invitations):** Tiếp nhận và xử lý các lời mời tham gia Space từ các thành viên khác.
*   👤 **Hồ sơ Cá nhân (User Profile):** Quản lý thông tin tài khoản, cài đặt bảo mật và tùy chỉnh trải nghiệm cá nhân.
*   🌓 **Giao diện Responsive:** Hiển thị tốt trên đa dạng thiết bị (Desktop, Tablet, Mobile).

---

## 📂 Cấu Trúc Mã Nguồn (Directory Structure)

```bash
src/app/
├── core/             # Services, Guards, Interceptors, Models cốt lõi
├── shared/           # Components, Directives, Pipes dùng chung
├── features/         # Các module tính năng chính
│   ├── dashboard/    # Giao diện tổng quan
│   ├── spaces/       # Quản lý không gian làm việc
│   ├── tasks/        # Quản lý công việc & board
│   ├── invitations/  # Hệ thống lời mời
│   ├── user/         # Đăng ký, đăng nhập
│   └── profile/      # Cài đặt cá nhân
└── assets/           # Hình ảnh, icons, cấu hình tĩnh
```

---

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

### 1. Yêu cầu hệ thống
*   [Node.js](https://nodejs.org/) (Version 18.x hoặc mới hơn).
*   [npm](https://www.npmjs.com/) (Hoặc Yarn/pnpm).
*   [Angular CLI](https://angular.dev/tools/cli) installed globally (`npm install -g @angular/cli`).

### 2. Cấu hình môi trường (Environment Setup)
Tạo file `.env` tại thư mục gốc của dự án và cấu hình các thông số sau:
```env
BASE_API_URL=https://your-api-url.com/api
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

### 3. Cài đặt Dependencies
```bash
npm install
```

### 4. Chạy dự án ở chế độ Development
```bash
npm start
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:4200/`

### 5. Build cho Production
```bash
npm run build
```
Kết quả build sẽ nằm trong thư mục `dist/`.

---

## 🎨 Quy chuẩn Code (Code Standards)
Dự án sử dụng **Prettier** để đảm bảo tính nhất quán về định dạng code.
*   Định dạng lại toàn bộ code: `npm run format`
*   Kiểm tra lỗi định dạng: `npm run format:check`

---

Developed with ❤️ by Minh Thuan.
