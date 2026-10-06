'use client';

import { useState } from 'react';
import { MindNode } from '@/types/mindmap';
import { formatDate, BRANCH_COLORS } from '@/lib/mindmap-utils';
import {
  X, Palette, StickyNote, Calendar, User,
  Flag, Image as ImageIcon, ChevronDown, Trash2
} from 'lucide-react';

interface InspectorPanelProps {
  node: MindNode | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<MindNode>) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp', color: '#10b981' },
  { value: 'medium', label: 'Trung bình', color: '#f59e0b' },
  { value: 'high', label: 'Cao', color: '#ef4444' },
];

export function InspectorPanel({ node, onClose, onUpdate, onDelete }: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'task'>('style');

  if (!node) return null;

  const handleColorChange = (color: string) => {
    onUpdate(node.id, { color });
  };

  const handleNoteChange = (note: string) => {
    onUpdate(node.id, { note });
  };

  const handleTaskUpdate = (field: string, value: string | number) => {
    onUpdate(node.id, {
      task: { ...node.task, [field]: value }
    });
  };

  return (
    <aside
      className="animate-slide-right"
      style={{
        width: 260,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'white',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Thuộc tính nhánh
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
            {node.topic || '(Chưa đặt tên)'}
          </p>
        </div>
        <button className="btn-icon" onClick={onClose} title="Đóng bảng thuộc tính">
          <X size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        background: 'white',
      }}>
        {(['style', 'task'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 0',
              fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab === 'style' ? 'Kiểu dáng' : 'Tiến độ'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {activeTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Color picker */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Palette size={11} /> Màu nhánh
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {BRANCH_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(c)}
                    title={c}
                    style={{
                      width: 26, height: 26,
                      borderRadius: 'var(--radius-sm)',
                      background: c,
                      border: node.color === c ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast)',
                      outline: node.color === c ? '2px solid white' : 'none',
                      outlineOffset: -4,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                ))}
                {/* Custom color */}
                <label title="Chọn màu tùy chỉnh" style={{
                  width: 26, height: 26,
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px dashed var(--color-border-strong)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: 'var(--color-text-muted)',
                  overflow: 'hidden',
                }}>
                  <input
                    type="color"
                    value={node.color || '#3b82f6'}
                    onChange={e => handleColorChange(e.target.value)}
                    style={{ width: '100%', height: '100%', border: 'none', padding: 0, cursor: 'pointer', opacity: 0, position: 'absolute' }}
                  />
                  +
                </label>
              </div>
              {/* Current color preview */}
              {node.color && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: node.color, border: '1px solid var(--color-border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{node.color}</span>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <StickyNote size={11} /> Ghi chú
              </label>
              <textarea
                className="input"
                value={node.note || ''}
                onChange={e => handleNoteChange(e.target.value)}
                placeholder="Thêm ghi chú cho nhánh này..."
                rows={4}
                style={{ resize: 'vertical', marginTop: '5px', fontSize: 12, lineHeight: 1.5 }}
              />
            </div>

            {/* Image */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ImageIcon size={11} /> Hình ảnh
              </label>
              {node.image ? (
                <div style={{ marginTop: '5px', position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={node.image} alt="Node image" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                  <button
                    onClick={() => onUpdate(node.id, { image: undefined })}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none', borderRadius: 'var(--radius-sm)',
                      width: 24, height: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label style={{
                  marginTop: '5px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '6px',
                  padding: '16px',
                  border: '1.5px dashed var(--color-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 12, color: 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                }}>
                  <ImageIcon size={20} />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        onUpdate(node.id, { image: ev.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {activeTab === 'task' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Start Date */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={11} /> Ngày bắt đầu
              </label>
              <input
                type="date"
                className="input"
                value={node.task?.startDate || ''}
                onChange={e => handleTaskUpdate('startDate', e.target.value)}
                style={{ marginTop: '5px', fontSize: 12 }}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={11} /> Hạn hoàn thành
              </label>
              <input
                type="date"
                className="input"
                value={node.task?.endDate || ''}
                onChange={e => handleTaskUpdate('endDate', e.target.value)}
                style={{ marginTop: '5px', fontSize: 12 }}
              />
            </div>

            {/* Progress */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'space-between' }}>
                <span>Tiến độ hoàn thành</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {node.task?.progress ?? 0}%
                </span>
              </label>
              <input
                type="range"
                min="0" max="100" step="5"
                value={node.task?.progress ?? 0}
                onChange={e => handleTaskUpdate('progress', Number(e.target.value))}
                style={{ width: '100%', marginTop: '5px', accentColor: 'var(--color-primary)' }}
              />
              {/* Progress bar display */}
              <div style={{
                marginTop: '6px', height: '6px',
                background: 'var(--color-border)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${node.task?.progress ?? 0}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), #00a8e8)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width var(--transition-fast)',
                }} />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={11} /> Người thực hiện
              </label>
              <input
                type="text"
                className="input"
                value={node.task?.assignee || ''}
                onChange={e => handleTaskUpdate('assignee', e.target.value)}
                placeholder="Tên người phụ trách..."
                style={{ marginTop: '5px', fontSize: 12 }}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Flag size={11} /> Độ ưu tiên
              </label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => handleTaskUpdate('priority', p.value)}
                    style={{
                      flex: 1, padding: '5px 0',
                      fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${node.task?.priority === p.value ? p.color : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: node.task?.priority === p.value ? p.color + '18' : 'transparent',
                      color: node.task?.priority === p.value ? p.color : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task summary */}
            {node.task?.startDate && node.task?.endDate && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0,102,171,0.15)',
              }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
                  📅 {formatDate(node.task.startDate)} → {formatDate(node.task.endDate)}
                </p>
                {node.task.duration && (
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
                    ⏱ {node.task.duration} ngày
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: Delete node */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--color-border)',
        background: 'white',
      }}>
        <button
          onClick={() => onDelete(node.id)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px',
            background: 'transparent',
            border: '1px solid #fee2e2',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.borderColor = 'var(--color-error)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#fee2e2';
          }}
        >
          <Trash2 size={13} />
          Xóa nhánh này
        </button>
      </div>
    </aside>
  );
}
