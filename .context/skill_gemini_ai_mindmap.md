# SKILL: GOOGLE GEMINI AI MINDMAP GENERATION

Đặc tả tích hợp Google Gemini API để tạo sơ đồ tư duy và mở rộng nhánh thông minh.

---

## 1. Nguyên Tắc Gọi API
* Tương tác qua **Next.js Server Actions** hoặc Route Handler `/api/ai/mindmap` để giữ bảo mật `GEMINI_API_KEY`.
* Bắt buộc sử dụng cấu hình **Structured JSON Output** để loại bỏ hoàn toàn rủi ro sai lệch định dạng.

---

## 2. System Instruction & Prompt Template
* **Model khuyến nghị:** `gemini-1.5-flash` hoặc `gemini-2.0-flash`.
* **Cấu hình Schema (JSON Schema):**
```json
{
  "type": "OBJECT",
  "properties": {
    "id": { "type": "STRING" },
    "topic": { "type": "STRING" },
    "children": {
      "type": "ARRAY",
      "items": { "$ref": "#" }
    }
  },
  "required": ["id", "topic", "children"]
}
```

* **System Prompt:**
> "Bạn là chuyên gia tư duy trực quan và sư phạm. Nhiệm vụ của bạn là phân tích chủ đề hoặc tài liệu người dùng cung cấp thành một sơ đồ tư duy (Mindmap) phân cấp logic, cô đọng, dễ hiểu. Cấu trúc gồm chủ đề trung tâm (Root), phân rã thành các nhánh ý chính cấp 1, và các nhánh chi tiết cấp 2-3."

---

## 3. Các Tính Năng AI Bắt Buộc
1. **Tạo sơ đồ từ chủ đề:** Nhập "Ôn tập Tin học 7 HK1" $\rightarrow$ AI sinh toàn bộ cây mindmap.
2. **Mở rộng nhánh (Expand Subtopics):** Nhận vào `topic` hiện tại của node $\rightarrow$ AI sinh 3-5 node con bổ sung.
3. **Tóm tắt văn bản:** Nhận một đoạn tài liệu dài $\rightarrow$ AI trích xuất sơ đồ tư duy tóm lược.