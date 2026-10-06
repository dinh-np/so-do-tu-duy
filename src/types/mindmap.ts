// MindNode - Cấu trúc dữ liệu node thống nhất theo quy chuẩn dự án
export interface MindNode {
  id: string;
  topic: string;
  children?: MindNode[];
  image?: string;       // URL Supabase Storage hoặc Base64
  color?: string;       // Màu viền hoặc nền nhánh (hex)
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

// Dữ liệu mindmap đầy đủ (được lưu vào Supabase hoặc localStorage)
export interface MindmapDocument {
  id: string;
  title: string;
  root: MindNode;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Trạng thái editor
export type EditorView = 'mindmap' | 'gantt';

export interface EditorState {
  selectedNodeId: string | null;
  view: EditorView;
  zoom: number;
  isDirty: boolean;
}
