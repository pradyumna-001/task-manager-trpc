import { addTask, listTasks, tasks } from './tasks';

async function main() {
  // Test 1: add a task with title only
  const t1 = addTask('Buy milk');
  console.assert(t1.title === 'Buy milk', 'title should match');
  console.assert(t1.description === undefined, 'description should be undefined');
  console.assert(typeof t1.id === 'string' && t1.id.length > 0, 'id should be a non-empty string');
  console.assert(t1.createdAt instanceof Date, 'createdAt should be a Date');

  // Test 2: add a task with title and description
  await new Promise(resolve => setTimeout(resolve, 5));
  const t2 = addTask('Write report', 'Finish the quarterly report');
  console.assert(t2.description === 'Finish the quarterly report', 'description should match');

  // Test 3: empty title should throw
  try {
    addTask('');
    console.assert(false, 'should have thrown for empty title');
  } catch (e) {
    console.log('Empty title throws:', (e as Error).message);
  }

  // Test 4: tasks array accumulates
  console.assert(tasks.length === 2, `tasks should have 2 items, got ${tasks.length}`);

  // Test 5: listTasks returns tasks sorted newest first
  await new Promise(resolve => setTimeout(resolve, 5));
  const t3 = addTask('Third task');
  const listed = listTasks();
  console.assert(listed.length === 3, `list should have 3 items, got ${listed.length}`);
  console.assert(listed[0].title === 'Third task', 'newest task should be first');

  // Verify descending order by createdAt
  for (let i = 0; i < listed.length - 1; i++) {
    console.assert(
      listed[i].createdAt.getTime() >= listed[i + 1].createdAt.getTime(),
      'list should be sorted newest first'
    );
  }

  // Test 6: listTasks does not mutate internal array
  const originalOrder = tasks.map(t => t.id);
  listTasks();
  const afterOrder = tasks.map(t => t.id);
  console.assert(
    JSON.stringify(originalOrder) === JSON.stringify(afterOrder),
    'internal array order should not change after listTasks'
  );

  // Test 7: listTasks returns empty array when no tasks
  const original = listTasks();
  tasks.length = 0;
  console.assert(listTasks().length === 0, 'empty store should return empty array');
  tasks.push(...original);

  console.log('All tests passed.');
}

main();
