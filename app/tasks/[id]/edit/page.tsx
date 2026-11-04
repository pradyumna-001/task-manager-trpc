'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditTaskPage() {
  const params = useParams();
  const id = params.id as string;

  const [titleValue, setTitle] = useState('');
  const [descriptionValue, setDescription] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const taskQuery = trpc.taskGetById.useQuery({ id: id ?? '' }, {
    enabled: !!id,
    retry: false,
  });

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

  // Populate form from query data once loaded
  useEffect(() => {
    if (taskQuery.data && !taskQuery.isLoading) {
      setTitle(taskQuery.data.title);
      setDescription(taskQuery.data.description ?? '');
    }
  }, [taskQuery.data, taskQuery.isLoading]);

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

  if (taskQuery.isLoading) {
    return (
      <div className="container">
        <p className="loading-text">Loading task...</p>
      </div>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 className="page-title">Task not found</h1>
          <p>Could not load task with id {id}.</p>
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