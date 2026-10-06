'use client';

import { useMemo } from 'react';
import { MindNode } from '@/lib/db';

interface RiskHeatmapProps {
  data: MindNode;
}


export function RiskHeatmap({ data }: RiskHeatmapProps) {
  // Extract all risks
  const risks = useMemo(() => {
    const list: MindNode[] = [];
    const extract = (node: MindNode) => {
      if (node.id !== data.id && node.risk && node.risk.impact && node.risk.probability) {
        list.push(node);
      }
      node.children?.forEach(extract);
    };
    if (data.children) data.children.forEach(extract);
    return list;
  }, [data]);

  const getHeatmapColor = (impact: number, probability: number) => {
    const score = impact * probability;
    if (score >= 15) return 'bg-error text-white'; // High/Critical (Red)
    if (score >= 8) return 'bg-warning text-white'; // Medium (Yellow)
    return 'bg-success text-white'; // Low (Green)
  };

  const matrix = useMemo(() => {
    const grid: MindNode[][][] = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []));
    risks.forEach(risk => {
      if (risk.risk?.impact && risk.risk?.probability) {
        grid[5 - risk.risk.probability][risk.risk.impact - 1].push(risk);
      }
    });
    return grid;
  }, [risks]);

  if (risks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-surface text-text-muted">
        <p>No risks identified.</p>
        <p className="text-sm mt-2">Add probability and impact scores to nodes to view the heatmap.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-canvas p-6 flex flex-col items-center">
      <h2 className="text-xl font-serif text-primary mb-6">Risk Management Heatmap (5x5 Matrix)</h2>
      
      <div className="flex">
        {/* Y Axis Label */}
        <div className="flex items-center justify-center mr-4">
          <div className="transform -rotate-90 text-sm font-semibold text-text-secondary whitespace-nowrap">
            Probability
          </div>
        </div>
        
        <div>
          <div className="grid grid-cols-5 gap-2 border-l border-b border-text-primary p-2 relative">
            {matrix.map((row, pIdx) => (
              row.map((cell, iIdx) => {
                const probability = 5 - pIdx;
                const impact = iIdx + 1;
                return (
                  <div 
                    key={`${probability}-${impact}`} 
                    className={`w-32 h-32 rounded-lg p-2 overflow-y-auto shadow-sm ${getHeatmapColor(impact, probability)} transition-transform hover:scale-105`}
                  >
                    <div className="text-[10px] opacity-70 mb-1 font-bold">P:{probability} x I:{impact}</div>
                    {cell.map(node => (
                      <div key={node.id} className="text-xs font-medium truncate mb-1 bg-black/20 px-1 py-0.5 rounded" title={node.topic}>
                        {node.topic}
                      </div>
                    ))}
                  </div>
                );
              })
            ))}
          </div>
          
          {/* X Axis Label */}
          <div className="flex items-center justify-center mt-4">
            <div className="text-sm font-semibold text-text-secondary">
              Impact
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-success"></div> Low (1-7)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-warning"></div> Medium (8-14)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-error"></div> High/Critical (15-25)</div>
      </div>
    </div>
  );
}
