'use client';

import { useState, use } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditTaskPage() {
  const { id } = useParams();
  console.log('[EditTaskPage] useParams.id:', id);

  const { data } = trpc.taskList.useQuery();
  console.log('[EditTaskPage] taskList data:', data);
  const task = data?.find((t) => t.id === id);
  console.log('[EditTaskPage] found task:', task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const update = trpc.taskUpdate.useMutation({
    onSuccess: () => {
      console.log('[EditTaskPage] update succeeded, redirecting to /tasks');
      window.location.href = '/tasks';
    },
    onError: (error) => {
      console.error('[EditTaskPage] update failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EditTaskPage] submit called with:', { id, title, description });
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);
    update.mutate({ id, title, description });
  };

  if (!task) {
    return (
      <main>
        <h1>Task not found</h1>
        <p>Looking for id: {id}</p>
        <p>Available tasks: {data?.map((t) => t.id).join(', ') || 'none'}</p>
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
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
            required
          />
          {titleError && <span style={{ color: 'red' }}>{titleError}</span>}
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
