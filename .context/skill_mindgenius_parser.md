---

### 5. `.context/skill_mindgenius_parser.md`

```markdown
# SKILL: MINDGENIUS (.MGMX) TWO-WAY PARSER & BUILDER

## 1. Import Pipeline (.mgmx -> MindNode)
A `.mgmx` file is a ZIP archive containing a core `Document.xml` data payload.
- **Libraries:** `jszip` + `fast-xml-parser`.
- **Parsing Flow:**
  1. `const zip = await JSZip.loadAsync(fileBlob);`
  2. `const xmlContent = await zip.file("Document.xml").async("text");`
  3. Instantiate `XMLParser` with options: `{ ignoreAttributes: false, attributeNamePrefix: "@_" }`.
  4. Recursively traverse the XML tree `<Branches> -> <Branch>`:
     - Map branch titles to `node.topic`.
     - Map notes/descriptions to `node.description`.
     - Map start dates and due dates to `node.task.startDate` and `node.task.endDate`.
     - Map node styles/colors to `node.color`.
  5. Commit generated `MindNode` tree into Dexie.js and trigger canvas auto-centering.

## 2. Export Pipeline (MindNode -> .mgmx)
- **Generation Flow:**
  1. Read active `MindNode` tree from Dexie.js.
  2. Construct a compliant XML tree adhering to the MindGenius `Document.xml` schema.
  3. **Strict Encoding:** Ensure XML begins with `<?xml version="1.0" encoding="utf-8"?>` to guarantee 100% Vietnamese diacritic preservation.
  4. Instantiate `JSZip`, attach the generated `Document.xml` at root.
  5. Compress as ZIP, output Blob with MIME `application/zip`, and name as `<Title>.mgmx`.
  6. **Download / Web Share:**
     - On Desktop/Android: Trigger `<a download="filename.mgmx">`.
     - On iOS Safari: Use `navigator.share({ files: [file] })` fallback.
     