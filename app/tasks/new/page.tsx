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
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Create Task</h1>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={create.isPending}
              placeholder="Enter task title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={create.isPending}
              placeholder="Optional description"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" disabled={create.isPending} className="btn btn-primary">
              {create.isPending ? 'Creating...' : 'Create Task'}
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