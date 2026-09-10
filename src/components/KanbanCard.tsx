import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/Task';
import styles from '../App.module.css';

interface Props {
  task: Task;
}

export function KanbanCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={styles.card}>
      <span className={styles.taskId}>#{task.id}</span>
      <p className={styles.taskTitle}>{task.title}</p>
    </div>
  );
}