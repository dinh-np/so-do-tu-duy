/**
 * SKILL: MINDGENIUS (.MGMX) PARSER & CONVERTER
 * Theo quy chuẩn skill_mindgenius_parser.md
 *
 * File .mgmx = ZIP chứa Document.xml
 * Cấu trúc: MindGeniusDocument > RootBranch > Branches > Branch (đệ quy)
 */

import JSZip from 'jszip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { MindNode } from '@/types/mindmap';
import { generateId } from './mindmap-utils';

// ============================================================
// IMPORT: .mgmx -> MindNode
// ============================================================

export async function parseMgmxFile(file: File): Promise<MindNode> {
  const zip = new JSZip();
  const unzipped = await zip.loadAsync(file);

  const docXmlFile = unzipped.file('Document.xml');
  if (!docXmlFile) {
    throw new Error('File không hợp lệ: Không tìm thấy Document.xml bên trong tệp .mgmx');
  }

  const xmlContent = await docXmlFile.async('text');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => name === 'Branch', // Luôn parse Branch thành mảng
  });
  const jsonObj = parser.parse(xmlContent);

  // Hỗ trợ cả hai cấu trúc MindGenius phổ biến
  const rootBranch =
    jsonObj?.MindGeniusDocument?.RootBranch ||
    jsonObj?.MindGeniusDocument?.Map?.Branch ||
    jsonObj?.Map?.Branch;

  if (!rootBranch) {
    throw new Error('Không đọc được cấu trúc sơ đồ từ file .mgmx');
  }

  return mapBranchToMindNode(rootBranch);
}

function mapBranchToMindNode(branch: Record<string, unknown>): MindNode {
  const children = branch.Branches as Record<string, unknown> | undefined;
  let branchArray: Record<string, unknown>[] = [];

  if (children?.Branch) {
    branchArray = Array.isArray(children.Branch)
      ? (children.Branch as Record<string, unknown>[])
      : [children.Branch as Record<string, unknown>];
  }

  return {
    id: (branch['@_Id'] as string) || generateId(),
    topic: (branch['@_Title'] as string) || 'Không có tiêu đề',
    color: (branch['@_Color'] as string) || undefined,
    note: (branch['@_Notes'] as string) || (branch.Notes as string) || undefined,
    children: branchArray.map(mapBranchToMindNode),
    task: branch['@_StartDate']
      ? {
          startDate: branch['@_StartDate'] as string,
          endDate: (branch['@_DueDate'] as string) || undefined,
          progress: Number(branch['@_PercentComplete'] || 0),
          assignee: (branch['@_Resource'] as string) || undefined,
        }
      : undefined,
  };
}

// ============================================================
// EXPORT: MindNode -> .mgmx
// ============================================================

export async function exportToMgmx(root: MindNode, title: string): Promise<void> {
  const xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
  });

  const xmlObj = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    MindGeniusDocument: {
      '@_Version': '14.0',
      '@_Creator': 'Sơ Đồ Tư Duy PWA',
      '@_CreatedDate': new Date().toISOString(),
      RootBranch: buildBranchXml(root),
    },
  };

  const xmlContent = xmlBuilder.build(xmlObj);
  const zip = new JSZip();
  zip.file('Document.xml', xmlContent);

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  downloadBlob(blob, `${sanitizeFilename(title)}.mgmx`);
}

function buildBranchXml(node: MindNode): Record<string, unknown> {
  const attrs: Record<string, string | number> = {
    '@_Id': node.id,
    '@_Title': node.topic,
  };

  if (node.color) attrs['@_Color'] = node.color;
  if (node.task?.startDate) attrs['@_StartDate'] = node.task.startDate;
  if (node.task?.endDate) attrs['@_DueDate'] = node.task.endDate;
  if (node.task?.progress !== undefined) attrs['@_PercentComplete'] = node.task.progress;
  if (node.task?.assignee) attrs['@_Resource'] = node.task.assignee;
  if (node.note) attrs['@_Notes'] = node.note;

  const result: Record<string, unknown> = { ...attrs };

  if (node.children && node.children.length > 0) {
    result.Branches = {
      Branch: node.children.map(buildBranchXml),
    };
  }

  return result;
}

// ============================================================
// HELPER
// ============================================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'so-do-tu-duy';
}
