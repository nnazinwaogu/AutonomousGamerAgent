import { gameEngine } from './engine';

// Simple test to verify game engine functionality
console.log('=== Game Engine Test ===\n');

// Test initial state
console.log('1. Initial state:');
const initialState = gameEngine.getState();
console.log(`   Current location: ${initialState.currentLocation}`);
console.log(`   Inventory: ${initialState.inventory.join(', ') || 'empty'}`);
console.log(`   Visited rooms: ${Array.from(initialState.visitedRooms).join(', ')}\n`);

// Test look command
console.log('2. Looking around:');
const lookResult = gameEngine.look();
console.log(`   Success: ${lookResult.success}`);
console.log(`   Message:\n${lookResult.message}\n`);

// Test taking an item
console.log('3. Taking the map:');
const takeMapResult = gameEngine.takeItem('map');
console.log(`   Success: ${takeMapResult.success}`);
console.log(`   Message: ${takeMapResult.message}\n`);

// Check inventory after taking
console.log('4. Inventory after taking map:');
const inventoryResult = gameEngine.showInventory();
console.log(`   Success: ${inventoryResult.success}`);
console.log(`   Message: ${inventoryResult.message}\n`);

// Test moving
console.log('5. Moving north to cave:');
const moveNorthResult = gameEngine.move('north');
console.log(`   Success: ${moveNorthResult.success}`);
console.log(`   Message: ${moveNorthResult.message}\n`);

// Check state after moving
console.log('6. State after moving north:');
const afterMoveState = gameEngine.getState();
console.log(`   Current location: ${afterMoveState.currentLocation}`);
console.log(`   Visited rooms: ${Array.from(afterMoveState.visitedRooms).join(', ')}\n`);

// Test looking in cave
console.log('7. Looking in cave:');
const lookInCave = gameEngine.look();
console.log(`   Success: ${lookInCave.success}`);
console.log(`   Message:\n${lookInCave.message}\n`);

// Test taking lantern
console.log('8. Taking lantern:');
const takeLanternResult = gameEngine.takeItem('lantern');
console.log(`   Success: ${takeLanternResult.success}`);
console.log(`   Message: ${takeLanternResult.message}\n`);

// Check win condition BEFORE moving to treasure
console.log('9. Win condition check (before treasure):');
console.log(`   Has won: ${gameEngine.checkWinCondition()}\n`);

// Test moving west to treasure
console.log('10. Moving west to treasure:');
const moveWestResult = gameEngine.move('west');
console.log(`   Success: ${moveWestResult.success}`);
console.log(`   Message: ${moveWestResult.message}\n`);

// Check win condition AFTER moving to treasure
console.log('11. Win condition check (after treasure):');
console.log(`   Has won: ${gameEngine.checkWinCondition()}\n`);

console.log('=== Test Complete ===');