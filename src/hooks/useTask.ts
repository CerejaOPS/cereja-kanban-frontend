import { useEffect, useState } from 'react';
import { Task } from '../types/Task';
import { fetchTasks, moveTask } from '../api/taskApi';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((e) => console.error(e));
  }, []);

  function handleMove(taskId: number, novaFase: string) {
    // Atualiza a tela imediatamente (otimista)
    setTasks((atual) =>
      atual.map((task) =>
        task.id === taskId ? { ...task, phase: novaFase } : task
      )
    );
    // Avisa o backend
    moveTask(taskId, novaFase).catch((e) => console.error(e));
  }

  return { tasks, handleMove };
}