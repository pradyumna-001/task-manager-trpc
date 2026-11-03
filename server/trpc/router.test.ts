import { appRouter } from './router';
import { addTask } from '../../lib/tasks';

async function main() {
  const caller = appRouter.createCaller({});

  // Seed tasks
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('First task');
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('Second task');
  await new Promise(resolve => setTimeout(resolve, 5));
  addTask('Third task');

  // --- taskList tests ---

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

  // --- taskUpdate tests ---

  // Test: update title only
  await new Promise(resolve => setTimeout(resolve, 5));
  const updatedTitle = await caller.taskUpdate({ id: created.id, title: 'Updated title' });
  console.assert(updatedTitle.title === 'Updated title', 'title should be updated');
  console.assert(updatedTitle.description === undefined, 'description should remain undefined');
  console.assert(updatedTitle.id === created.id, 'id should not change');
  console.assert(updatedTitle.createdAt.getTime() === created.createdAt.getTime(), 'createdAt should not change');

  // Test: update description only
  await new Promise(resolve => setTimeout(resolve, 5));
  const updatedDesc = await caller.taskUpdate({ id: createdWithDesc.id, description: 'New description' });
  console.assert(updatedDesc.description === 'New description', 'description should be updated');
  console.assert(updatedDesc.title === 'Task with description', 'title should remain unchanged');
  console.assert(updatedDesc.id === createdWithDesc.id, 'id should not change');

  // Test: update both title and description
  await new Promise(resolve => setTimeout(resolve, 5));
  const updatedBoth = await caller.taskUpdate({
    id: created.id,
    title: 'Fully updated',
    description: 'Both fields changed',
  });
  console.assert(updatedBoth.title === 'Fully updated', 'title should be updated');
  console.assert(updatedBoth.description === 'Both fields changed', 'description should be updated');

  // Test: taskUpdate throws for nonexistent id
  try {
    await caller.taskUpdate({ id: 'nonexistent-id', title: 'Should not work' });
    console.assert(false, 'should have thrown for nonexistent id');
  } catch (e) {
    console.log('Nonexistent id throws:', (e as Error).message);
  }

  // Test: taskList reflects all changes
  const finalList = await caller.taskList();
  console.assert(finalList.length === 5, `taskList should return 5 items, got ${finalList.length}`);

  console.log('All taskUpdate tests passed.');
}

main().catch(console.error);
