import type { Task } from '@/types/task';

export const tasks: Task[] = [];

export function addTask(title: string, description?: string): Task {
  if (!title) {
    throw new Error('Title is required');
  }

  const task: Task = {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date(),
  };

  tasks.push(task);
  return task;
}

export function listTasks(): Task[] {
  return [...tasks].sort((a, b) => {
    const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.id.localeCompare(b.id);
  });
}
