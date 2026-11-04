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
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 className="page-title">Task not found</h1>
          <p>Task with id {id} not found.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
            Back to task list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Edit Task</h1>
      </header>

      <div className="card" style={{ maxWidth: '500px' }}>
        {message && (
          <div className={`toast ${message.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ marginBottom: '16px' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={titleValue}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              required
              disabled={update.isPending}
            />
            {titleError && <p className="error-text">{titleError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={descriptionValue}
              onChange={(e) => setDescription(e.target.value)}
              disabled={update.isPending}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" disabled={update.isPending} className="btn btn-primary">
              {update.isPending ? 'Updating...' : 'Update Task'}
            </button>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}