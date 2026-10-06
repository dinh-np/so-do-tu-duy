'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import MindElixir from 'mind-elixir';
import { MindNode, MindmapDocument } from '@/types/mindmap';
import {
  createDefaultMindmap, saveMindmapLocal, loadCurrentMindmap, generateId
} from '@/lib/mindmap-utils';
import { parseMgmxFile, exportToMgmx } from '@/lib/mgmx-parser';
import {
  exportToPptx, exportToXlsx, exportToDocx,
  exportToMsProject, exportToPng, exportToPdf
} from '@/lib/export-engine';
import { db } from '@/lib/db';
import { registerWebMCPTools } from '@/lib/webmcp';

import { Toolbar } from '@/components/Toolbar';
import { InspectorPanel } from '@/components/InspectorPanel';
import { AIDialog } from '@/components/AIDialog';
import { ExportDialog } from '@/components/ExportDialog';

// Dynamic import cho MindmapEditor (client-only, no SSR)
import dynamic from 'next/dynamic';
const MindmapEditor = dynamic(
  () => import('@/components/MindmapEditor').then(m => m.MindmapEditor),
  { ssr: false, loading: () => <LoadingCanvas /> }
);
const GanttChart = dynamic(
  () => import('@/components/GanttChart').then(m => m.GanttChart),
  { ssr: false, loading: () => <LoadingCanvas /> }
);

import { KanbanBoard } from '@/components/KanbanBoard';
import { RaciMatrix } from '@/components/RaciMatrix';
import { RiskHeatmap } from '@/components/RiskHeatmap';
import type { ViewMode } from '@/components/Toolbar';

