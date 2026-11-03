'use client';

import { trpc } from '@/app/_trpc/client';

export default function HomePage() {
  const { data } = trpc.hello.useQuery();

  return (
    <main>
      <h1>Task Manager</h1>
      <p>{data}</p>
    </main>
  );
}
