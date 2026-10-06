# CONTEXT HUB: SƠ ĐỒ TƯ DUY (MINDMAP PWA)

Tệp này đóng vai trò trung tâm điều phối trạng thái, theo dõi tiến độ các Sprint và lưu lại các quyết định kiến trúc quan trọng cho AntiGravity.

---

## 1. Trạng Thái Hiện Tại Của Dự Án
* **Giai đoạn:** Sprint 1 Hoàn thành → Sẵn sàng Sprint 2.
* **Người dùng ủy quyền:** `dinh-np`
* **Môi trường:** Local Development (`http://localhost:3000`) & Triển khai Vercel PWA.
* **Cập nhật lần cuối:** 28/09/2026

---

## 2. Lộ Trình Triển Khai (Sprint Roadmap)

| Sprint | Hạng mục công việc chính | Trạng thái | Ghi chú kỹ thuật |
|:---:|---|:---:|---|
| **Sprint 1** | Khởi tạo Next.js, cấu hình PWA, Theme Krones, Canvas Editor cơ bản | ✅ Hoàn thành | Build OK. `mind-elixir` v4 API, phím tắt đầy đủ |
| **Sprint 2** | Supabase Auth, Database Schema, Import/Export MindGenius (.mgmx) | 🟡 Một phần | `mgmx-parser.ts` xong. Cần thêm Supabase Auth + CRUD |
| **Sprint 3** | Tích hợp Google Gemini AI, Chế độ Gantt Chart View | 🟡 Một phần | `/api/ai/mindmap` xong. Gantt = placeholder |
| **Sprint 4** | Hệ thống Xuất Office & Tinh chỉnh PWA | 🟡 Một phần | `export-engine.ts` xong (PPTX/DOCX/XLSX/XML/PNG/PDF) |

### ✅ Sprint 1 - Hoàn thành (28/09/2026)
Các file đã tạo tại `e:\SourceCode\smart_mindmap\so-do-tu-duy\`:
- `src/app/layout.tsx` - Noto Sans font, PWA meta, SEO
- `src/app/globals.css` - Krones Design System đầy đủ CSS Variables
- `src/app/page.tsx` - Main page, auto-save, keyboard shortcuts
- `src/app/api/ai/mindmap/route.ts` - Gemini API với JSON Schema
- `src/components/MindmapEditor.tsx` - mind-elixir wrapper
- `src/components/Toolbar.tsx` - Thanh công cụ đầy đủ
- `src/components/InspectorPanel.tsx` - Bảng thuộc tính (Style + Task)
- `src/components/AIDialog.tsx` - Dialog tạo sơ đồ bằng AI
- `src/components/ExportDialog.tsx` - Dialog xuất đa định dạng
- `src/lib/mindmap-utils.ts` - CRUD utilities, localStorage
- `src/lib/mgmx-parser.ts` - Import/Export .mgmx
- `src/lib/export-engine.ts` - PPTX, DOCX, XLSX, XML, PNG, PDF
- `src/types/mindmap.ts` - MindNode interface
- `public/manifest.json` - PWA manifest

### 📌 Sprint 2 - Việc cần làm tiếp theo
1. Tích hợp Supabase Client (`@supabase/supabase-js`)
2. Trang đăng nhập/đăng ký (Email + Google OAuth)
3. Middleware bảo vệ route
4. Lưu/đọc mindmap từ Supabase (`mindmaps` table)
5. Danh sách sơ đồ cá nhân (Sidebar)
6. Test thực tế import/export .mgmx với file MindGenius thật

---

## 3. Các Quyết Định Kiến Trúc Trọng Tâm (ADR - Architectural Decisions)
* **ADR-01 (Next.js thay vì Vite):** Dự án sử dụng Next.js App Router nhằm đồng bộ với năng lực của nhóm và tận dụng Server Actions cho API Keys (Gemini & Supabase Service Role) bảo mật.
* **ADR-02 (Local-First kết hợp Cloud Sync):** Mindmap ưu tiên lưu trạng thái vào IndexedDB/LocalStorage khi offline; tự động đồng bộ lên Supabase khi có kết nối mạng và người dùng đã đăng nhập.
* **ADR-03 (Format MindGenius):** File `.mgmx` bản chất là zip file chứa `Document.xml`. Việc giải nén và đóng gói diễn ra hoàn toàn ở Client bằng `JSZip` để giảm tải tối đa cho server.
* **ADR-04 (Design System Đồng Bộ):** Toàn bộ giao diện áp dụng chuẩn Krones Corporate Light: màu nhấn `#0066AB`, bề mặt `#f8f9fa`, nền `#ffffff`, font `Noto Sans` và `Georgia`.
* **ADR-05 (mind-elixir v4 API):** Sử dụng `me.bus.addListener('selectNodes', ...)` thay vì `'selectNode'`; không có option `draggable` (luôn bật); `MindElixirInstance = InstanceType<typeof MindElixir>`.
* **ADR-06 (Gemini response.text):** Trong `@google/genai` v2+, `response.text` là property getter, không phải method. Không gọi `response.text()`.