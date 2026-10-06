'use client';

import { useState, useMemo } from 'react';
import { MindNode } from '@/lib/db';
import { formatDate } from '@/lib/mindmap-utils';
import { Clock, CheckCircle2, Circle, AlertCircle, PlayCircle } from 'lucide-react';

interface KanbanBoardProps {
  data: MindNode;
  onUpdate: (id: string, updates: Partial<MindNode>) => void;
}

type StatusType = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

const STATUSES: { id: StatusType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'backlog', label: 'Backlog', icon: <Circle size={16} />, color: 'var(--color-text-muted)' },
  { id: 'todo', label: 'To Do', icon: <AlertCircle size={16} />, color: 'var(--color-info)' },
  { id: 'in_progress', label: 'In Progress', icon: <PlayCircle size={16} />, color: 'var(--color-warning)' },
  { id: 'review', label: 'Review', icon: <Clock size={16} />, color: 'var(--color-primary)' },
  { id: 'done', label: 'Done', icon: <CheckCircle2 size={16} />, color: 'var(--color-success)' }
];

export function KanbanBoard({ data, onUpdate }: KanbanBoardProps) {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Flatten the tree into an array of tasks (only nodes that have tasks or can be considered tasks)
  const tasks = useMemo(() => {
    const list: MindNode[] = [];
    const traverse = (node: MindNode) => {
      // Consider all nodes except the root if it doesn't have a status
      // Or just include all nodes that have a task or status
      if (node.id !== data.id || node.status) {
        list.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    if (data.children) {
      data.children.forEach(traverse);
    }
    return list;
  }, [data]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedNodeId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: StatusType) => {
    e.preventDefault();
    if (draggedNodeId) {
      const progress = status === 'done' ? 100 : status === 'in_progress' ? 50 : 0;
      onUpdate(draggedNodeId, { 
        status, 
        task: { 
          ...(tasks.find(t => t.id === draggedNodeId)?.task),
          progress 
        } 
      });
      setDraggedNodeId(null);
    }
  };

  return (
    <div className="flex h-full w-full gap-4 p-6 overflow-x-auto bg-surface touch-pan-x">
      {STATUSES.map(col => {
        const columnTasks = tasks.filter(t => (t.status || 'backlog') === col.id);
        
        return (
          <div 
            key={col.id}
            className="flex flex-col min-w-[280px] max-w-[280px] bg-canvas border border-border rounded-xl shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2 font-semibold" style={{ color: col.color }}>
                {col.icon}
                {col.label}
              </div>
              <div className="text-xs font-medium text-text-muted bg-surface px-2 py-1 rounded-full">
                {columnTasks.length}
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="p-3 bg-surface border border-border rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
                >
                  <h4 className="font-medium text-sm text-text-primary mb-2 line-clamp-2">
                    {task.topic}
                  </h4>
                  
                  {task.task?.assignee && (
                    <div className="text-xs text-text-secondary mb-2 flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                        {task.task.assignee.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{task.task.assignee}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
                    <span>
                      {task.task?.endDate ? formatDate(task.task.endDate) : 'No due date'}
                    </span>
                    {task.task?.priority && (
                      <span className={`px-2 py-0.5 rounded-sm capitalize ${
                        task.task.priority === 'high' ? 'bg-error/10 text-error' :
                        task.task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-info/10 text-info'
                      }`}>
                        {task.task.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center p-4 text-sm text-text-placeholder border-2 border-dashed border-border rounded-lg">
                  Kéo thả thẻ vào đây
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
