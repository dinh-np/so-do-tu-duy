/**
 * SKILL: MULTI-FORMAT OFFICE EXPORT ENGINE
 * Theo quy chuẩn skill_office_export_engine.md
 *
 * Hỗ trợ: PPTX, DOCX, XLSX, MS Project XML, PNG, PDF
 */

import { MindNode } from '@/types/mindmap';
import { downloadBlob } from './mgmx-parser';

// ============================================================
// HELPER: Duyệt cây để build WBS
// ============================================================

interface FlatNode {
  node: MindNode;
  level: number;
  wbs: string;
}

function flattenTree(node: MindNode, level = 0, prefix = ''): FlatNode[] {
  const result: FlatNode[] = [{ node, level, wbs: prefix || '0' }];
  node.children?.forEach((child, i) => {
    const wbs = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
    result.push(...flattenTree(child, level + 1, wbs));
  });
  return result;
}

// ============================================================
// EXPORT: PowerPoint (.pptx)
// ============================================================

export async function exportToPptx(root: MindNode, title: string): Promise<void> {
  const { default: pptxgen } = await import('pptxgenjs');
  const prs = new pptxgen();

  prs.layout = 'LAYOUT_WIDE';
  prs.author = 'Sơ Đồ Tư Duy PWA';
  prs.title = title;

  // Slide 1: Cover
  const cover = prs.addSlide();
  cover.background = { color: 'FFFFFF' };
  cover.addText(title, {
    x: 1, y: 2, w: 8, h: 1.5,
    fontFace: 'Georgia',
    fontSize: 36,
    bold: true,
    color: '0066AB',
    align: 'center',
  });
  cover.addShape(prs.ShapeType.rect, {
    x: 3.5, y: 3.7, w: 3, h: 0.07,
    fill: { color: '0066AB' },
    line: { color: '0066AB' },
  });
  cover.addText('Sơ Đồ Tư Duy', {
    x: 1, y: 4, w: 8, h: 0.5,
    fontFace: 'Noto Sans',
    fontSize: 14,
    color: '64748B',
    align: 'center',
  });

  // Mỗi nhánh cấp 1 = 1 slide
  root.children?.forEach((branch) => {
    const slide = prs.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title
    slide.addText(branch.topic, {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontFace: 'Georgia',
      fontSize: 24,
      bold: true,
      color: '0066AB',
    });

    // Horizontal rule
    slide.addShape(prs.ShapeType.rect, {
      x: 0.5, y: 1.1, w: 9, h: 0.04,
      fill: { color: '0066AB' },
      line: { color: '0066AB' },
    });

    // Image if exists
    let contentX = 0.5;
    let contentW = 9;
    if (branch.image && branch.image.startsWith('data:image')) {
      try {
        slide.addImage({ data: branch.image, x: 7, y: 1.3, w: 2.3, h: 2.3 });
        contentW = 6;
      } catch {
        // ignore image errors
      }
    }

    // Build bullet points from children
    const bulletItems: { text: string; options: { bullet: { indent: number }; indentLevel: number; fontSize: number; bold: boolean; color: string } }[] = [];

    function addBullets(node: MindNode, level: number) {
      bulletItems.push({
        text: node.topic,
        options: {
          bullet: { indent: level * 20 },
          indentLevel: level,
          fontSize: level === 0 ? 16 : 13,
          bold: level === 0,
          color: level === 0 ? '0f172a' : '334155',
        },
      });
      node.children?.forEach(child => addBullets(child, level + 1));
    }

    branch.children?.forEach(child => addBullets(child, 0));

    if (bulletItems.length > 0) {
      slide.addText(bulletItems, {
        x: contentX, y: 1.3, w: contentW, h: 4.5,
        fontFace: 'Noto Sans',
        valign: 'top',
      });
    }

    // Task info bar at bottom
    if (branch.task?.startDate) {
      slide.addText(
        `📅 ${branch.task.startDate} → ${branch.task.endDate || '?'} | ⏱ Tiến độ: ${branch.task.progress || 0}%`,
        {
          x: 0.5, y: 6.2, w: 9, h: 0.4,
          fontFace: 'Noto Sans',
          fontSize: 10,
          color: '64748B',
          align: 'left',
        }
      );
    }
  });

  const blob = await prs.write({ outputType: 'blob' }) as Blob;
  downloadBlob(blob, `${title}.pptx`);
}

// ============================================================
// EXPORT: Excel (.xlsx) - WBS Schedule
// ============================================================

