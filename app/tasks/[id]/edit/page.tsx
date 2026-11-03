'use client';

import { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const { data } = trpc.taskList.useQuery();
  const task = data?.find((t) => t.id === params.id);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const update = trpc.taskUpdate.useMutation({
    onSuccess: () => {
      window.location.href = '/tasks';
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ id: params.id, title, description });
  };

  if (!task) {
    return (
      <main>
        <h1>Task not found</h1>
      </main>
    );
  }

  return (
    <main>
      <h1>Edit Task</h1>
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
        <button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Updating...' : 'Update Task'}
        </button>
      </form>
      <p>
        <Link href="/tasks">Back to task list</Link>
      </p>
    </main>
  );
}
