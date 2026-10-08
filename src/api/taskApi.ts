import { Task } from "../types/Task";

const BASE_URL = "http://localhost:8080/api";

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${BASE_URL}/tasks`);
  return response.json();
}

export async function moveTask(
  taskId: number,
  novaFase: string,
): Promise<void> {
  await fetch(`${BASE_URL}/tasks/${taskId}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ novaFase: novaFase.toUpperCase() }),
  });
}

export async function getTaskById(taskId: number): Promise<Task> {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

export async function updateTask(
  taskId: number,
  data: Partial<Task>,
): Promise<Task> {
  const payload = {
    ...data,
    priority: data.priority ? data.priority.toUpperCase() : undefined,
  };
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function deleteTask(taskId: number) {
  await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}
