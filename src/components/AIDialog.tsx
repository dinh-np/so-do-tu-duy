'use client';

import { useState } from 'react';
import { Wand2, FileText, X, Loader2 } from 'lucide-react';

interface AIDialogProps {
  onClose: () => void;
  onGenerate: (prompt: string, mode: 'topic' | 'text') => Promise<void>;
  isLoading: boolean;
}

export function AIDialog({ onClose, onGenerate, isLoading }: AIDialogProps) {
  const [mode, setMode] = useState<'topic' | 'text'>('topic');
  const [prompt, setPrompt] = useState('');

  const EXAMPLES = {
    topic: [
      'Tổng hợp kiến thức Tin học lớp 7 HK1',
      'Kế hoạch ra mắt sản phẩm mới Q4/2026',
      'Các bước quản lý dự án Agile/Scrum',
      'Ôn tập Lịch sử Việt Nam thế kỷ XX',
    ],
    text: [],
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    await onGenerate(prompt.trim(), mode);
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #4285f4, #9c27b0)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wand2 size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--color-text-primary)' }}>
                AI Gemini Tạo Sơ Đồ
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                Powered by Google Gemini
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px',
          marginBottom: '18px',
          border: '1px solid var(--color-border)',
        }}>
          <button
            onClick={() => setMode('topic')}
            style={{
              flex: 1, padding: '8px 12px',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              background: mode === 'topic' ? 'white' : 'transparent',
              color: mode === 'topic' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: mode === 'topic' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <Wand2 size={13} /> Từ chủ đề
          </button>
          <button
            onClick={() => setMode('text')}
            style={{
              flex: 1, padding: '8px 12px',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              background: mode === 'text' ? 'white' : 'transparent',
              color: mode === 'text' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: mode === 'text' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <FileText size={13} /> Từ văn bản
          </button>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '16px' }}>
          <label className="label" style={{ marginBottom: '8px' }}>
            {mode === 'topic' ? 'Nhập chủ đề cần tạo sơ đồ' : 'Dán đoạn văn bản / tài liệu'}
          </label>
          {mode === 'topic' ? (
            <input
              type="text"
              className="input"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ví dụ: Tổng hợp kiến thức Tin học lớp 7 HK1"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          ) : (
            <textarea
              className="input"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Dán văn bản dài hoặc đề cương vào đây. AI sẽ phân tích và tạo sơ đồ tư duy phân cấp..."
              rows={8}
              style={{ resize: 'vertical', lineHeight: 1.6, fontSize: 13 }}
            />
          )}
        </div>

        {/* Example chips */}
        {mode === 'topic' && (
          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gợi ý chủ đề
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EXAMPLES.topic.map(ex => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  style={{
                    padding: '5px 10px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.background = 'var(--color-primary-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            style={{
              opacity: !prompt.trim() ? 0.5 : 1,
              background: 'linear-gradient(135deg, #4285f4, #9c27b0)',
              minWidth: 140,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Đang tạo...
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Tạo sơ đồ
              </>
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
