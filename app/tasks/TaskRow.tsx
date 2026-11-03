'use client';

import Link from 'next/link';
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
      <time suppressHydrationWarning>{task.createdAt.toLocaleDateString()}</time>
      <p>
        <Link
          href={{
            pathname: `/tasks/${task.id}/edit`,
            query: {
              id: task.id,
              title: task.title,
              description: task.description ?? '',
            },
          }}
        >
          Edit
        </Link>
        <button onClick={() => del.mutate({ id: task.id })}>Delete</button>
      </p>
    </li>
  );
}
