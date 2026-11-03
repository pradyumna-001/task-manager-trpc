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
  const update = trpc.taskUpdate.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('[EditTaskPage] update failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
