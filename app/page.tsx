'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/app/_trpc/client';
import TaskRow from './tasks/TaskRow';
import Link from 'next/link';

export default function HomePage() {
  const [tasks, setTasks] = useState<{
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
  }[]>([]);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadTasks = async (skip: number) => {
    setIsLoading(true);
    const newTasks = await (trpc.taskList as any).query({ skip, take: 10 });
    setTasks((prev) => [...prev, ...newTasks]);
    setSkip(skip + newTasks.length);
    setIsLoading(false);
    setHasMore(newTasks.length === 10);
  };

  useEffect(() => {
    setTasks([]);
    setSkip(0);
    setHasMore(true);
    (trpc.taskList as any).query({ skip: 0, take: 10 }).then((initialTasks: { id: string; title: string; description?: string; createdAt: Date }[]) => {
      setTasks(initialTasks);
      setSkip(initialTasks.length);
      setHasMore(initialTasks.length === 10);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsLoading(true);
        (trpc.taskList as any).query({ skip, take: 10 }).then((newTasks: { id: string; title: string; description?: string; createdAt: Date }[]) => {
          setTasks((prev) => [...prev, ...newTasks]);
          setSkip(skip + newTasks.length);
          setIsLoading(false);
          setHasMore(newTasks.length === 10);
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tasks.length, skip, isLoading, hasMore]);

  return (
    <main>
      <h1>Task List</h1>
      <p>
        <a href="/tasks/new" style={{ textDecoration: 'none' }}>
          <button>Create Task</button>
        </a>
      </p>
      <ul>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
      {isLoading && <p>Loading more tasks...</p>}
      {!hasMore && tasks.length > 0 && <p>No more tasks</p>}
    </main>
  );
}
