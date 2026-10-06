import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `Bạn là chuyên gia tư duy trực quan và sư phạm. Nhiệm vụ của bạn là phân tích chủ đề hoặc tài liệu người dùng cung cấp thành một sơ đồ tư duy (Mindmap) phân cấp logic, cô đọng, dễ hiểu. Cấu trúc gồm chủ đề trung tâm (Root), phân rã thành các nhánh ý chính cấp 1 (3-7 nhánh), và các nhánh chi tiết cấp 2-3 cho mỗi nhánh cấp 1 (2-5 mục con). Sử dụng tiếng Việt cho toàn bộ nội dung. Đảm bảo mỗi node có topic ngắn gọn, súc tích (tối đa 8 từ). Mỗi node phải có id dạng chuỗi duy nhất ngắn (ví dụ: "n1", "n1-1", "n1-1-1").`;

// JSON Schema cho MindNode (phẳng - Gemini không hỗ trợ $ref đệ quy)
const MINDNODE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    topic: { type: 'string' },
    children: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          topic: { type: 'string' },
          children: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                topic: { type: 'string' },
                children: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      topic: { type: 'string' },
                      children: { type: 'array', items: { type: 'object' } },
                    },
                    required: ['id', 'topic'],
                  },
                },
              },
              required: ['id', 'topic'],
            },
          },
        },
        required: ['id', 'topic'],
      },
    },
  },
  required: ['id', 'topic', 'children'],
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode } = await request.json() as { prompt: string; mode: 'topic' | 'text' };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt không được để trống' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY chưa được cấu hình' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = mode === 'topic'
      ? `Tạo sơ đồ tư duy toàn diện về chủ đề: "${prompt}"`
      : `Đọc và tóm tắt tài liệu sau thành sơ đồ tư duy phân cấp:\n\n${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: MINDNODE_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'AI không trả về dữ liệu' }, { status: 500 });
    }

    const mindNode = JSON.parse(text);
    return NextResponse.json({ data: mindNode });

  } catch (error) {
    console.error('[AI Mindmap API Error]:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json({ error: `Lỗi tạo sơ đồ: ${message}` }, { status: 500 });
  }
}
