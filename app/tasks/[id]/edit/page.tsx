'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditTaskPage() {
  const { id } = useParams();
  const taskId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
  console.log('[EditTaskPage] useParams.id:', taskId);

  const { data: task, isLoading } = trpc.taskGetById.useQuery({ id: taskId ?? '' });
  console.log('[EditTaskPage] task:', task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const update = trpc.taskUpdate.useMutation({
    onSuccess: () => {
      console.log('[EditTaskPage] update succeeded, redirecting to /');
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('[EditTaskPage] update failed:', error);
    },
  });

  // Sync form fields when task data loads
  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EditTaskPage] submit called with:', { id: taskId, title, description });
    if (!taskId) {
      setTitleError('Invalid task ID');
      return;
    }
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);
    update.mutate({ id: taskId, title, description });
  };

  if (isLoading || !task) {
    return (
      <main>
        <h1>Loading...</h1>
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
        <Link href="/">Back to task list</Link>
      </p>
    </main>
  );
}
