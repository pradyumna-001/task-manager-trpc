import { appRouter } from './router';
import { addTask } from '../../lib/tasks';

async function main() {
  const caller = appRouter.createCaller({});

  // --- taskList tests ---

  // Seed tasks
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('First task');
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('Second task');

  const result = await caller.taskList();
  console.assert(Array.isArray(result), 'taskList should return an array');
  console.assert(result.length === 2, `taskList should return 2 items, got ${result.length}`);
  for (let i = 0; i < result.length - 1; i++) {
    console.assert(
      result[i].createdAt.getTime() >= result[i + 1].createdAt.getTime(),
      'taskList should be sorted newest first'
    );
  }

  // --- taskCreate tests ---

  // Test: create task with title only
  await new Promise(resolve => setTimeout(resolve, 5));
  const created = await caller.taskCreate({ title: 'New task' });
  console.assert(created.title === 'New task', 'created task should have correct title');
  console.assert(created.description === undefined, 'description should be undefined when not provided');
  console.assert(typeof created.id === 'string' && created.id.length > 0, 'task should have a unique id');
  console.assert(created.createdAt instanceof Date, 'createdAt should be a Date');

  // Test: create task with title and description
  await new Promise(resolve => setTimeout(resolve, 5));
  const createdWithDesc = await caller.taskCreate({
    title: 'Task with description',
    description: 'Some details here',
  });
  console.assert(createdWithDesc.title === 'Task with description', 'title should match');
  console.assert(
    createdWithDesc.description === 'Some details here',
    'description should match'
  );

  // Test: empty title should be rejected by Zod
  try {
    await caller.taskCreate({ title: '' });
    console.assert(false, 'should have thrown for empty title');
  } catch (e) {
    console.log('Empty title rejected by Zod:', (e as Error).message);
  }

  // Test: taskList now includes the newly created task
  const updated = await caller.taskList();
  console.assert(updated.length === 4, `taskList should return 4 items, got ${updated.length}`);

  console.log('All taskCreate and taskList tests passed.');
}

main().catch(console.error);
