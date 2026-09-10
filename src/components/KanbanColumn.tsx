import { useDroppable } from '@dnd-kit/core';
import { Task } from '../types/Task';
import { KanbanCard } from './KanbanCard';
import styles from '../App.module.css';

interface Props {
  fase: string;
  tasks: Task[];
}

export function KanbanColumn({ fase, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: fase });

  return (
    <div ref={setNodeRef} className={styles.column} style={{ background: isOver ? '#1c1c20' : undefined }}>
      <h2 className={styles.columnTitle}>{fase.toUpperCase()}</h2>
      {tasks.map((task) => (
        <KanbanCard key={task.id} task={task} />
      ))}
    </div>
  );
}