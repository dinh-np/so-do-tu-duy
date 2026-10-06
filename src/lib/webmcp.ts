import { MindNode } from './db';
import { exportToDocx, exportToPptx, exportToXlsx, exportToMsProject, exportToPng, exportToPdf } from './export-engine';
import { exportToMgmx } from './mgmx-parser';

// Extend the global Document interface for WebMCP (document.modelContext)
declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        toolName: string,
        description: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: (args: any) => Promise<any> | any
      ) => void;
    };
  }
}

interface MCPContext {
  getRoot: () => MindNode;
  onUpdateNode: (id: string, updates: Partial<MindNode>) => void;
  onAddNode: (parentId: string, node: MindNode) => void;
  onDeleteNode: (id: string) => void;
  onFocusNode: (id: string) => void;
  title: string;
}

export function registerWebMCPTools(context: MCPContext) {
  if (typeof document === 'undefined' || !document.modelContext) {
    console.warn('WebMCP context not found. Tools will not be registered.');
    return;
  }

  const mc = document.modelContext;

  mc.registerTool(
    'add_node',
    'Add a child node programmatically to the mindmap WBS.',
    ({ parentId, topic, priority, duration, assignee }) => {
      const newNode: MindNode = {
        id: `node-${Date.now()}`,
        topic,
        task: { priority, duration, assignee }
      };
      context.onAddNode(parentId, newNode);
      return { success: true, nodeId: newNode.id };
    }
  );

  mc.registerTool(
    'update_node',
    'Update task progress, dates, color, or status in place.',
    ({ nodeId, updates }) => {
      context.onUpdateNode(nodeId, updates);
      return { success: true };
    }
  );

  mc.registerTool(
    'delete_node',
    'Safely remove a node and its descendants.',
    ({ nodeId }) => {
      context.onDeleteNode(nodeId);
      return { success: true };
    }
  );

  mc.registerTool(
    'focus_node',
    'Smoothly pan and zoom the canvas camera to center on the target node.',
    ({ nodeId }) => {
      context.onFocusNode(nodeId);
      return { success: true };
    }
  );

  mc.registerTool(
    'get_project_summary',
    'Return current WBS structure, overdue milestones, and critical metrics.',
    () => {
      const root = context.getRoot();
      let totalNodes = 0;
      let completedTasks = 0;
      let totalTasks = 0;

      const traverse = (node: MindNode) => {
        totalNodes++;
        if (node.task) {
          totalTasks++;
          if (node.task.progress === 100) completedTasks++;
        }
        node.children?.forEach(traverse);
      };
      traverse(root);

      return {
        title: context.title,
        totalNodes,
        totalTasks,
        completedTasks,
        progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      };
    }
  );

  mc.registerTool(
    'get_critical_path',
    'Calculate and return the bottleneck task sequence based on duration and dependencies.',
    () => {
      // Simplified Critical Path calculation for demonstration
      const root = context.getRoot();
      const paths: { path: string[], duration: number }[] = [];

      const findPaths = (node: MindNode, currentPath: string[], currentDuration: number) => {
        const dur = node.task?.duration || 1;
        const newPath = [...currentPath, node.topic];
        const newDur = currentDuration + dur;

        if (!node.children || node.children.length === 0) {
          paths.push({ path: newPath, duration: newDur });
        } else {
          node.children.forEach(c => findPaths(c, newPath, newDur));
        }
      };

      findPaths(root, [], 0);
      paths.sort((a, b) => b.duration - a.duration);

      if (paths.length > 0) {
        return {
          criticalPath: paths[0].path,
          totalDuration: paths[0].duration,
        };
      }
      return { criticalPath: [], totalDuration: 0 };
    }
  );

  mc.registerTool(
    'export_project',
    'Trigger direct export without manual menu clicks.',
    async ({ format }) => {
      const root = context.getRoot();
      const title = context.title;
      try {
        switch (format) {
          case 'pptx': await exportToPptx(root, title); break;
          case 'xlsx': await exportToXlsx(root, title); break;
          case 'docx': await exportToDocx(root, title); break;
          case 'xml': await exportToMsProject(root, title); break;
          case 'mgmx': await exportToMgmx(root, title); break;
          case 'png': await exportToPng(title); break;
          case 'pdf': await exportToPdf(title); break;
          default: return { success: false, error: 'Unsupported format' };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }
  );
}
