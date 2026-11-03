import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/trpc/router';

const handler = createNextApiHandler({
  router: appRouter,
  createContext: async () => ({}),
});

export const GET = handler;
export const POST = handler;