function LoadingCanvas() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-canvas)',
      backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      gap: '16px',
    }}>
      <div style={{
        width: 48, height: 48,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)' }}>
        Đang tải trình biên tập...
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column-reverse', gap: '8px',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} className="animate-fade-in" style={{
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
          background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#0066ab',
          color: 'white',
          minWidth: 200,
          textAlign: 'center',
        }}>
          {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : 'ℹ '}{t.message}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function MindmapPage() {
  const [doc, setDoc] = useState<MindmapDocument>(() => createDefaultMindmap());
  const [selectedNode, setSelectedNode] = useState<MindNode | null>(null);
  const [view, setView] = useState<ViewMode>('mindmap');
  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  const editorRef = useRef<InstanceType<typeof MindElixir> | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved mindmap on mount
  useEffect(() => {
    const saved = loadCurrentMindmap();
    if (saved) {
      setTimeout(() => setDoc(saved), 0);
    }
  }, []);

  // Auto-save debounced
  const triggerAutoSave = useCallback((updatedDoc: MindmapDocument) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    saveTimerRef.current = setTimeout(() => {
      saveMindmapLocal(updatedDoc);
      setIsSaving(false);
    }, 1200);
  }, []);

  // Toast helper
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Cloud Sync
  useEffect(() => {
    import('@/lib/cloud-sync').then(({ CloudSync }) => {
      CloudSync.startAutoSync();
    });
  }, []);

  // WebMCP Integration
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (!document.modelContext) {
        document.modelContext = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          registerTool: (name: string, desc: string, handler: any) => {
            console.log(`[WebMCP] Registered tool: ${name}`);
            // Mock registration for when Gemini executes in-browser tools via standard browser APIs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any)[`__webmcp_${name}`] = handler;
          }
        };
      }
      registerWebMCPTools({
        getRoot: () => doc.root,
        title: doc.title,
        onAddNode: (parentId, newNode) => {
          function addToTree(node: MindNode): MindNode {
            if (node.id === parentId) return { ...node, children: [...(node.children || []), newNode] };
            return { ...node, children: node.children?.map(addToTree) };
          }
          setDoc(prev => {
            const updated = { ...prev, root: addToTree(prev.root) };
            triggerAutoSave(updated);
            return updated;
          });
          showToast('AI đã thêm nhánh mới', 'info');
        },
        onUpdateNode: (id, updates) => {
          function updateInTree(node: MindNode): MindNode {
            if (node.id === id) return { ...node, ...updates };
            return { ...node, children: node.children?.map(updateInTree) };
          }
          setDoc(prev => {
            const updated = { ...prev, root: updateInTree(prev.root) };
            triggerAutoSave(updated);
            return updated;
          });
          setSelectedNode(prev => prev?.id === id ? { ...prev, ...updates } : prev);
        },
        onDeleteNode: (id) => {
          function removeFromTree(node: MindNode): MindNode {
            return { ...node, children: node.children?.filter(c => c.id !== id).map(removeFromTree) };
          }
          setDoc(prev => {
            const updated = { ...prev, root: removeFromTree(prev.root) };
            triggerAutoSave(updated);
            return updated;
          });
          setSelectedNode(null);
        },
        onFocusNode: (id) => {
          if (editorRef.current) {
            // @ts-ignore
            editorRef.current.selectNode?.(id);
            editorRef.current.toCenter();
          }
        }
      });
    }
  }, [doc, triggerAutoSave, showToast]);

  // ============ Handlers ============

  const handleDataChange = useCallback((root: MindNode) => {
    setDoc(prev => {
      const updated = { ...prev, root, updated_at: new Date().toISOString() };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const handleNodeUpdate = useCallback((id: string, updates: Partial<MindNode>) => {
    function updateInTree(node: MindNode): MindNode {
      if (node.id === id) return { ...node, ...updates };
      return { ...node, children: node.children?.map(updateInTree) };
    }
    setDoc(prev => {
      const updated = { ...prev, root: updateInTree(prev.root) };
      triggerAutoSave(updated);
      return updated;
    });
    setSelectedNode(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  }, [triggerAutoSave]);

  const handleNodeDelete = useCallback((id: string) => {
    function removeFromTree(node: MindNode): MindNode {
      return {
        ...node,
        children: node.children
          ?.filter(c => c.id !== id)
          .map(removeFromTree),
      };
    }
    setDoc(prev => {
      const updated = { ...prev, root: removeFromTree(prev.root) };
      triggerAutoSave(updated);
      return updated;
    });
    setSelectedNode(null);
    showToast('Đã xóa nhánh');
  }, [triggerAutoSave, showToast]);

  const handleSave = useCallback(() => {
    saveMindmapLocal(doc);
    setIsSaving(false);
    showToast('Đã lưu sơ đồ');
  }, [doc, showToast]);

  const handleNewMap = useCallback(() => {
    if (confirm('Tạo sơ đồ mới? Sơ đồ hiện tại sẽ được lưu lại.')) {
      saveMindmapLocal(doc);
      const newDoc = createDefaultMindmap();
      setDoc(newDoc);
      setSelectedNode(null);
      saveMindmapLocal(newDoc);
    }
  }, [doc]);

  const handleTitleChange = useCallback((title: string) => {
    setDoc(prev => {
      const updated = { ...prev, title };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const handleZoomIn = useCallback(() => editorRef.current?.scale(1.2), []);
  const handleZoomOut = useCallback(() => editorRef.current?.scale(0.8), []);
  const handleFitView = useCallback(() => editorRef.current?.toCenter(), []);
  const handleUndo = useCallback(() => editorRef.current?.undo(), []);
  const handleRedo = useCallback(() => editorRef.current?.redo(), []);

  // Import .mgmx
  const handleImportMgmx = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const root = await parseMgmxFile(file);
      const newDoc: MindmapDocument = {
        id: generateId(),
        title: file.name.replace('.mgmx', ''),
        root,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDoc(newDoc);
      saveMindmapLocal(newDoc);
      setSelectedNode(null);
      showToast(`Đã import: ${newDoc.title}`);
    } catch (err) {
      showToast(`Lỗi import: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error');
    }
    e.target.value = '';
  }, [showToast]);

  // AI Generate
  const handleAIGenerate = useCallback(async (prompt: string, mode: 'topic' | 'text') => {
    setAiLoading(true);
    try {
      const promptHash = btoa(encodeURIComponent(prompt + mode));
      let rootData: MindNode;

      const cached = await db.aiCache.get(promptHash);
      if (cached) {
        rootData = cached.rootData;
        showToast('Đã tải từ bộ nhớ đệm (Cache)');
      } else {
        const res = await fetch('/api/ai/mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode }),
        });
        const json = await res.json() as { data?: MindNode; error?: string };
        if (!res.ok || json.error) throw new Error(json.error || 'Lỗi API');
        
        rootData = json.data!;
        
        await db.aiCache.put({
          promptHash,
          prompt,
          rootData,
          createdAt: Date.now()
        });
        showToast('AI đã tạo sơ đồ thành công!');
      }

      const newDoc: MindmapDocument = {
        id: generateId(),
        title: prompt.slice(0, 50),
        root: rootData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDoc(newDoc);
      saveMindmapLocal(newDoc);
      setSelectedNode(null);
      setShowAI(false);
    } catch (err) {
      showToast(`Lỗi AI: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error');
    } finally {
      setAiLoading(false);
    }
  }, [showToast]);

  // Export
  const handleExport = useCallback(async (format: string) => {
    const t = doc.title || 'so-do-tu-duy';
    try {
      switch (format) {
        case 'pptx':  await exportToPptx(doc.root, t); break;
        case 'xlsx':  await exportToXlsx(doc.root, t); break;
        case 'docx':  await exportToDocx(doc.root, t); break;
        case 'xml':   await exportToMsProject(doc.root, t); break;
        case 'mgmx':  await exportToMgmx(doc.root, t); break;
        case 'png':   await exportToPng(t); break;
        case 'pdf':   await exportToPdf(t); break;
        default: throw new Error(`Định dạng không hỗ trợ: ${format}`);
      }
      showToast(`Đã xuất file .${format} thành công`);
    } catch (err) {
      showToast(`Lỗi xuất ${format}: ${err instanceof Error ? err.message : ''}`, 'error');
    }
  }, [doc, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') { e.preventDefault(); handleSave(); }
        if (e.key === 'n') { e.preventDefault(); handleNewMap(); }
        if (e.key === 'z') { e.preventDefault(); handleUndo(); }
        if (e.key === 'y') { e.preventDefault(); handleRedo(); }
      }
      if (e.key === 'F') { e.preventDefault(); handleFitView(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleNewMap, handleUndo, handleRedo, handleFitView]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* === TOOLBAR === */}
      <Toolbar
        title={doc.title}
        view={view}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        onNewMap={handleNewMap}
        onOpen={() => importInputRef.current?.click()}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onToggleView={setView}
        onAIGenerate={() => setShowAI(true)}
        onImportMgmx={handleImportMgmx}
        onExportMenu={() => setShowExport(true)}
        onTitleChange={handleTitleChange}
      />

      {/* === MAIN CONTENT === */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Canvas area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {view === 'mindmap' && (
            <MindmapEditor
              key={doc.id} // Force remount khi đổi doc
              data={doc.root}
              onNodeSelect={setSelectedNode}
              onDataChange={handleDataChange}
              editorRef={editorRef}
            />
          )}
          {view === 'gantt' && (
            <GanttChart data={doc.root} onUpdate={handleNodeUpdate} />
          )}
          {view === 'kanban' && (
            <KanbanBoard data={doc.root} onUpdate={handleNodeUpdate} />
          )}
          {view === 'raci' && (
            <RaciMatrix data={doc.root} />
          )}
          {view === 'risk' && (
            <RiskHeatmap data={doc.root} />
          )}
        </div>

        {/* Inspector Panel */}
        {selectedNode && (
          <InspectorPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
          />
        )}
      </div>

      {/* === DIALOGS === */}
      {showAI && (
        <AIDialog
          onClose={() => setShowAI(false)}
          onGenerate={handleAIGenerate}
          isLoading={aiLoading}
        />
      )}
      {showExport && (
        <ExportDialog
          title={doc.title}
          onClose={() => setShowExport(false)}
          onExport={handleExport}
        />
      )}

      {/* === HIDDEN FILE INPUT (import) === */}
      <input
        ref={importInputRef}
        type="file"
        accept=".mgmx"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />

      {/* === TOAST === */}
      <ToastContainer toasts={toasts} />

      {/* === KEYBOARD HINT === */}
      <div style={{
        position: 'fixed', bottom: 10, right: 12,
        fontSize: 10, color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-sans)',
        pointerEvents: 'none',
        lineHeight: 1.7,
        textAlign: 'right',
      }}>
        <kbd style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 3, padding: '1px 4px', fontSize: 10 }}>Tab</kbd> Nhánh con &nbsp;
        <kbd style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 3, padding: '1px 4px', fontSize: 10 }}>Enter</kbd> Nhánh ngang &nbsp;
        <kbd style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 3, padding: '1px 4px', fontSize: 10 }}>Del</kbd> Xóa
      </div>
    </div>
  );
}


