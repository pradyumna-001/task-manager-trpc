import TaskListPage from './page';

async function main() {
  // Test 1: page exports a default component
  console.assert(typeof TaskListPage === 'function', 'TaskListPage should be a function component');

  // Test 2: page renders a heading
  const result = TaskListPage();
  console.assert(result !== null, 'TaskListPage should return JSX');
  console.assert(result.type === 'main', 'Should render a main element');

  console.log('All task list page tests passed.');
}

main().catch(console.error);
