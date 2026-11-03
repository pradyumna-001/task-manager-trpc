import React from 'react';
import { appRouter } from '@/server/trpc/router';
import TaskRow from './tasks/TaskRow';
import Link from 'next/link';

export const revalidate = 0;

export default async function HomePage() {
  const caller = appRouter.createCaller({});
  const tasks = await caller.taskList({});

  return (
    <main>
      <h1>Task List</h1>
      <p>
        <a href="/tasks/new" style={{ textDecoration: 'none' }}>
          <button>Create Task</button>
        </a>
      </p>
      <ul>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </main>
  );
}
