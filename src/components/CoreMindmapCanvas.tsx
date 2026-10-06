'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import MindElixir, { type NodeObj } from 'mind-elixir';
type MindElixirInstance = MindElixir;
import { Plus, Delete, Undo2, Redo2, Download, Upload, Edit2, Share2 } from 'lucide-react';
import { MindNode } from '@/lib/db'; // Make sure to use the correct MindNode from our db.ts
import { BRANCH_COLORS } from '@/lib/mindmap-utils';

interface CoreMindmapCanvasProps {
  initialData: MindNode;
  onDataChange: (root: MindNode) => void;
  onNodeSelect: (node: MindNode | null) => void;
}

// Map from our domain model to MindElixir format
function mindNodeToElixir(node: MindNode, colorIndex = 0): NodeObj {
  const color = node.color || (colorIndex > 0 ? BRANCH_COLORS[(colorIndex - 1) % BRANCH_COLORS.length] : undefined);
  const obj: NodeObj = {
    id: node.id,
    topic: node.topic,
    children: node.children?.map((child, i) => mindNodeToElixir(child, colorIndex || i + 1)) || [],
  };

  if (color) {
    obj.style = {
      color: '#ffffff',
      background: color,
      border: `2px solid ${color}`,
    };
  }
  return obj;
}

function elixirToMindNode(node: NodeObj): MindNode {
  const style = node.style as { background?: string } | undefined;
  return {
    id: node.id,
    topic: node.topic,
    color: style?.background || undefined,
    children: (node.children || []).map(elixirToMindNode),
  };
}

export function CoreMindmapCanvas({ initialData, onDataChange, onNodeSelect }: CoreMindmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<MindElixirInstance | null>(null);
  const isInitialized = useRef(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;
    isInitialized.current = true;

    // 1. Initialize MindElixir Canvas
    const me = new MindElixir({
      el: containerRef.current,
      direction: MindElixir.SIDE,
      contextMenu: true,
      toolBar: false,
      keypress: true, // Desktop shortcuts: Tab (child), Enter (sibling), Delete (remove)
      allowUndo: true, // 30-step Undo/Redo stack enabled by default in MindElixir
      overflowHidden: false,
      mouseSelectionButton: 2, 
      theme: {
        name: 'Krones',
        palette: BRANCH_COLORS,
        cssVar: {
          '--main-color': '#0f172a',
          '--main-bgcolor': '#ffffff',
          '--color': '#ffffff',
          '--bgcolor': '#0066ab',
          '--panel-color': '#f8f9fa',
          '--panel-bgcolor': '#f8f9fa',
          '--panel-border-color': '#e2e8f0',
          '--root-color': '#ffffff',
          '--root-bgcolor': '#0066ab',
          '--root-border-color': '#004b7d',
          '--selected': '#e8f4fd',
          '--accent-color': '#0066ab',
          '--root-radius': '20px',
          '--main-radius': '10px',
          '--topic-padding': '7px 16px',
        },
      },
    });

    me.init({
      nodeData: mindNodeToElixir(initialData),
      arrows: [],
      summaries: [],
      direction: MindElixir.SIDE,
    });
    
    meRef.current = me;

    me.bus.addListener('selectNodes', (nodes: NodeObj[]) => {
      if (nodes.length > 0) {
        setSelectedNodeId(nodes[0].id);
        onNodeSelect(elixirToMindNode(nodes[0]));
      } else {
        setSelectedNodeId(null);
        onNodeSelect(null);
      }
    });

    me.bus.addListener('unselectNodes', () => {
      setSelectedNodeId(null);
      onNodeSelect(null);
    });

    me.bus.addListener('operation', () => {
      const currentData = me.getData();
      onDataChange(elixirToMindNode(currentData.nodeData));
    });

    return () => {
      me.destroy?.();
      meRef.current = null;
      isInitialized.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Actions
  const handleAddChild = useCallback(() => {
    if (!meRef.current || !selectedNodeId) return;
    meRef.current.addChild();
  }, [selectedNodeId]);

  const handleAddSibling = useCallback(() => {
    if (!meRef.current || !selectedNodeId) return;
    (meRef.current as any).insertSibling();
  }, [selectedNodeId]);

  const handleDelete = useCallback(() => {
    if (!meRef.current || !selectedNodeId) return;
    (meRef.current as any).removeNode();
  }, [selectedNodeId]);
  
  const handleEdit = useCallback(() => {
    if (!meRef.current || !selectedNodeId) return;
    meRef.current.beginEdit();
  }, [selectedNodeId]);

  const handleUndo = useCallback(() => meRef.current?.undo(), []);
  const handleRedo = useCallback(() => meRef.current?.redo(), []);

  // JSON Full Backup / Restore
  const handleExportJSON = useCallback(() => {
    if (!meRef.current) return;
    const data = meRef.current.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !meRef.current) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        meRef.current?.refresh(json);
        onDataChange(elixirToMindNode(json.nodeData));
      } catch (err) {
        console.error('Failed to import JSON', err);
      }
    };
    reader.readAsText(file);
  }, [onDataChange]);

  return (
    <div className="relative w-full h-full overflow-hidden touch-none" style={{ touchAction: 'none' }}>
      {/* Container for MindElixir */}
      <div ref={containerRef} id="mindmap-canvas" className="w-full h-full bg-canvas" />

      {/* Top Desktop/Tablet Toolbar for Undo/Redo & Backup */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 glass px-3 py-2 rounded-lg shadow-sm">
        <button onClick={handleUndo} className="btn-icon" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
        <button onClick={handleRedo} className="btn-icon" title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
        <div className="w-px h-6 bg-border mx-1 my-auto"></div>
        <button onClick={handleExportJSON} className="btn-icon" title="Backup to JSON"><Download size={18} /></button>
        <label className="btn-icon cursor-pointer" title="Restore from JSON">
          <Upload size={18} />
          <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
        </label>
      </div>

      {/* Mobile Floating Action Bar (FAB) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,16px)+16px)] left-1/2 -translate-x-1/2 z-50 glass rounded-full shadow-lg px-4 py-2 flex items-center gap-4 sm:hidden">
        <button
          onClick={handleAddChild}
          disabled={!selectedNodeId}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${!selectedNodeId ? 'text-text-muted opacity-50' : 'text-primary'}`}
        >
          <Plus size={24} />
          <span className="text-[10px] font-medium leading-none mt-1">Child</span>
        </button>
        
        <button
          onClick={handleAddSibling}
          disabled={!selectedNodeId}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${!selectedNodeId ? 'text-text-muted opacity-50' : 'text-primary'}`}
        >
          <Share2 size={20} className="-rotate-90" />
          <span className="text-[10px] font-medium leading-none mt-1">Sibling</span>
        </button>

        <button
          onClick={handleEdit}
          disabled={!selectedNodeId}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${!selectedNodeId ? 'text-text-muted opacity-50' : 'text-primary'}`}
        >
          <Edit2 size={20} />
          <span className="text-[10px] font-medium leading-none mt-1">Edit</span>
        </button>

        <button
          onClick={handleDelete}
          disabled={!selectedNodeId}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${!selectedNodeId ? 'text-text-muted opacity-50' : 'text-error'}`}
        >
          <Delete size={20} />
          <span className="text-[10px] font-medium leading-none mt-1">Delete</span>
        </button>
      </div>
    </div>
  );
}
