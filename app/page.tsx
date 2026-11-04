'use client';

import React, { useEffect, useRef } from 'react';
import { trpc } from '@/app/_trpc/client';
import TaskRow from './tasks/TaskRow';
import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

const trpcWithHooks = trpc as typeof trpc & {
  useInfiniteQuery: <TData, TError>(
    path: readonly string[],
    input: unknown,
    opts: {
      getNextPageParam: (lastPage: TData, allPages: TData[]) => { skip: number; take: number } | undefined;
    }
  ) => {
    data: { pages: TData[] } | undefined;
    fetchNextPage: () => Promise<unknown>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    isError: boolean;
  };
};

export default function HomePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = trpcWithHooks.useInfiniteQuery<Task[], Error>(
    ['taskList'],
    { skip: 0, take: 10 },
    {
      getNextPageParam: (lastPage: Task[], allPages: Task[][]) => {
        if (lastPage.length < 10) return undefined;
        const nextSkip = allPages.length * 10;
        return { skip: nextSkip, take: 10 };
      },
    }
  );

  const tasks = data?.pages.flatMap((page: Task[]) => page) ?? [];
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!hasNextPage) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          isFetchingRef.current = true;
          fetchNextPage().finally(() => {
            isFetchingRef.current = false;
          });
        }
      },
      { rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage]);

  if (isLoading) {
    return (
      <div className="container">
        <p className="loading-text">Loading tasks...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container">
        <p className="loading-text">Error loading tasks</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Task List</h1>
        <Link href="/tasks/new" className="btn btn-primary">
          Create Task
        </Link>
      </header>

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Create your first task!</p>
      ) : (
        <>
          <div>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={{ ...task, createdAt: new Date(task.createdAt) }} />
            ))}
          </div>
          <div ref={loadMoreRef} style={{ height: '20px' }}>
            {hasNextPage && isFetchingNextPage && <p className="loading-text">Loading more tasks...</p>}
            {!hasNextPage && tasks.length > 0 && <p className="empty-state">No more tasks</p>}
          </div>
        </>
      )}
    </div>
  );
}