import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Task } from '../types/Task';
import { KanbanColumn } from './KanbanColumn';
import styles from '../App.module.css';

const PHASES = ['backlog', 'todo', 'andamento', 'concluido'];

interface Props {
  tasks: Task[];
  onMove: (taskId: number, novaFase: string) => void;
}

export function KanbanBoard({ tasks, onMove }: Props) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    onMove(active.id as number, over.id as string);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        {PHASES.map((fase) => (
          <KanbanColumn
            key={fase}
            fase={fase}
            tasks={tasks.filter((t) => t.phase.toLowerCase() === fase)}
          />
        ))}
      </div>
    </DndContext>
  );
}