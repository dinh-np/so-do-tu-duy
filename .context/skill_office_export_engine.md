# SKILL: MULTI-FORMAT OFFICE EXPORT ENGINE

Đặc tả kỹ thuật cho AntiGravity để triển khai xuất dữ liệu Mindmap ra bộ công cụ văn phòng Microsoft Office.

---

## 1. Xuất Microsoft PowerPoint (.pptx)
* **Thư viện:** `pptxgenjs`
* **Quy tắc dàn trang:**
  - `Slide 1 (Bìa)`: Nền trắng `#ffffff`, Tiêu đề font `Georgia` màu `#0066AB` lấy từ `root.topic`.
  - `Mỗi nhánh con cấp 1 (Main Branch)`: Tạo một Slide riêng:
    + Tiêu đề Slide: Font `Georgia`, màu `#0066AB`.
    + Nội dung: Dùng mảng text với định dạng bullet points lồng nhau theo cấp bậc con cấp 2, cấp 3 (`bullet: { indent: level * 20 }`).
    + Nếu nhánh có ảnh: Dùng `slide.addImage({ data: node.image, x: ..., y: ... })`.

---

## 2. Xuất Microsoft Excel (.xlsx - WBS Schedule)
* **Thư viện:** `exceljs` hoặc `xlsx`
* **Cấu trúc bảng tính:**
  | WBS | Cấp 1 | Cấp 2 | Cấp 3 | Ngày Bắt Đầu | Hạn Chót | Thời Lượng (Ngày) | Tiến Độ (%) | Người Thực Hiện |
  |:---:|---|---|---|:---:|:---:|:---:|:---:|:---:|
  | 1 | Tổng quan | | | 2026-10-01 | 2026-10-05 | 4 | 100% | Giáo viên |
  | 1.1 | | Bài 1 | | 2026-10-01 | 2026-10-03 | 2 | 80% | Học sinh A |
* Dùng đệ quy duyệt cây để gán mã WBS phân cấp (1, 1.1, 1.1.1...).

---

## 3. Xuất Microsoft Project (.xml - MSPDI)
* **Chuẩn:** MSPDI (Microsoft Project Data Interchange XML Schema).
* **Cấu trúc thẻ XML cốt lõi:**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Tên Dự Án</Name>
  <Tasks>
    <Task>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Tên Task</Name>
      <OutlineLevel>1</OutlineLevel>
      <OutlineNumber>1</OutlineNumber>
      <Start>2026-10-01T08:00:00</Start>
      <Finish>2026-10-05T17:00:00</Finish>
      <PercentComplete>50</PercentComplete>
    </Task>
  </Tasks>
</Project>
```

---

## 4. Xuất Microsoft Word (.docx)
* **Thư viện:** `docx`
* **Ánh xạ Style:**
  - `Root Node`: Heading 1 (Title phong cách Georgia, màu `#0066AB`).
  - `Level 1 Children`: Heading 2.
  - `Level 2+ Children`: Paragraphs có bullet points phân cấp thụt lề chuẩn.