# PROJECT CONTEXT: SƠ ĐỒ TƯ DUY (MINDMAP & PM PWA)

## 1. System Vision & Objective
- **Application Name:** Sơ Đồ Tư Duy (Smart Mindmap & Project Management PWA).
- **Repository Identifier:** `dinh-np/so-do-tu-duy` (https://github.com/dinh-np/so-do-tu-duy).
- **Core Mission:** An Enterprise-Grade, Local-First Visual Thinking, Mind-Mapping, and Project Management PWA (a modern web-native alternative to MindGenius, MS Project, Obsidian, Trello, and Notion).
- **Core Philosophy:** 0ms input latency, 100% offline-ready, zero-knowledge local encryption at rest, real-time background Cloud Firestore sync, Google Gemini Pro AI copilot, and in-browser WebMCP tool execution.

## 2. Design System: Corporate Light Theme (Krones Inspired)
- **Primary Color:** `#0066AB` (Corporate Blue – Root nodes, primary headers, active tab borders, high-priority badges).
- **Secondary Blue:** `#004B7D` (Hover/focus outlines, active tool buttons).
- **Background Canvas:** `#ffffff` (Clean infinite interactive workspace).
- **Surfaces & Panels:** `#f8f9fa` (Toolbars, modals, task inspectors, view switchers).
- **Neutral Borders:** `#e2e8f0` / `#cbd5e1` (1.5px subtle node borders, table dividers).
- **Typography:**
  - UI & Body Text: `'Noto Sans', sans-serif` (Strictly tuned for crisp multi-platform Vietnamese rendering).
  - Editorial Accents: `'Georgia', serif` (Root topic titles, slide cover presentations, export headers).

## 3. Technology Stack Specification
- **Framework:** Next.js (App Router, React 19, TypeScript, Tailwind CSS, Lucide React Icons).
- **PWA & Offline Runtime:** `@ducanh2912/next-pwa` or `serwist` (Service Worker caching, Web App Manifest, Standalone App mode).
- **Client Storage (Tier 1 - Primary Source of Truth):** IndexedDB via `dexie` (Dexie.js).
  - Zero-latency local reads/writes (0ms).
  - Client-side encryption: Web Crypto API (AES-GCM 256-bit with user Master PIN).
  - Cache protection: Call `navigator.storage.persist()` on Chromium/Android/Desktop.
- **Cloud Database (Tier 2 - Multi-Device Continuity):** Firebase (Cloud Firestore + Google Authentication).
  - Cross-device sync (Laptop, iPad, iPhone, Samsung Note 20 Ultra / S26 Ultra).
  - Auto-sync triggers: Network reconnection (`online`), app backgrounding (`visibilitychange`).
- **AI & Agentic Engine:**
  - Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-pro` via Server Actions `/api/ai/mindmap`).
  - WebMCP standard (`document.modelContext.registerTool`) with dual-layer fallback for in-browser canvas control.
- **View Engines:**
  - Mindmap Canvas: Hybrid SVG bezier connectors + HTML DOM nodes with 2-sided auto-layout.
  - Gantt Chart: `frappe-gantt` (or SVG Timeline) with CPM highlighting and Baseline variance overlays.
  - Knowledge Graph: `react-force-graph` / `d3-force` parsing `[[Wikilinks]]`.
- **Interoperability & Exporters:**
  - MindGenius: `jszip` + `fast-xml-parser` (2-way `.mgmx` reader/builder).
  - Microsoft Project: Standard MSPDI XML schema with outline levels and baselines.
  - Office Suite: `pptxgenjs` (PowerPoint), `docx` (Word), `exceljs` (Excel WBS & RACI), `jspdf` + `html-to-image` (PDF & PNG).
  