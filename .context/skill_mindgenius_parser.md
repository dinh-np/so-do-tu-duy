# SKILL: MINDGENIUS (.MGMX) PARSER & CONVERTER

Tài liệu hướng dẫn AntiGravity cách xử lý định dạng file `.mgmx` của phần mềm MindGenius.

---

## 1. Bản Chất Của File `.mgmx`
* File `.mgmx` thực chất là một file nén chuẩn ZIP.
* File trung tâm chứa dữ liệu sơ đồ là `Document.xml`.
* Bên trong `Document.xml`, các nhánh được tổ chức dưới thẻ phân cấp lồng nhau: `<Branches>` $\rightarrow$ `<Branch>`.

---

## 2. Quy Trình Import File .mgmx Vào Ứng Dụng
Sử dụng thư viện `jszip` và `fast-xml-parser`:

```typescript
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { MindNode } from '@/types/mindmap';

export async function parseMgmxFile(file: File): Promise<MindNode> {
  const zip = new JSZip();
  const unzipped = await zip.loadAsync(file);
  
  const docXmlFile = unzipped.file('Document.xml');
  if (!docXmlFile) {
    throw new Error('File không hợp lệ: Không tìm thấy Document.xml bên trong tệp .mgmx');
  }

  const xmlContent = await docXmlFile.async('text');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const jsonObj = parser.parse(xmlContent);

  // Ánh xạ cây XML sang chuẩn MindNode
  return mapBranchToMindNode(jsonObj.MindGeniusDocument.RootBranch);
}

function mapBranchToMindNode(branch: any): MindNode {
  return {
    id: branch['@_Id'] || crypto.randomUUID(),
    topic: branch['@_Title'] || 'Không có tiêu đề',
    color: branch['@_Color'] || undefined,
    children: branch.Branches?.Branch 
      ? (Array.isArray(branch.Branches.Branch) 
          ? branch.Branches.Branch.map(mapBranchToMindNode)
          : [mapBranchToMindNode(branch.Branches.Branch)])
      : [],
    task: branch['@_StartDate'] ? {
      startDate: branch['@_StartDate'],
      endDate: branch['@_DueDate'],
      progress: Number(branch['@_PercentComplete'] || 0),
    } : undefined
  };
}
```

---

## 3. Quy Trình Export Ra File .mgmx
1. Sử dụng `XMLBuilder` của `fast-xml-parser` để dựng ngược cấu trúc XML từ `MindNode`.
2. Tạo file ZIP mới bằng `JSZip`, thêm `Document.xml` vào file nén.
3. Kích hoạt tải về dưới tên `<Tên_Sơ_Đồ>.mgmx`.