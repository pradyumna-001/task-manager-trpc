import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { z } from 'zod';
import { listTasks, addTask, updateTask, deleteTask, getTask } from '../../lib/tasks';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  hello: t.procedure.query(() => 'hello'),
  taskList: t.procedure.query(() => listTasks()),
  taskGetById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getTask(input.id)),
  taskCreate: t.procedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => addTask(input.title, input.description)),
  taskUpdate: t.procedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      return updateTask(id, updates);
    }),
  taskDelete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteTask(input.id)),
});

export type AppRouter = typeof appRouter;