export async function exportToXlsx(root: MindNode, title: string): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sơ Đồ Tư Duy PWA';
  wb.created = new Date();
  wb.title = title;

  const ws = wb.addWorksheet('Phân rã công việc (WBS)', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Header row
  const headers = ['WBS', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Ngày BĐ', 'Hạn chót', 'Thời lượng (ngày)', 'Tiến độ (%)', 'Người thực hiện', 'Ưu tiên'];
  ws.columns = headers.map((h, i) => ({
    header: h,
    key: h,
    width: [8, 22, 22, 22, 14, 14, 18, 14, 18, 10][i],
  }));

  // Style header
  const headerRow = ws.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066AB' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Noto Sans', size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF004B7D' } },
    };
  });
  headerRow.height = 32;

  // Data rows
  const flatNodes = flattenTree(root).slice(1); // bỏ root
  flatNodes.forEach(({ node, level, wbs }, idx) => {
    const cols = ['', '', '', ''];
    if (level > 0 && level <= 3) cols[level] = node.topic;
    else if (level === 0) cols[0] = node.topic;

    const row = ws.addRow([
      wbs,
      ...cols,
      node.task?.startDate || '',
      node.task?.endDate || '',
      node.task?.duration || '',
      node.task?.progress !== undefined ? `${node.task.progress}%` : '',
      node.task?.assignee || '',
      node.task?.priority || '',
    ]);

    // Alternate row colors
    if (idx % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
      });
    }

    // Level 1 bold
    if (level === 1) {
      row.getCell(2).font = { bold: true, name: 'Noto Sans', size: 10 };
    }

    row.height = 22;
    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle' };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } };
    });
  });

  // Auto filter
  ws.autoFilter = { from: 'A1', to: `J1` };

  const buffer = await wb.xlsx.writeBuffer();
  // Cast to ArrayBuffer để tương thích với Blob
  downloadBlob(new Blob([buffer as unknown as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${title}.xlsx`);
}

// ============================================================
// EXPORT: Microsoft Word (.docx)
// ============================================================

export async function exportToDocx(root: MindNode, title: string): Promise<void> {
  const { Document, Paragraph, HeadingLevel, AlignmentType, TextRun, Packer } = await import('docx');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [];

  // Title (Heading 1 = Root node)
  children.push(new Paragraph({
    text: root.topic,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  }));

  // Recursive tree to paragraphs
  function addParagraphs(node: MindNode, level: number) {
    if (level === 1) {
      children.push(new Paragraph({
        text: node.topic,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }));
    } else if (level === 2) {
      children.push(new Paragraph({
        text: node.topic,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 60 },
      }));
    } else {
      children.push(new Paragraph({
        bullet: { level: level - 3 },
        children: [new TextRun({ text: node.topic, size: 22 })],
        spacing: { after: 40 },
      }));
    }

    if (node.note) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `💬 ${node.note}`, italics: true, color: '64748B', size: 20 })],
        indent: { left: 360 * level },
        spacing: { after: 30 },
      }));
    }

    node.children?.forEach(child => addParagraphs(child, level + 1));
  }

  root.children?.forEach(child => addParagraphs(child, 1));

  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: { font: 'Georgia', size: 36, bold: true, color: '0066AB' },
        },
        heading2: {
          run: { font: 'Georgia', size: 26, bold: true, color: '0066AB' },
        },
        heading3: {
          run: { font: 'Noto Sans', size: 22, bold: true, color: '334155' },
        },
        document: {
          run: { font: 'Noto Sans', size: 22, color: '0f172a' },
        },
      },
    },
    sections: [{ children }],
    title,
    creator: 'Sơ Đồ Tư Duy PWA',
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${title}.docx`);
}

// ============================================================
// EXPORT: MS Project XML (MSPDI)
// ============================================================

export async function exportToMsProject(root: MindNode, title: string): Promise<void> {
  const { XMLBuilder } = await import('fast-xml-parser');
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
  });

  const flatNodes = flattenTree(root).slice(1);
  let uid = 1;

  const tasks = flatNodes.map(({ node, level, wbs }) => ({
    UID: uid,
    ID: uid++,
    Name: node.topic,
    OutlineLevel: level,
    OutlineNumber: wbs,
    Start: node.task?.startDate ? `${node.task.startDate}T08:00:00` : undefined,
    Finish: node.task?.endDate ? `${node.task.endDate}T17:00:00` : undefined,
    PercentComplete: node.task?.progress || 0,
    Duration: node.task?.duration ? `PT${node.task.duration * 8}H0M0S` : undefined,
    Notes: node.note,
  }));

  const xmlObj = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8', '@_standalone': 'yes' },
    Project: {
      '@_xmlns': 'http://schemas.microsoft.com/project',
      Name: title,
      Title: title,
      CreationDate: new Date().toISOString(),
      LastSaved: new Date().toISOString(),
      Tasks: { Task: tasks },
    },
  };

  const xmlContent = builder.build(xmlObj);
  downloadBlob(
    new Blob([xmlContent], { type: 'application/xml' }),
    `${title}.xml`
  );
}

// ============================================================
// EXPORT: PNG (Canvas screenshot)
// ============================================================

export async function exportToPng(title: string): Promise<void> {
  const { toPng } = await import('html-to-image');
  const canvas = document.querySelector('#mindmap-canvas') as HTMLElement;
  if (!canvas) throw new Error('Không tìm thấy canvas');

  const dataUrl = await toPng(canvas, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  const a = document.createElement('a');
  a.download = `${title}.png`;
  a.href = dataUrl;
  a.click();
}

// ============================================================
// EXPORT: PDF
// ============================================================

export async function exportToPdf(title: string): Promise<void> {
  const { toPng } = await import('html-to-image');
  const { jsPDF } = await import('jspdf');

  const canvas = document.querySelector('#mindmap-canvas') as HTMLElement;
  if (!canvas) throw new Error('Không tìm thấy canvas');

  const dataUrl = await toPng(canvas, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise(res => { img.onload = res; });

  const pdf = new jsPDF({
    orientation: img.width > img.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [img.width / 2, img.height / 2],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
  pdf.save(`${title}.pdf`);
}
