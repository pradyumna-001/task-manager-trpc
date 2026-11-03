'use client';

import { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';

export default function CreateTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const create = trpc.taskCreate.useMutation({
    onSuccess: () => {
      window.location.href = '/tasks';
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ title, description });
  };

  return (
    <main>
      <h1>Create Task</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      <p>
        <Link href="/tasks">Back to task list</Link>
      </p>
    </main>
  );
}
