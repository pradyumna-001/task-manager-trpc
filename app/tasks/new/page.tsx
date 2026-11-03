'use client';

import { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';

export default function CreateTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const create = trpc.taskCreate.useMutation({
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Task created successfully!' });
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message || 'Failed to create task' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    create.mutate({ title, description });
  };

  return (
    <main>
      <h1>Create Task</h1>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={create.isPending}
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={create.isPending}
          />
        </label>
        <button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      <p>
        <Link href="/">Back to task list</Link>
      </p>
    </main>
  );
}