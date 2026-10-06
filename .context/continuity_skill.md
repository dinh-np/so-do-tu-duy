# CONTINUITY SKILL: HƯỚNG DẪN DUY TRÌ BỐI CẢNH DỰ ÁN CHO ANTIGRAVITY

## 1. Nguyên Tắc Cốt Lõi
1. **Luôn đọc `project_context.md` và `context_hub.md`** trước khi thực hiện bất kỳ lệnh lập trình hay sửa đổi file nào.
2. **Không làm thay đổi Design System đã quy định:** Tuyệt đối giữ đúng màu `#0066AB`, nền xám nhạt `#f8f9fa`, nền canvas `#ffffff`, và 2 bộ font `'Noto Sans'` cùng `'Georgia'`.
3. **Bảo toàn khả năng tương thích MindGenius:** Bất kỳ thay đổi nào trong cấu trúc `MindNode` đều phải đảm bảo ánh xạ được 2 chiều với thẻ `<Branch>` trong file `Document.xml` của MindGenius.
4. **Cập nhật tiến độ vào `context_hub.md`:** Sau mỗi lần hoàn thành một tính năng hoặc một sprint, AntiGravity phải cập nhật trạng thái tương ứng.

---

## 2. Checklist Kiểm Tra Chất Lượng Trước Khi Giao Task
- [ ] Tính năng mới có phá vỡ khả năng chạy Offline của PWA không?
- [ ] Phím tắt (`Tab`, `Enter`, `Delete`) trên Canvas có bị xung đột với phím tắt trình duyệt không?
- [ ] Dữ liệu sinh bởi Gemini AI có đúng cấu trúc JSON cây mà không bị thừa ký tự markdown không?
- [ ] File xuất ra (.pptx, .docx, .xlsx, .xml) có mở được trơn tru trên bộ Microsoft Office máy tính không?