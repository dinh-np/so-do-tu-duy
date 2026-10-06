# SKILL: MULTI-FORMAT OFFICE & MEDIA EXPORT ENGINE

## 1. Microsoft PowerPoint (.pptx) — `pptxgenjs`
- Slide 1 (Title Card): Root topic title (Georgia font, white text, background `#0066AB`).
- Slides 2+ (Branch Decks): Each Level 1 branch generates an individual slide:
  - Slide Header: Level 1 topic name (Noto Sans, Bold, `#0066AB`).
  - Slide Body: Hierarchical bullet points mapping Level 2 and Level 3 sub-nodes.
  - Speaker Notes: Populated automatically from `node.presentation.speakerNotes`.
  - Fallback Fonts: Noto Sans, Calibri, Arial.

## 2. Microsoft Word (.docx) — `docx`
- Root Node -> Document Title (Georgia, Bold, 26pt, `#0066AB`).
- Level 1 Branches -> Heading 1 (Noto Sans, Bold, 18pt, `#004B7D`).
- Level 2 Branches -> Heading 2 (Noto Sans, Semi-Bold, 14pt).
- Deeper Branches -> Ordered / Unordered Bullet Lists with embedded descriptions.

## 3. Microsoft Excel (.xlsx - WBS & RACI Matrix) — `exceljs`
- Sheet 1 (Work Breakdown Structure):
  - Columns: WBS Code (`1`, `1.1`, `1.1.1`), Task Name, Assignee, Start Date, End Date, Duration (days), Progress (%), Status.
  - Formatting: Header filled with `#0066AB` (white text), progress rendered with cell data bars.
- Sheet 2 (RACI Matrix):
  - 2D grid: WBS Tasks (Rows) vs. Stakeholders (Columns) filled with R, A, C, I badges.
- Sheet 3 (Risk Heatmap):
  - List of risks with Probability, Impact, Risk Score ($P \times I$), and Mitigation Plans.

## 4. Microsoft Project (.xml - MSPDI Format) — `fast-xml-parser`
- Generates standard Microsoft Project Data Interchange (MSPDI) XML.
- Each node creates a `<Task>` element.
- Auto-computes and maps: `<UID>`, `<ID>`, `<Name>`, `<Start>`, `<Finish>`, `<Duration>`, `<PercentComplete>`, `<OutlineLevel>`, and `<OutlineNumber>` (e.g. 1.1.2).
- Preserves task predecessor links `<PredecessorLink>` for automated Critical Path calculation in MS Project Desktop.

## 5. High-Resolution PDF & PNG — `html-to-image` + `jspdf`
- **Resolution Safety Clamping:** Limit export canvas dimensions to max 4096px width/height to avoid mobile RAM panics (Out-Of-Memory errors).
- **PDF Formatting:** Standard A4 Landscape orientation, auto-scaled and centered.
