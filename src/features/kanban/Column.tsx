import { Phase, Task } from '@/entities/task/types';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Skeleton } from '@/shared/ui/skeleton';

function phaseColor(id: string) {
  const map: Record<string, string> = {
    backlog: '#64748b',
    todo: '#3b82f6',
    andamento: '#eab308',
    revisao: '#a855f7',
    concluido: '#10b981',
    bloqueado: '#ef4444',
  };
  return map[id] || '#6366f1';
}

interface ColumnProps {
  phase: Phase;
  tasks: Task[];
  isLoading?: boolean;
  onTaskClick: (taskId: number) => void;
}

export function Column({ phase, tasks, isLoading, onTaskClick }: ColumnProps) {
  const color = phaseColor(phase.id);

  return (
    <div className="flex h-full w-80 shrink-0 flex-col rounded-xl bg-zinc-900/30 border border-zinc-800/50">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <h3 className="text-sm font-semibold text-zinc-200">{phase.name}</h3>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-400">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={phase.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-3 pb-3 rounded-b-xl transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-800/20' : ''}`}
          >
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl bg-zinc-800" />
                <Skeleton className="h-24 w-full rounded-xl bg-zinc-800" />
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => onTaskClick(task.id)}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
