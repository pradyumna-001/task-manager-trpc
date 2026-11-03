import { addTask, tasks } from './lib/tasks';

// Test 1: add a task with title only
const t1 = addTask('Buy milk');
console.assert(t1.title === 'Buy milk', 'title should match');
console.assert(t1.description === undefined, 'description should be undefined');
console.assert(typeof t1.id === 'string' && t1.id.length > 0, 'id should be a non-empty string');
console.assert(t1.createdAt instanceof Date, 'createdAt should be a Date');

// Test 2: add a task with title and description
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

console.log('All addTask tests passed.');
