# PROJECT CONTEXT: SƠ ĐỒ TƯ DUY (MINDMAP PWA)

## 1. Thông Tin Chung
* **Tên ứng dụng:** Sơ Đồ Tư Duy (Mindmap PWA)
* **Tên Repository/Folder:** `so-do-tu-duy`
* **Mục tiêu sản phẩm:** Ứng dụng Progressive Web App (PWA) cao cấp kết hợp giữa tư duy trực quan (Mindmapping) và quản lý tiến độ dự án (Project Schedule & Gantt Chart). Hỗ trợ đọc/ghi file `.mgmx` của phần mềm MindGenius, sinh sơ đồ bằng Google Gemini AI, đồng bộ thời gian thực qua Supabase và xuất trọn bộ định dạng Microsoft Office (Word, PowerPoint, Excel, MS Project XML) cùng PDF/PNG.

---

## 2. Design System: Krones Inspired Corporate Light Theme
* **Triết lý:** Chuyên nghiệp, sạch sẽ, tối giản, độ tương phản cao, tối ưu cho môi trường giáo dục và doanh nghiệp.
* **Màu sắc:**
  - `Primary / Accent`: `#0066AB` (Krones Corporate Blue - Dùng cho Root Node, Header, Nút chính CTA, Viền active).
  - `Primary Hover`: `#004B7D`.
  - `Canvas Background`: `#ffffff`.
  - `Surface / Panels Background`: `#f8f9fa` (Sidebar, Toolbar, Modal, Inspector Task panel).
  - `Borders & Separators`: `#e2e8f0` / `#cbd5e1`.
  - `Text Primary`: `#0f172a` (Slate 900).
  - `Text Muted`: `#64748b` (Slate 500).
* **Typography:**
  - `Body / UI / Nodes`: `'Noto Sans', sans-serif` (Đảm bảo font chữ sắc nét và hiển thị tiếng Việt hoàn hảo).
  - `Headings / Covers / Slide Titles`: `'Georgia', serif`.

---

## 3. Tech Stack Quy Chuẩn
* **Framework:** Next.js (App Router, TypeScript, React 19, Tailwind CSS, Lucide React Icons).
* **Nền tảng PWA:** `@ducanh2912/next-pwa` hoặc `serwist` (Hỗ trợ Service Worker, Web App Manifest, Cache Offline).
* **Cơ sở dữ liệu & Xác thực:** Supabase (PostgreSQL, Supabase Auth, Row Level Security - RLS, Storage bucket `mindmap-assets`).
* **Trí tuệ nhân tạo (AI):** Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash` qua Server Actions, ép chuẩn JSON Schema).
* **Lõi Mindmap Engine:** `mind-elixir` (hoặc Hybrid Canvas/SVG Lines + HTML DOM Nodes) hỗ trợ phím tắt và auto-layout.
* **Gantt Engine:** `frappe-gantt` (ánh xạ 2 chiều với dữ liệu mindmap).
* **Thư viện xử lý Tệp & Export:**
  - MindGenius (.mgmx): `jszip` + `fast-xml-parser`.
  - PowerPoint (.pptx): `pptxgenjs`.
  - Excel (.xlsx): `exceljs` hoặc `xlsx` (SheetJS).
  - Microsoft Project (.xml): `fast-xml-parser` (theo chuẩn XML MSPDI).
  - Word (.docx): `docx`.
  - Ảnh & PDF: `html-to-image` + `jspdf`.

---

## 4. Cấu Trúc Dữ Liệu Node Thống Nhất (`MindNode`)
```typescript
export interface MindNode {
  id: string;
  topic: string;
  children?: MindNode[];
  image?: string;       // URL Supabase Storage hoặc Base64
  color?: string;       // Màu viền hoặc nền nhánh
  note?: string;        // Ghi chú chi tiết
  task?: {
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    duration?: number;  // Số ngày
    progress?: number;  // 0 - 100%
    assignee?: string;  // Người thực hiện
    priority?: 'low' | 'medium' | 'high';
  };
}
```