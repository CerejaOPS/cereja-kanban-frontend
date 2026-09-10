import { Task } from '../types/Task';

const BASE_URL = 'http://localhost:8080/api';

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${BASE_URL}/tasks`);
  return response.json();
}

export async function moveTask(taskId: number, novaFase: string): Promise<void> {
  await fetch(`${BASE_URL}/tasks/${taskId}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ novaFase: novaFase.toUpperCase() }),
  });
}