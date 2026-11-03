import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { listTasks } from '../../lib/tasks';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  hello: t.procedure.query(() => 'hello'),
  taskList: t.procedure.query(() => listTasks()),
});

export type AppRouter = typeof appRouter;
