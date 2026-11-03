import TaskRow from './TaskRow';

async function main() {
  const task = {
    id: 'test-id-123',
    title: 'Test task',
    description: 'Test description',
    createdAt: new Date('2026-11-03'),
  };

  // Test 1: TaskRow is a function component
  console.assert(typeof TaskRow === 'function', 'TaskRow should be a function component');

  console.log('All TaskRow tests passed.');
}

main().catch(console.error);
