import { MindNode, MindmapDocument } from '@/types/mindmap';

// Tạo ID ngẫu nhiên
export function generateId(): string {
  return crypto.randomUUID();
}

// Dữ liệu mẫu mặc định khi tạo sơ đồ mới
export function createDefaultMindmap(): MindmapDocument {
  return {
    id: generateId(),
    title: 'Sơ đồ tư duy mới',
    root: {
      id: generateId(),
      topic: 'Chủ đề trung tâm',
      children: [
        {
          id: generateId(),
          topic: 'Ý tưởng 1',
          children: [
            { id: generateId(), topic: 'Chi tiết 1.1', children: [] },
            { id: generateId(), topic: 'Chi tiết 1.2', children: [] },
          ],
        },
        {
          id: generateId(),
          topic: 'Ý tưởng 2',
          children: [
            { id: generateId(), topic: 'Chi tiết 2.1', children: [] },
          ],
        },
        {
          id: generateId(),
          topic: 'Ý tưởng 3',
          children: [],
        },
      ],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Tìm node theo ID (đệ quy)
export function findNodeById(root: MindNode, id: string): MindNode | null {
  if (root.id === id) return root;
  if (!root.children) return null;
  for (const child of root.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

// Tìm node cha theo ID con
export function findParentById(root: MindNode, childId: string): MindNode | null {
  if (!root.children) return null;
  for (const child of root.children) {
    if (child.id === childId) return root;
    const found = findParentById(child, childId);
    if (found) return found;
  }
  return null;
}

// Deep clone một node
export function cloneNode(node: MindNode): MindNode {
  return JSON.parse(JSON.stringify(node));
}

// Lưu mindmap vào localStorage
export function saveMindmapLocal(doc: MindmapDocument): void {
  if (typeof window === 'undefined') return;
  try {
    const docs = listLocalMindmaps();
    const idx = docs.findIndex(d => d.id === doc.id);
    const updated = { ...doc, updated_at: new Date().toISOString() };
    if (idx >= 0) {
      docs[idx] = updated;
    } else {
      docs.unshift(updated);
    }
    localStorage.setItem('mindmap_docs', JSON.stringify(docs));
    localStorage.setItem('mindmap_current_id', doc.id);
  } catch (e) {
    console.error('Lỗi lưu mindmap:', e);
  }
}

// Đọc danh sách mindmap từ localStorage
export function listLocalMindmaps(): MindmapDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('mindmap_docs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Đọc mindmap hiện tại
export function loadCurrentMindmap(): MindmapDocument | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem('mindmap_current_id');
    if (!id) return null;
    const docs = listLocalMindmaps();
    return docs.find(d => d.id === id) || null;
  } catch {
    return null;
  }
}

// Màu pastel cho các nhánh cấp 1
export const BRANCH_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

export function getBranchColor(index: number): string {
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}

// Format ngày YYYY-MM-DD sang hiển thị
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}
