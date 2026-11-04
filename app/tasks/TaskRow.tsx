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
    <article className="task-card">
      <h2 className="task-title">{task.title}</h2>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        <time className="task-date" dateTime={task.createdAt.toISOString()}>
          {task.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
        <div className="task-actions">
          <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button onClick={handleDelete} disabled={del.isPending} className="btn btn-danger">
            {del.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      {message && (
        <div className={`toast ${message.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ marginTop: '8px' }}>
          {message.text}
        </div>
      )}
    </article>
  );
}