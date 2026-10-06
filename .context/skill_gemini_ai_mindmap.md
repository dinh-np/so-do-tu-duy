---

### 4. `.context/skill_gemini_ai_mindmap.md`

```markdown
# SKILL: GOOGLE GEMINI PRO AI & WEBMCP INTEGRATION

## 1. Server Action Architecture (`/api/ai/mindmap`)
- **Models:** `gemini-2.0-flash` (speed/real-time) or `gemini-1.5-pro` (complex WBS decomposition).
- **Format:** Enforce `response_mime_type: "application/json"` with JSON Structured Schema.
- **Client Cache Check:**
  1. Hash prompt text (SHA-256).
  2. Check Dexie `aiCache` table. If cached, return immediately without API call.
  3. If missing, invoke Server Action, validate schema, cache result, and render.

## 2. In-App AI Capabilities
1. **Text-to-Mindmap:** Generate complete multi-level WBS trees from prompts, meeting transcripts, or course curricula.
2. **Scan/Vision-to-Mindmap:** Upload whiteboard sketches, hand-drawn mindmaps, or PDF outlines; Gemini Vision extracts the hierarchical tree.
3. **AI Project Copilot:**
   - Detect schedule bottlenecks and calculate the Critical Path.
   - Recommend RACI assignments based on task type.
   - Evaluate Risk scores (Probability 1-5, Impact 1-5) and draft risk mitigation plans.
4. **AI Branch Expansion:** Generate 3-5 logical sub-tasks or sub-topics for any selected node.
5. **AI Pitch Generator:** Auto-write presentation speaker notes for each Level 1 branch.

## 3. WebMCP In-Browser Tool Calling (`lib/webmcp.ts`)
Expose browser tools via `document.modelContext.registerTool(...)` with fallback to Gemini Function Calling:

```typescript
export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
  execute: (args: any) => Promise<any>;
}

// Canonical Tool Declarations:
// 1. add_node({ parentId, topic, priority, duration, assignee })
// 2. update_node({ nodeId, updates: Partial<MindNode> })
// 3. delete_node({ nodeId })
// 4. focus_node({ nodeId }) -> Smooth camera pan/zoom to center node
// 5. get_project_summary() -> Returns WBS stats, overdue count, CPM bottleneck
// 6. export_project({ format: 'mgmx'|'pptx'|'docx'|'xlsx'|'xml'|'pdf' })
