'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/app/_trpc/client';

export default function TaskRow({ task }: { task: { id: string; title: string; description?: string; createdAt: Date } }) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const del = trpc.taskDelete.useMutation({
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Task deleted successfully!' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message || 'Failed to delete task' });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setMessage(null);
      del.mutate({ id: task.id });
    }
  };

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
        <button onClick={handleDelete} disabled={del.isPending}>
          {del.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </p>
      {message && (
        <div
          style={{
            padding: '8px',
            marginTop: '8px',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '14px',
          }}
        >
          {message.text}
        </div>
      )}
    </li>
  );
}