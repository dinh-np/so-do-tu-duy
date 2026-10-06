# CONTINUITY SKILL: SYSTEM INTEGRITY RULES & SPECIFICATIONS

## 1. Non-Negotiable Architecture Rules
1. **Local-First Primacy:** All state writes MUST execute against `Dexie.js` (IndexedDB) first. The application must load, edit, navigate views, and export files 100% offline without mandatory login.
2. **Krones Corporate Light Design System:**
   - Brand Primary: `#0066AB` (Root node, primary headers, active states).
   - Brand Hover/Focus: `#004B7D`.
   - Workspace Background: `#ffffff`.
   - Toolbars & Panels: `#f8f9fa` with border `#e2e8f0`.
   - Typography: `'Noto Sans', sans-serif` (UI/Body) and `'Georgia', serif` (Titles/Slide Covers).
3. **Cross-Platform Touch & Mobile Rules:**
   - Touch Targets: Every touch button on mobile/tablet must have a minimum hit area of 44x44px.
   - Canvas Lock: Canvas container MUST have `touch-action: none; overscroll-behavior: none;`.
   - Virtual Keyboard Handling: Use `window.visualViewport` to auto-pan the edited node into the upper 50% viewport safe zone.
   - iOS Insets: Apply `padding-bottom: env(safe-area-inset-bottom, 16px)` to all floating bottom toolbars.
   - Mobile Background Sync: Trigger `Immediate Flush Sync` via `visibilitychange` (`document.visibilityState === 'hidden'`).
   - Mobile Downloads: Wrap binary downloads in `navigator.share` (Web Share API) fallback on iOS Safari.
4. **AI & Rate Limiting Guardrails:**
   - Rate limit Gemini API invocations to max 5 req/min per client session.
   - Cache prompt outputs in Dexie.js (`aiCache` table) to prevent redundant API token burns.

## 2. Canonical `MindNode` Data Schema
Every module in this project must strictly comply with this canonical interface:

```typescript
export interface MindNode {
  id: string;
  topic: string;
  description?: string; // Rich-text / Markdown notes (Notion/TipTap editor)
  tags?: string[];
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  color?: string;
  image?: string; // Client-compressed DataURL (< 300KB)

  // 1. Task & Schedule Management (MS Project Standard)
  task?: {
    startDate?: string;     // YYYY-MM-DD
    endDate?: string;       // YYYY-MM-DD
    duration?: number;      // Days
    progress?: number;      // 0 - 100%
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
    dependencies?: string[]; // Predecessor node IDs for Critical Path Method (CPM)
    isDailyFocus?: boolean;  // Display in "My Day Agenda"
  };

  // 2. Baseline & Variance Tracking
  baseline?: {
    startDate?: string;
    endDate?: string;
    plannedCost?: number;
  };

  // 3. Resource Workload & Capacity Balancing
  workload?: {
    estimatedHours?: number;
    actualHours?: number;
  };

  // 4. Risk Management Heatmap (5x5 Matrix)
  risk?: {
    probability?: 1 | 2 | 3 | 4 | 5; // 1: Very Low -> 5: Severe
    impact?: 1 | 2 | 3 | 4 | 5;      // 1: Negligible -> 5: Catastrophic
    mitigationPlan?: string;
  };

  // 5. RACI Matrix Assignment
  raci?: {
    responsible?: string[]; // R: Direct Doers
    accountable?: string;   // A: Approver / Owner
    consulted?: string[];   // C: Subject Matter Experts
    informed?: string[];    // I: Informed Stakeholders
  };

  // 6. Prezi-Style Presentation Mode
  presentation?: {
    slideOrder?: number;
    speakerNotes?: string;
  };

  children?: MindNode[];
}
