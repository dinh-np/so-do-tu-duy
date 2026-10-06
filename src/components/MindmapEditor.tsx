'use client';

import { useEffect, useRef, useCallback } from 'react';
import MindElixir from 'mind-elixir';
import type { MindElixirData, NodeObj } from 'mind-elixir';
import { MindNode } from '@/types/mindmap';
import { BRANCH_COLORS } from '@/lib/mindmap-utils';

// Kiểu MindElixir instance (lấy từ kiểu trả về của constructor)
type MindElixirInstance = InstanceType<typeof MindElixir>;

interface MindmapEditorProps {
  data: MindNode;
  onNodeSelect: (node: MindNode | null) => void;
  onDataChange: (root: MindNode) => void;
  editorRef?: React.MutableRefObject<MindElixirInstance | null>;
}

// Chuyển MindNode sang NodeObj của mind-elixir
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

  if (node.note) obj.note = node.note;
  if (node.image) obj.image = { url: node.image, width: 100, height: 100 };

  return obj;
}

// Chuyển NodeObj về MindNode
function elixirToMindNode(node: NodeObj): MindNode {
  const style = node.style as { background?: string } | undefined;
  return {
    id: node.id,
    topic: node.topic,
    color: style?.background || undefined,
    note: node.note as string | undefined,
    image: (node.image as { url?: string } | undefined)?.url || undefined,
    children: (node.children || []).map(elixirToMindNode),
  };
}

export function MindmapEditor({ data, onNodeSelect, onDataChange, editorRef }: MindmapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<MindElixirInstance | null>(null);
  const isInitialized = useRef(false);

  const getInitData = useCallback((): MindElixirData => ({
    nodeData: mindNodeToElixir(data),
    arrows: [],
    summaries: [],
    direction: MindElixir.SIDE,
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;
    isInitialized.current = true;

    const me = new MindElixir({
      el: containerRef.current,
      direction: MindElixir.SIDE,
      contextMenu: false,
      toolBar: false,
      keypress: true,
      allowUndo: true,
      overflowHidden: false,
      mouseSelectionButton: 2, // Right mouse to pan
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

    const initData = getInitData();
    me.init(initData);
    meRef.current = me;
    if (editorRef) editorRef.current = me;

    // === Event: node selected ===
    me.bus.addListener('selectNodes', (nodes: NodeObj[]) => {
      if (nodes.length > 0) {
        onNodeSelect(elixirToMindNode(nodes[0]));
      } else {
        onNodeSelect(null);
      }
    });

    me.bus.addListener('unselectNodes', () => {
      onNodeSelect(null);
    });

    // === Event: data changed ===
    me.bus.addListener('operation', () => {
      const currentData = me.getData();
      onDataChange(elixirToMindNode(currentData.nodeData));
    });

    // Cleanup
    return () => {
      me.destroy?.();
      meRef.current = null;
      if (editorRef) editorRef.current = null;
      isInitialized.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh khi data thay đổi từ bên ngoài (AI generate, import)
  useEffect(() => {
    if (!meRef.current || !isInitialized.current) return;
    const newData: MindElixirData = {
      nodeData: mindNodeToElixir(data),
      arrows: [],
      summaries: [],
      direction: MindElixir.SIDE,
    };
    meRef.current.refresh(newData);
  }, [data]);

  return (
    <div
      ref={containerRef}
      id="mindmap-canvas"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-canvas)',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  );
}
