import { addTask, listTasks, tasks, updateTask } from './tasks';

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

  // Test 8: updateTask updates title only
  await new Promise(resolve => setTimeout(resolve, 5));
  const updated = updateTask(t1.id, { title: 'Buy bread' });
  console.assert(updated.title === 'Buy bread', 'title should be updated');
  console.assert(updated.description === undefined, 'description should remain undefined');
  console.assert(updated.id === t1.id, 'id should not change');
  console.assert(updated.createdAt.getTime() === t1.createdAt.getTime(), 'createdAt should not change');
  console.assert(tasks.find(t => t.id === t1.id)?.title === 'Buy bread', 'store should reflect update');

  // Test 9: updateTask updates description only
  await new Promise(resolve => setTimeout(resolve, 5));
  const updated2 = updateTask(t2.id, { description: 'Updated description' });
  console.assert(updated2.description === 'Updated description', 'description should be updated');
  console.assert(updated2.title === 'Write report', 'title should remain unchanged');
  console.assert(updated2.id === t2.id, 'id should not change');

  // Test 10: updateTask updates both title and description
  const updated3 = updateTask(t3.id, { title: 'Third task updated', description: 'New description' });
  console.assert(updated3.title === 'Third task updated', 'title should be updated');
  console.assert(updated3.description === 'New description', 'description should be updated');

  // Test 11: updateTask throws for nonexistent id
  try {
    updateTask('nonexistent-id', { title: 'Should not work' });
    console.assert(false, 'should have thrown for nonexistent id');
  } catch (e) {
    console.log('Nonexistent id throws:', (e as Error).message);
  }

  // Test 12: updateTask does not modify other tasks
  const otherTasks = tasks.filter(t => t.id !== t1.id && t.id !== t2.id && t.id !== t3.id);
  const otherIdsBefore = otherTasks.map(t => t.id);
  updateTask(t1.id, { title: 'Changed' });
  const otherIdsAfter = tasks.filter(t => t.id !== t1.id && t.id !== t2.id && t.id !== t3.id).map(t => t.id);
  console.assert(
    JSON.stringify(otherIdsBefore) === JSON.stringify(otherIdsAfter),
    'other tasks should not be affected'
  );

  console.log('All tests passed.');
}

main();
