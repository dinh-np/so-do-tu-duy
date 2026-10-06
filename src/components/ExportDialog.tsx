'use client';

import { useState } from 'react';
import { X, Download, FileText, Table, Presentation, FolderKanban, Image, FileCode } from 'lucide-react';

interface ExportDialogProps {
  title: string;
  onClose: () => void;
  onExport: (format: string) => Promise<void>;
}

const EXPORT_FORMATS = [
  {
    group: 'Microsoft Office',
    items: [
      { id: 'pptx', label: 'PowerPoint (.pptx)', desc: 'Mỗi nhánh cấp 1 thành 1 slide', icon: Presentation, color: '#d04430' },
      { id: 'docx', label: 'Word (.docx)', desc: 'Xuất dạng tiêu đề phân cấp', icon: FileText, color: '#2b5797' },
      { id: 'xlsx', label: 'Excel (.xlsx)', desc: 'Bảng phân rã công việc (WBS)', icon: Table, color: '#1e7145' },
      { id: 'xml', label: 'MS Project (.xml)', desc: 'Chuẩn MSPDI - mở trực tiếp bằng MS Project', icon: FolderKanban, color: '#5c6bc0' },
    ]
  },
  {
    group: 'MindGenius',
    items: [
      { id: 'mgmx', label: 'MindGenius (.mgmx)', desc: 'Mở và chỉnh sửa trong MindGenius', icon: FileCode, color: '#0066ab' },
    ]
  },
  {
    group: 'Hình ảnh & PDF',
    items: [
      { id: 'png', label: 'Ảnh PNG', desc: 'Xuất toàn bộ canvas ra ảnh chất lượng cao', icon: Image, color: '#7c3aed' },
      { id: 'pdf', label: 'PDF', desc: 'Tài liệu PDF sẵn sàng in ấn', icon: FileText, color: '#dc2626' },
    ]
  },
];

export function ExportDialog({ title, onClose, onExport }: ExportDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setLoading(format);
    try {
      await onExport(format);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ width: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Download size={17} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--color-text-primary)' }}>
                Xuất sơ đồ
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                &ldquo;{title}&rdquo;
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Format groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {EXPORT_FORMATS.map(group => (
            <div key={group.group}>
              <p style={{
                margin: '0 0 8px',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--color-text-muted)',
              }}>
                {group.group}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isLoading = loading === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleExport(item.id)}
                      disabled={!!loading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading && !isLoading ? 0.5 : 1,
                        transition: 'all var(--transition-fast)',
                        textAlign: 'left',
                        fontFamily: 'var(--font-sans)',
                      }}
                      onMouseEnter={e => {
                        if (!loading) {
                          e.currentTarget.style.borderColor = item.color;
                          e.currentTarget.style.background = item.color + '0D';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.background = 'var(--color-surface)';
                      }}
                    >
                      <div style={{
                        width: 36, height: 36,
                        background: item.color + '15',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} color={item.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {item.label}
                        </p>
                        <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {item.desc}
                        </p>
                      </div>
                      {isLoading ? (
                        <div style={{
                          width: 18, height: 18,
                          border: `2px solid ${item.color}`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      ) : (
                        <Download size={15} color="var(--color-text-muted)" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
