import EditTaskPage from './page';

async function main() {
  // Test 1: page exports a default component
  console.assert(typeof EditTaskPage === 'function', 'EditTaskPage should be a function component');

  console.log('All edit page tests passed.');
}

main().catch(console.error);
