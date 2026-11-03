import { appRouter } from './router';
import { addTask } from '../../lib/tasks';

async function main() {
  const caller = appRouter.createCaller({});

  // Seed tasks to test against
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('First task');
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('Second task');
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('Third task');

  // Test 1: taskList returns all tasks from store
  const result = await caller.taskList();
  console.assert(Array.isArray(result), 'taskList should return an array');
  console.assert(result.length === 3, `taskList should return 3 items, got ${result.length}`);

  // Test 2: taskList returns tasks sorted newest first
  for (let i = 0; i < result.length - 1; i++) {
    console.assert(
      result[i].createdAt.getTime() >= result[i + 1].createdAt.getTime(),
      'taskList should be sorted newest first'
    );
  }
  console.assert(result[0].title === 'Third task', 'newest task should be first');
  console.assert(result[2].title === 'First task', 'oldest task should be last');

  console.log('All taskList tests passed.');
}

main().catch(console.error);
