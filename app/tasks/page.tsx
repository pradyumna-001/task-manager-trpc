import React from 'react';
import { appRouter } from '@/server/trpc/router';

export default async function TaskListPage() {
  const caller = appRouter.createCaller({});
  const tasks = await caller.taskList();

  return (
    <main>
      <h1>Task List</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h2>{task.title}</h2>
            {task.description && <p>{task.description}</p>}
            <time>{task.createdAt.toLocaleDateString()}</time>
          </li>
        ))}
      </ul>
    </main>
  );
}
