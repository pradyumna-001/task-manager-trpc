import React from 'react';
import { appRouter } from '@/server/trpc/router';
import TaskRow from './TaskRow';

export default async function TaskListPage() {
  const caller = appRouter.createCaller({});
  const tasks = await caller.taskList();

  return (
    <main>
      <h1>Task List</h1>
      <ul>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </main>
  );
}
