'use client';

import {
  Plus, FolderOpen, Save, Download, Upload,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  LayoutDashboard, BarChart3, Wand2,
  Columns, Users, Activity,
  Brain
} from 'lucide-react';
import { AuthStatus } from './AuthStatus';

export type ViewMode = 'mindmap' | 'gantt' | 'kanban' | 'raci' | 'risk';

interface ToolbarProps {
  title: string;
  view: ViewMode;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  onNewMap: () => void;
  onOpen: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleView: (view: ViewMode) => void;
  onAIGenerate: () => void;
  onImportMgmx: () => void;
  onExportMenu: () => void;
  onTitleChange: (title: string) => void;
}

export function Toolbar({
  title, view, canUndo, canRedo, isSaving,
  onNewMap, onOpen, onSave, onUndo, onRedo,
  onZoomIn, onZoomOut, onFitView, onToggleView,
  onAIGenerate, onImportMgmx, onExportMenu,
  onTitleChange
}: ToolbarProps) {
  return (
    <header className="glass" style={{
      height: '52px',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      paddingInline: '12px',
      gap: '4px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      zIndex: 50,
      userSelect: 'none',
    }}>
      {/* === Logo === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
        <div style={{
          width: 32, height: 32,
          background: 'var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-primary)',
          flexShrink: 0,
        }}>
          <Brain size={18} color="white" />
        </div>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '15px',
          color: 'var(--color-primary)',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}>Sơ Đồ Tư Duy</span>
      </div>

      {/* === Separator === */}
      <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginInline: '4px' }} />

      {/* === File Actions === */}
      <button className="btn-icon" title="Tạo mới (Ctrl+N)" onClick={onNewMap}>
        <Plus size={16} />
      </button>
      <button className="btn-icon" title="Mở file" onClick={onOpen}>
        <FolderOpen size={16} />
      </button>
      <button
        className="btn-icon"
        title="Lưu (Ctrl+S)"
        onClick={onSave}
        style={{ position: 'relative' }}
      >
        <Save size={16} />
        {isSaving && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-primary)',
            animation: 'pulse-dot 1s infinite',
          }} />
        )}
      </button>

      {/* === Separator === */}
      <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginInline: '4px' }} />

      {/* === Undo/Redo === */}
      <button className="btn-icon" title="Hoàn tác (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}
        style={{ opacity: canUndo ? 1 : 0.35 }}>
        <Undo2 size={16} />
      </button>
      <button className="btn-icon" title="Làm lại (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}
        style={{ opacity: canRedo ? 1 : 0.35 }}>
        <Redo2 size={16} />
      </button>

      {/* === Separator === */}
      <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginInline: '4px' }} />

      {/* === Zoom === */}
      <button className="btn-icon" title="Thu nhỏ (-)" onClick={onZoomOut}>
        <ZoomOut size={16} />
      </button>
      <button className="btn-icon" title="Phóng to (+)" onClick={onZoomIn}>
        <ZoomIn size={16} />
      </button>
      <button className="btn-icon" title="Vừa màn hình (F)" onClick={onFitView}>
        <Maximize2 size={16} />
      </button>

      {/* === Separator === */}
      <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginInline: '4px' }} />

      {/* === Import/Export === */}
      <button className="btn-icon" title="Import file .mgmx (MindGenius)" onClick={onImportMgmx}>
        <Upload size={16} />
      </button>
      <button className="btn-icon" title="Xuất file..." onClick={onExportMenu}>
        <Download size={16} />
      </button>

      {/* === Center: Title === */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            outline: 'none',
            maxWidth: '320px',
            width: '100%',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background var(--transition-fast)',
          }}
          onFocus={e => (e.target.style.background = 'var(--color-surface)')}
          onBlur={e => (e.target.style.background = 'transparent')}
          placeholder="Đặt tên sơ đồ..."
          aria-label="Tên sơ đồ"
        />
      </div>

      {/* === View Toggle === */}
      <div style={{
        display: 'flex',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '3px',
        gap: '2px',
        border: '1px solid var(--color-border)',
      }}>
        {[
          { id: 'mindmap', icon: LayoutDashboard, label: 'Sơ đồ' },
          { id: 'gantt', icon: BarChart3, label: 'Gantt' },
          { id: 'kanban', icon: Columns, label: 'Kanban' },
          { id: 'raci', icon: Users, label: 'RACI' },
          { id: 'risk', icon: Activity, label: 'Risk' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onToggleView(item.id as ViewMode)}
            title={item.label}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
              background: view === item.id ? 'var(--color-primary)' : 'transparent',
              color: view === item.id ? 'white' : 'var(--color-text-muted)',
              boxShadow: view === item.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <item.icon size={13} /> <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {/* === Separator === */}
      <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginInline: '4px' }} />

      {/* === Sync & Auth Status === */}
      <AuthStatus />

      {/* === Separator === */}
      <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginInline: '4px' }} />

      {/* === AI Generate === */}
      <button
        className="btn-primary"
        onClick={onAIGenerate}
        title="Tạo sơ đồ bằng AI (Gemini)"
        style={{ padding: '7px 14px', fontSize: '13px', gap: '6px' }}
      >
        <Wand2 size={14} />
        AI Gemini
      </button>
    </header>
  );
}
