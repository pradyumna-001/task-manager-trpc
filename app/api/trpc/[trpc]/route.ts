import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: () => ({}),
    req,
  });

export const GET = handler;
export const POST = handler;
