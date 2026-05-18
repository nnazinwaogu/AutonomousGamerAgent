import { runAgent } from './agent/agent';

// Entry point for the game agent
async function main() {
  try {
    await runAgent();
  } catch (error) {
    console.error('An error occurred while running the agent:');
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main().then(() => {
  console.log('\nAgent execution completed.');
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});