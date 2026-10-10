import type { AuditEntry } from '../../../shared/audit';
import type { Actor, Task, TaskUpdate } from '../../../shared/task';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Request failed');
  }

  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

export const taskApi = {
  list: () => request<Task[]>('/api/tasks'),
  create: (input: { title: string; description?: string }, actor: Actor) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify({ actor, ...input }) }),
  update: (id: string, actor: Actor, input: TaskUpdate) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ actor, ...input }) }),
  remove: (id: string, actor: Actor) => request<void>(`/api/tasks/${id}`, { method: 'DELETE', body: JSON.stringify({ actor }) }),
  history: (id: string) => request<AuditEntry[]>(`/api/tasks/${id}/history`),
  allHistory: () => request<AuditEntry[]>('/api/history'),
};
