import { useEffect, useState } from "react";
import { Task, BoardMember } from "../types/Task";
import {
  deleteTask,
  fetchTasks,
  moveTask,
  updateTask,
  fetchBoardMembers,
  assignTask,
} from "../api/taskApi";
import useBoardEvents from "./useBoardEvents";
import { useQuery } from "@tanstack/react-query";

// Mocks de tarefas para fallback local
const MOCK_INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Configurar PostgreSQL e migrations",
    phase: "backlog",
    priority: "alta",
    description: "Criar tabelas no banco de dados e conectar com o Spring Boot.",
    assignee: { name: "Gustavo", discordId: "1" },
  },
  {
    id: 2,
    title: "Criar Webhooks do Discord Bot",
    phase: "todo",
    priority: "urgente",
    description: "Notificar no canal do Discord quando uma tarefa mudar de fase.",
    assignee: { name: "Marcus", discordId: "2" },
  },
  {
    id: 3,
    title: "Desenvolver Modal de Detalhes da Tarefa",
    phase: "andamento",
    priority: "media",
    description: "Implementar o componente TaskDetailsModal com checklist e comentários.",
    assignee: { name: "Você", discordId: "3" },
  },
  {
    id: 4,
    title: "Setup inicial do Vite + React + TS",
    phase: "concluido",
    priority: "baixa",
    description: "Estruturação inicial com Clean Architecture Frontend.",
    assignee: { name: "agbram", discordId: "4" },
  },
];

// Membros mockados para fallback local
const MOCK_BOARD_MEMBERS: BoardMember[] = [
  { id: 1, discordId: "1", username: "Gustavo", role: "dev" },
  { id: 2, discordId: "2", username: "Marcus", role: "pm" },
  { id: 3, discordId: "3", username: "Você", role: "dev" },
  { id: 4, discordId: "4", username: "agbram", role: "dev" },
];

export function useTasks(boardId: number = 1) {
  // 1. Escuta eventos em tempo real via SSE
  useBoardEvents(boardId);

  // 2. Busca tasks gerenciadas pelo cache do TanStack Query
  const { data: serverTasks } = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: fetchTasks,
  });

  const [tasks, setTasks] = useState<Task[]>(MOCK_INITIAL_TASKS);
  const [members, setMembers] = useState<BoardMember[]>(MOCK_BOARD_MEMBERS);

  // Sincroniza dados da API quando disponíveis
  useEffect(() => {
    if (serverTasks && serverTasks.length > 0) {
      setTasks(serverTasks);
    }
  }, [serverTasks]);

  // Carrega membros disponíveis para atribuição
  useEffect(() => {
    fetchBoardMembers(boardId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data);
        }
      })
      .catch(() => {
        // Backend offline: mantém membros mockados
      });
  }, [boardId]);

  function handleMove(taskId: number, novaFase: string) {
    setTasks((atual) =>
      atual.map((task) =>
        task.id === taskId ? { ...task, phase: novaFase } : task
      )
    );
    moveTask(taskId, novaFase).catch((e) => console.error(e));
  }

  function handleUpdateTask(updatedTask: Task) {
    setTasks((atual) =>
      atual.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    updateTask(updatedTask.id, updatedTask).catch((e) => console.error(e));
  }

  function handleDeleteTask(taskId: number) {
    setTasks((atual) => atual.filter((task) => task.id !== taskId));
    deleteTask(taskId).catch((e) => console.error(e));
  }

  function handleAssignTask(taskId: number, member: BoardMember | null) {
    // Atualização otimista no estado local
    setTasks((atual) =>
      atual.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignee: member
                ? {
                    name: member.username,
                    discordId: member.discordId,
                    avatarUrl: member.avatar,
                  }
                : undefined,
            }
          : task
      )
    );

    // Persiste no backend
    const discordId = member ? member.discordId : null;
    assignTask(taskId, discordId).catch((e) =>
      console.error("Erro ao atribuir responsável:", e)
    );
  }

  return {
    tasks,
    members,
    handleMove,
    handleUpdateTask,
    handleDeleteTask,
    handleAssignTask,
  };
}
