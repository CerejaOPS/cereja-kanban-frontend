import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { Task, Phase } from './types';

export const usePhases = () => {
  return useQuery({
    queryKey: ['phases'],
    queryFn: async () => {
      const { data } = await api.get<Phase[]>('/api/phases');
      return data;
    },
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get<Task[]>('/api/tasks');
      return data;
    },
  });
};

export const useTaskDetails = (taskId: number | null) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data } = await api.get<Task>(`/api/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
};

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data } = await api.get('/api/members');
      return data as { id: string; username: string; display_name?: string }[];
    },
  });
};

export const useLabels = () => {
  return useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const { data } = await api.get('/api/labels');
      return data as { id: number; name: string; color: string }[];
    },
  });
};

export const useTaskComments = (taskId: number | null) => {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/${taskId}/comments`);
      return data as any[];
    },
    enabled: !!taskId,
  });
};

export const useTaskActivity = (taskId: number | null) => {
  return useQuery({
    queryKey: ['activity', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/${taskId}/activity`);
      return data as any[];
    },
    enabled: !!taskId,
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, phase }: { taskId: number; phase: string }) => {
      const { data } = await api.patch(`/api/tasks/${taskId}/phase`, { phase });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: {
      title: string;
      phase: string;
      description?: string;
      board_id?: number;
    }) => {
      const { data } = await api.post('/api/tasks', newTask);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: Record<string, any> }) => {
      const { data } = await api.patch(`/api/tasks/${taskId}`, updates);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const { data } = await api.delete(`/api/tasks/${taskId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, text }: { taskId: number; text: string }) => {
      const { data } = await api.post(`/api/tasks/${taskId}/comments`, { text });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.taskId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, commentId }: { taskId: number; commentId: number }) => {
      const { data } = await api.delete(`/api/tasks/${taskId}/comments/${commentId}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] });
    },
  });
};

export const useTakeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const { data } = await api.post(`/api/tasks/${taskId}/take`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables] });
    },
  });
};

export const useReleaseTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      minutes,
      note,
      phase,
    }: {
      taskId: number;
      minutes: number;
      note: string;
      phase: string;
    }) => {
      const { data } = await api.post(`/api/tasks/${taskId}/release`, { minutes, note, phase });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.taskId] });
    },
  });
};

export const useLogTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      minutes,
      note,
      phase,
      source,
    }: {
      taskId: number;
      minutes: number;
      note: string;
      phase: string;
      source: string;
    }) => {
      const { data } = await api.post(`/api/tasks/${taskId}/time`, {
        minutes,
        note,
        phase,
        source,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.taskId] });
    },
  });
};
