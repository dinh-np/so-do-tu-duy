'use client';

import { useMemo } from 'react';
import { MindNode } from '@/lib/db';

interface RaciMatrixProps {
  data: MindNode;
}

export function RaciMatrix({ data }: RaciMatrixProps) {
  // Extract all unique resources/users from the raci blocks
  const resources = useMemo(() => {
    const resSet = new Set<string>();
    const extract = (node: MindNode) => {
      if (node.raci) {
        node.raci.responsible?.forEach(r => resSet.add(r));
        if (node.raci.accountable) resSet.add(node.raci.accountable);
        node.raci.consulted?.forEach(r => resSet.add(r));
        node.raci.informed?.forEach(r => resSet.add(r));
      }
      node.children?.forEach(extract);
    };
    extract(data);
    return Array.from(resSet).sort();
  }, [data]);

  // Extract all tasks
  const tasks = useMemo(() => {
    const list: MindNode[] = [];
    const extract = (node: MindNode) => {
      if (node.id !== data.id && node.raci && (
        (node.raci.responsible && node.raci.responsible.length > 0) ||
        node.raci.accountable ||
        (node.raci.consulted && node.raci.consulted.length > 0) ||
        (node.raci.informed && node.raci.informed.length > 0)
      )) {
        list.push(node);
      }
      node.children?.forEach(extract);
    };
    if (data.children) data.children.forEach(extract);
    return list;
  }, [data]);

  const getRaciRole = (node: MindNode, resource: string) => {
    const roles = [];
    if (node.raci?.responsible?.includes(resource)) roles.push('R');
    if (node.raci?.accountable === resource) roles.push('A');
    if (node.raci?.consulted?.includes(resource)) roles.push('C');
    if (node.raci?.informed?.includes(resource)) roles.push('I');
    return roles.join('/');
  };

  if (tasks.length === 0 || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-surface text-text-muted">
        <p>No RACI assignments found.</p>
        <p className="text-sm mt-2">Add RACI roles to your mindmap nodes to view them here.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-canvas p-6">
      <table className="w-full text-left border-collapse bg-white shadow-sm rounded-xl overflow-hidden">
        <thead>
          <tr>
            <th className="p-4 border-b border-border bg-surface font-semibold text-text-primary sticky left-0 z-10 w-1/3 min-w-[200px]">Task</th>
            {resources.map(res => (
              <th key={res} className="p-4 border-b border-l border-border bg-surface font-semibold text-text-primary text-center whitespace-nowrap">
                {res}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-surface-hover transition-colors">
              <td className="p-4 border-b border-border text-sm font-medium sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0]">
                {task.topic}
              </td>
              {resources.map(res => {
                const role = getRaciRole(task, res);
                return (
                  <td key={res} className="p-4 border-b border-l border-border text-center">
                    {role && (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        role.includes('A') ? 'bg-error/10 text-error' :
                        role.includes('R') ? 'bg-primary/10 text-primary' :
                        role.includes('C') ? 'bg-warning/10 text-warning' :
                        'bg-info/10 text-info'
                      }`}>
                        {role}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
