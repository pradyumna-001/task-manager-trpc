import CreateTaskPage from './page';

async function main() {
  // Test 1: page exports a default component
  console.assert(typeof CreateTaskPage === 'function', 'CreateTaskPage should be a function component');

  console.log('All create page tests passed.');
}

main().catch(console.error);
