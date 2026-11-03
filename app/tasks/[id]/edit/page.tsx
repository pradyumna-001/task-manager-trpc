'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditTaskPage() {
  const { id } = useParams();
  const taskId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const { data: task, isLoading: taskLoading } = trpc.taskGetById.useQuery({ id: taskId ?? '' }, {
    enabled: !!taskId,
  });

  const [titleValue, setTitle] = useState(task?.title ?? '');
  const [descriptionValue, setDescription] = useState(task?.description ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const update = trpc.taskUpdate.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('[EditTaskPage] update failed:', error);
    },
  });

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) {
      setTitleError('Invalid task ID');
      return;
    }
    if (!titleValue.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);
    update.mutate({ id: taskId, title: titleValue, description: descriptionValue });
  };

  if (taskLoading || !id) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  if (!task) {
    return (
      <main>
        <h1>Task not found</h1>
        <p>Task with id {id} not found.</p>
        <p><Link href="/">Back to task list</Link></p>
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
            value={titleValue}
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
            value={descriptionValue}
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
