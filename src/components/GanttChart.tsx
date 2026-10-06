'use client';

import { useEffect, useRef, useMemo } from 'react';
import Gantt from 'frappe-gantt';
import { MindNode } from '@/lib/db';
import '@/app/frappe-gantt.css'; 

interface GanttChartProps {
  data: MindNode;
  onUpdate: (id: string, updates: Partial<MindNode>) => void;
}

export function GanttChart({ data, onUpdate }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);

  const tasks = useMemo(() => {
    const list: any[] = [];
    const traverse = (node: MindNode) => {
      if (node.id !== data.id && node.task?.startDate && node.task?.endDate) {
        list.push({
          id: node.id,
          name: node.topic,
          start: node.task.startDate,
          end: node.task.endDate,
          progress: node.task.progress || 0,
          dependencies: node.task.dependencies?.join(',') || '',
          custom_class: node.color ? `gantt-bar-${node.id}` : ''
        });
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

  const findNode = useCallback((root: MindNode, id: string): MindNode | null => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;

    if (!ganttInstance.current) {
      ganttInstance.current = new Gantt(containerRef.current, tasks, {
        on_click: (task: any) => {
          // console.log(task);
        },
        on_date_change: (task: any, start: Date, end: Date) => {
          const startStr = start.toISOString().split('T')[0];
          const endStr = end.toISOString().split('T')[0];
          onUpdate(task.id, {
            task: {
              startDate: startStr,
              endDate: endStr,
            }
          });
        },
        on_progress_change: (task: any, progress: number) => {
          onUpdate(task.id, {
            task: {
              progress: Math.round(progress)
            }
          });
        },
        on_view_change: (mode: string) => {
          // console.log(mode);
        },
        view_mode: 'Day',
        language: 'en'
      });
    } else {
      ganttInstance.current.refresh(tasks);
    }

    // Apply custom colors if specified
    tasks.forEach(t => {
      const node = findNode(data, t.id);
      if (node?.color) {
        const bars = containerRef.current?.querySelectorAll(`.gantt-bar-${t.id} .bar`);
        bars?.forEach((bar: any) => {
          bar.style.fill = node.color;
        });
      }
    });

  }, [tasks, onUpdate, data, findNode]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-surface text-text-muted">
        <p>No tasks with start and end dates found.</p>
        <p className="text-sm mt-2">Add dates to your mindmap nodes to view them here.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-canvas p-6">
      <div ref={containerRef} className="max-w-full" />
    </div>
  );
}
