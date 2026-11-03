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

type UpdateTaskInput = {
  title?: string;
  description?: string;
};

export function updateTask(id: string, updates: UpdateTaskInput): Task {
  const task = tasks.find(t => t.id === id);
  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }

  const updatedTask: Task = { ...task, ...updates };
  const index = tasks.findIndex(t => t.id === id);
  tasks[index] = updatedTask;
  return updatedTask;
}

export function deleteTask(id: string): boolean {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  tasks.splice(index, 1);
  return true;
}

export function getTask(id: string): Task {
  const task = tasks.find(t => t.id === id);
  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }
  return task;
}
