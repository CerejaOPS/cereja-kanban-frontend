import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Task } from '../../types/Task';
import { KanbanColumn } from './KanbanColumn';
import styles from '../../App.module.css';

const PHASES = ['backlog', 'todo', 'andamento', 'concluido'];

interface Props {
  tasks: Task[];
  onMove: (taskId: number, novaFase: string) => void;
  onCardClick?: (task: Task) => void;
}

export function KanbanBoard({ tasks, onMove, onCardClick }: Props) {
  // Configura o sensor com tolerância de 8px para permitir clique no card sem disparar o drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    onMove(active.id as number, over.id as string);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        {PHASES.map((fase) => (
          <KanbanColumn
            key={fase}
            fase={fase}
            tasks={tasks.filter((t) => t.phase.toLowerCase() === fase)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}