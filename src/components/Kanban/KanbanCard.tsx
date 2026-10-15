import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types/Task';
import styles from '../../App.module.css';
interface Props {
  task: Task;
  onCardClick?: (task: Task) => void;
}

// Função auxiliar: recebe a prioridade e devolve a classe do App.module.css correspondente
function getPriorityClass(priority?: string) {
  switch (priority?.toLowerCase()) {
    case 'baixa':
      return styles.priorityBaixa;
    case 'media':
      return styles.priorityMedia;
    case 'alta':
      return styles.priorityAlta;
    case 'urgente':
      return styles.priorityUrgente;
    default:
      return ''; // caso a task não tenha prioridade, não adiciona borda extra
  }
}

export function KanbanCard({ task, onCardClick }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${styles.card} ${getPriorityClass(task.priority)}`} // Borda colorida junto ao Card
      onClick={() => onCardClick?.(task)}
    >
      <span className={styles.taskId}>#{task.id} {task.priority?.toLowerCase() === 'urgente' && '🔥'}</span>
      <p className={styles.taskTitle}>{task.title}</p>
    </div>
  );
}