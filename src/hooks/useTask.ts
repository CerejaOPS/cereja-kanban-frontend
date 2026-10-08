import { useEffect, useState } from 'react';
import { Task } from '../types/Task';
import { deleteTask, fetchTasks, moveTask, updateTask } from '../api/taskApi';

// Mocks de tarefas para testar o quadro enquanto o backend não estiver rodando
const MOCK_INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Configurar PostgreSQL e migrations',
    phase: 'backlog',
    priority: 'alta',
    description: 'Criar tabelas no banco de dados e conectar com o Spring Boot.',
    assignee: { name: 'Gustavo', discordId: '1' },
  },
  {
    id: 2,
    title: 'Criar Webhooks do Discord Bot',
    phase: 'todo',
    priority: 'urgente',
    description: 'Notificar no canal do Discord quando uma tarefa mudar de fase.',
    assignee: { name: 'Marcus', discordId: '2' },
  },
  {
    id: 3,
    title: 'Desenvolver Modal de Detalhes da Tarefa',
    phase: 'andamento',
    priority: 'media',
    description: 'Implementar o componente TaskDetailsModal com checklist e comentários.',
    assignee: { name: 'Você', discordId: '3' },
  },
  {
    id: 4,
    title: 'Setup inicial do Vite + React + TS',
    phase: 'concluido',
    priority: 'baixa',
    description: 'Estruturação inicial com Clean Architecture Frontend.',
    assignee: { name: 'agbram', discordId: '4' },
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_INITIAL_TASKS);

  useEffect(() => {
    fetchTasks()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      })
      .catch(() => {
        // Backend offline: mantém os dados mockados no quadro
      });
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

  function handleUpdateTask(updatedTask: Task){
    setTasks((atual) => 
      atual.map((task) => (task.id === updatedTask.id ? updatedTask : task)));

    updateTask(updatedTask.id, updatedTask).catch((e) => console.error(e));
  }

  function handleDeleteTask(taskId: number) {
  // remove do estado local
  setTasks((atual) => atual.filter((task) => task.id !== taskId));
  // avisa o backend
  deleteTask(taskId).catch((e) => console.error(e));
}



  return { tasks, handleMove, handleUpdateTask, handleDeleteTask };
}