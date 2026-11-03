'use client';

import { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function EditTaskPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const titleParam = searchParams.get('title') ?? '';
  const descriptionParam = searchParams.get('description') ?? '';

  const [titleValue, setTitle] = useState(titleParam);
  const [descriptionValue, setDescription] = useState(descriptionParam);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const update = trpc.taskUpdate.useMutation({
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Task updated successfully!' });
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message || 'Failed to update task' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!id) {
      setTitleError('Invalid task ID');
      return;
    }
    if (!titleValue.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);
    update.mutate({ id, title: titleValue, description: descriptionValue });
  };

  if (!id) {
    return (
      <main>
        <h1>Task not found</h1>
        <p>Task with id {id} not found.</p>
        <p>
          <Link href="/">Back to task list</Link>
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Edit Task</h1>
      {message && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={titleValue}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
            required
            disabled={update.isPending}
          />
          {titleError && <span style={{ color: 'red' }}>{titleError}</span>}
        </label>
        <label>
          Description
          <textarea
            value={descriptionValue}
            onChange={(e) => setDescription(e.target.value)}
            disabled={update.isPending}
          />
        </label>
        <button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Updating...' : 'Update Task'}
        </button>
      </form>
      <p>
        <Link href="/">Back to task list</Link>
      </p>
    </main>
  );
}