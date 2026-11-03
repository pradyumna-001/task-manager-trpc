import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { z } from 'zod';
import { listTasks, addTask } from '../../lib/tasks';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  hello: t.procedure.query(() => 'hello'),
  taskList: t.procedure.query(() => listTasks()),
  taskCreate: t.procedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => addTask(input.title, input.description)),
});

export type AppRouter = typeof appRouter;
