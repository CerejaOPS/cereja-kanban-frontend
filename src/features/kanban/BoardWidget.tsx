import { useState, useMemo, useEffect } from 'react';
import { usePhases, useTasks, useMoveTask } from '@/entities/task/api';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { TaskDetailsModal } from './TaskDetailsModal';
import { BoardHeader, FilterState } from './BoardHeader';
import { useQueryClient } from '@tanstack/react-query';
import { Task } from '@/entities/task/types';

export function BoardWidget() {
  const { data: phases, isLoading: isLoadingPhases } = usePhases();
  const { data: tasks, isLoading: isLoadingTasks } = useTasks();
  const moveTask = useMoveTask();
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Real-time SSE
  useEffect(() => {
    const isDev = import.meta.env.MODE === 'development';
    const baseUrl = isDev ? 'http://localhost:3001' : '';

    let eventSource = new EventSource(`${baseUrl}/api/events`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'ping') return;

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: ['tasks'] });

        // Also invalidate individual task if open
        if (data.data?.taskId) {
          queryClient.invalidateQueries({ queryKey: ['task', data.data.taskId] });
          queryClient.invalidateQueries({ queryKey: ['activity', data.data.taskId] });
          queryClient.invalidateQueries({ queryKey: ['comments', data.data.taskId] });
        }
      } catch (err) {
        console.error('SSE parsing error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const [filters, setFilters] = useState<FilterState>({ text: '', assignee: '', label: '' });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      // Text Filter (ID or Title)
      if (filters.text) {
        const query = filters.text.toLowerCase();
        const idMatch = task.id.toString().includes(query);
        const titleMatch = task.title.toLowerCase().includes(query);
        if (!idMatch && !titleMatch) return false;
      }

      // Assignee Filter
      if (filters.assignee) {
        if (task.assignee_discord_id !== filters.assignee) return false;
      }

      // Label Filter
      if (filters.label) {
        const labelId = parseInt(filters.label);
        const taskLabels = (task as any).labels || [];
        if (!taskLabels.some((l: any) => l.id === labelId)) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const taskId = parseInt(draggableId);
    const newPhase = destination.droppableId;

    // Optimistic Update
    queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
      if (!old) return old;
      return old.map((task) => (task.id === taskId ? { ...task, phase: newPhase } : task));
    });

    moveTask.mutate({ taskId, phase: newPhase });
  };

  if (isLoadingPhases) {
    return <div className="text-zinc-400">Carregando quadro...</div>;
  }

  if (!phases || phases.length === 0) {
    return <div className="text-zinc-400">Nenhuma fase encontrada.</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BoardHeader filters={filters} setFilters={setFilters} />

      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {phases
              .sort((a, b) => a.position - b.position)
              .map((phase) => {
                const phaseTasks = filteredTasks.filter((t) => t.phase === phase.id);

                return (
                  <Column
                    key={phase.id}
                    phase={phase}
                    tasks={phaseTasks}
                    isLoading={isLoadingTasks}
                    onTaskClick={(id) => setSelectedTaskId(id)}
                  />
                );
              })}
          </div>
        </DragDropContext>
      </div>

      <TaskDetailsModal
        taskId={selectedTaskId}
        open={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
