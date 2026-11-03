'use client';

import { trpc } from '@/app/_trpc/client';

export default function TaskRow({ task }: { task: { id: string; title: string; description?: string; createdAt: Date } }) {
  const del = trpc.taskDelete.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  return (
    <li>
      <h2>{task.title}</h2>
      {task.description && <p>{task.description}</p>}
      <time>{task.createdAt.toLocaleDateString()}</time>
      <button onClick={() => del.mutate({ id: task.id })}>Delete</button>
    </li>
  );
}
