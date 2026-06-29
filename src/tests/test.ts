import { gameEngine, GameEngine } from './engine';

let allPassed = true;
let testCount = 0;
let passCount = 0;

function assert(condition: boolean, label: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✅ ${label}`);
  } else {
    allPassed = false;
    console.log(`  ❌ ${label}`);
  }
}

function assertMessageContains(actual: string, expected: string, label: string) {
  assert(actual.includes(expected), `${label} (got: "${actual}")`);
}

// ===========================================================
// We need a fresh engine per test run so state carries forward
// ===========================================================
function makeEngine(): GameEngine {
  return new GameEngine();
}

console.log('=== Phase 3: Enhanced Gameplay Tests ===\n');

// -----------------------------------------------------------
// Test 1: World expansion — 8 rooms
// -----------------------------------------------------------
console.log('1. World Layout (8 rooms):');
{
  const engine = makeEngine();
  const state = engine.getState();
  const roomIds = Object.keys(state.rooms);
  assert(roomIds.length === 8, `Expected 8 rooms, got ${roomIds.length}`);
  const expectedRooms = ['start', 'cave', 'cabin', 'garden', 'ruins', 'underground_lake', 'sealed_passage', 'treasure'];
  expectedRooms.forEach(id => assert(roomIds.includes(id), `Room "${id}" exists`));
}

// -----------------------------------------------------------
// Test 2: Item expansion — 7 items (including combined)
// -----------------------------------------------------------
console.log('\n2. Item Definitions:');
{
  const engine = makeEngine();
  const state = engine.getState();
  const itemIds = Object.keys(state.items);
  assert(itemIds.length === 7, `Expected 7 item definitions, got ${itemIds.length}`);
  const expectedItems = ['map', 'key', 'lantern', 'ancient_coin', 'crystal_gem', 'silver_amulet', 'gemmed_amulet'];
  expectedItems.forEach(id => assert(itemIds.includes(id), `Item "${id}" defined`));
}

// -----------------------------------------------------------
// Test 3: Navigation — basic movement the full path
// -----------------------------------------------------------
console.log('\n3. Navigation:');
{
  const engine = makeEngine();
  const state = engine.getState();
  assert(state.currentLocation === 'start', 'Starts in clearing');

  // Go north to cave
  let r = engine.move('north');
  assert(r.success === true, 'Can move north to cave');
  assert(r.roomId === 'cave', 'Arrived at cave');

  // Go south back to start
  r = engine.move('south');
  assert(r.success === true, 'Can move south to start');
  assert(r.roomId === 'start', 'Back at start');

  // Go east to cabin
  r = engine.move('east');
  assert(r.success === true, 'Can move east to cabin');
  assert(r.roomId === 'cabin', 'Arrived at cabin');

  // Invalid direction
  r = engine.move('south');
  assert(r.success === false, 'Cannot go south from cabin');
  assertMessageContains(r.message, 'cannot go south', 'Shows blocked message');
}

// -----------------------------------------------------------
// Test 4: Take items from rooms
// -----------------------------------------------------------
console.log('\n4. Item Collection:');
{
  const engine = makeEngine();
  // Start has map
  let r = engine.takeItem('map');
  assert(r.success === true, 'Can take map from start');
  let inv = engine.showInventory();
  assert(inv.inventory.length === 1, 'Inventory has 1 item');

  // Can't take twice
  r = engine.takeItem('map');
  assert(r.success === false, 'Cannot take map again');

  // Move to cave and take lantern
  engine.move('north');
  r = engine.takeItem('lantern');
  assert(r.success === true, 'Can take lantern from cave');

  // Move to cabin and take key
  engine.move('south');
  engine.move('east');
  r = engine.takeItem('key');
  assert(r.success === true, 'Can take key from cabin');
}

// -----------------------------------------------------------
// Test 5: Puzzle — Cave illumination
// -----------------------------------------------------------
console.log('\n5. Cave Illumination Puzzle:');
{
  const engine = makeEngine();
  engine.move('north'); // to cave

  // West should be blocked without lantern
  let r = engine.move('west');
  assert(r.success === false, 'Cannot go west in dark cave');
  assertMessageContains(r.message, 'blocked', 'Message says blocked');

  // Take and use lantern
  engine.takeItem('lantern');
  r = engine.useItem('lantern');
  assert(r.success === true, 'Lantern can be used in cave');
  assert(r.effect === 'illuminated_cave', 'Effect is illuminated_cave');

  // Verify state
  const state = engine.getState();
  assert(state.stateFlags.cave_illuminated === true, 'cave_illuminated flag is true');

  // West should now be accessible
  r = engine.move('west');
  assert(r.success === true, 'Can now go west to underground lake');
  assert(r.roomId === 'underground_lake', 'Arrived at underground lake');
}

// -----------------------------------------------------------
// Test 6: Puzzle — Locked gate at underground lake
// -----------------------------------------------------------
console.log('\n6. Locked Gate Puzzle:');
{
  const engine = makeEngine();

  // Get to underground lake (need lantern first)
  engine.move('north');
  engine.takeItem('lantern');
  engine.useItem('lantern');
  engine.move('west'); // underground lake

  // North (gate) is locked
  let r = engine.move('north');
  assert(r.success === false, 'Cannot go north through locked gate');

  // Need to go get the key — go back
  engine.move('east'); // cave
  engine.move('south'); // start
  engine.move('east'); // cabin
  engine.takeItem('key');

  // Back to underground lake
  engine.move('west'); // start
  engine.move('north'); // cave
  engine.move('west'); // underground lake

  // Use key on gate
  r = engine.useItem('key');
  assert(r.success === true, 'Key can be used at underground lake');
  assert(r.effect === 'unlock_gate', 'Effect is unlock_gate');
  assert(engine.getState().stateFlags.lake_unlocked === true, 'lake_unlocked flag is true');

  // Gate should now be open
  r = engine.move('north');
  assert(r.success === true, 'Can now go north through gate');
  assert(r.roomId === 'sealed_passage', 'Arrived at sealed passage');
}

// -----------------------------------------------------------
// Test 7: Item combination — Crystal Gem + Silver Amulet
// -----------------------------------------------------------
console.log('\n7. Item Combination (Crystal Gem + Silver Amulet):');
{
  const engine = makeEngine();

  // Navigate to get crystal gem (start -> east -> north -> east)
  engine.move('east');  // cabin
  engine.move('north'); // garden
  engine.takeItem('ancient_coin');
  engine.move('east');  // ruins
  engine.takeItem('crystal_gem');
  assert(engine.getState().inventory.includes('crystal_gem'), 'Has crystal gem');

  // Now need silver amulet — head back to underground lake
  engine.move('west');  // garden
  engine.move('south'); // cabin
  engine.move('west');  // start
  engine.move('north'); // cave
  // Need lantern to see west
  engine.takeItem('lantern');
  engine.useItem('lantern');
  engine.move('west');  // underground lake
  engine.takeItem('silver_amulet');
  assert(engine.getState().inventory.includes('silver_amulet'), 'Has silver amulet');

  // Combine them
  let r = engine.combineItems('crystal_gem', 'silver_amulet');
  assert(r.success === true, 'Combine succeeds');
  assert(r.resultItem === 'gemmed_amulet', 'Created gemmed_amulet');
  assert(engine.getState().inventory.includes('gemmed_amulet'), 'Inventory has gemmed_amulet');
  assert(!engine.getState().inventory.includes('crystal_gem'), 'Crystal gem removed from inventory');
  assert(!engine.getState().inventory.includes('silver_amulet'), 'Silver amulet removed from inventory');

  // Try invalid combination
  r = engine.combineItems('lantern', 'key');
  assert(r.success === false, 'Invalid combination fails');
}

// -----------------------------------------------------------
// Test 8: Puzzle — Sealed Passage stone door
// -----------------------------------------------------------
console.log('\n8. Sealed Passage Stone Door:');
{
  const engine = makeEngine();

  // Full long path to get everything
  // Start -> cabin -> garden -> ruins (get gem)
  engine.move('east');
  engine.move('north');
  engine.move('east');
  engine.takeItem('crystal_gem');

  // ruins -> garden -> cabin -> start -> cave (get lantern)
  engine.move('west');
  engine.move('south');
  engine.move('west');
  engine.move('north');
  engine.takeItem('lantern');
  engine.useItem('lantern');

  // cave -> underground lake (get amulet)
  engine.move('west');
  engine.takeItem('silver_amulet');

  // Combine amulet + gem
  let r = engine.combineItems('crystal_gem', 'silver_amulet');
  assert(r.success === true, 'Combined gem + amulet');

  // Need key too — back to cabin
  engine.move('east'); // cave
  engine.move('south'); // start
  engine.move('east'); // cabin
  engine.takeItem('key');

  // Back to underground lake
  engine.move('west'); // start
  engine.move('north'); // cave
  engine.move('west'); // underground lake

  // Unlock gate with key
  r = engine.useItem('key');
  assert(r.success === true, 'Unlocked gate with key');

  // Enter sealed passage
  engine.move('north');
  assert(engine.getState().currentLocation === 'sealed_passage', 'In sealed passage');

  // East should be blocked
  r = engine.move('east');
  assert(r.success === false, 'Cannot go east without amulet');

  // Use amulet to open stone door
  r = engine.useItem('gemmed_amulet');
  assert(r.success === true, 'Gemmed amulet opens stone door');
  assert(r.effect === 'unlock_passage', 'Effect is unlock_passage');
  assert(engine.getState().stateFlags.passage_unlocked === true, 'passage_unlocked flag is true');

  // Now can enter treasure
  r = engine.move('east');
  assert(r.success === true, 'Can enter treasure chamber');
  assert(r.roomId === 'treasure', 'Arrived at treasure');
  assert(engine.checkWinCondition() === true, 'Win condition met!');
}

// -----------------------------------------------------------
// Test 9: Look shows dynamic exits based on puzzle state
// -----------------------------------------------------------
console.log('\n9. Dynamic Look Behavior:');
{
  const engine = makeEngine();
  engine.move('north'); // cave (dark)

  let look = engine.look();
  const exitsDark = look.exits as string[];
  assert(exitsDark.includes('south'), 'Dark cave shows south exit');
  assert(!exitsDark.includes('west'), 'Dark cave hides west exit');

  engine.takeItem('lantern');
  engine.useItem('lantern');
  look = engine.look();
  const exitsLit = look.exits as string[];
  assert(exitsLit.includes('west'), 'Lit cave shows west exit');
  assertMessageContains(look.message, 'well-lit', 'Look message reflects illumination');
}

// -----------------------------------------------------------
// Test 10: Examine provides puzzle hints
// -----------------------------------------------------------
console.log('\n10. Examine Hints:');
{
  const engine = makeEngine();
  engine.takeItem('map');

  let r = engine.examineItem('map');
  assert(r.success === true, 'Can examine map');
  assertMessageContains(r.message, 'cave system', 'Map hint mentions cave system');

  // Get crystal gem
  engine.move('east');
  engine.move('north');
  engine.move('east');
  engine.takeItem('crystal_gem');
  r = engine.examineItem('crystal_gem');
  assertMessageContains(r.message, 'setting', 'Gem hint mentions setting');

  // Get silver amulet
  engine.move('west');
  engine.move('south');
  engine.move('west');
  engine.move('north');
  engine.takeItem('lantern');
  engine.useItem('lantern');
  engine.move('west');
  engine.takeItem('silver_amulet');
  r = engine.examineItem('silver_amulet');
  assertMessageContains(r.message, 'gemstone', 'Amulet hint mentions gem');

  // After combine, examine gemmed amulet
  engine.combineItems('crystal_gem', 'silver_amulet');
  r = engine.examineItem('gemmed_amulet');
  assertMessageContains(r.message, 'carvings', 'Gemmed amulet hint mentions carvings');
}

// -----------------------------------------------------------
// Test 11: Item usage in wrong location
// -----------------------------------------------------------
console.log('\n11. Contextual Item Use:');
{
  const engine = makeEngine();

  // Key in start location (no effect)
  engine.move('east');
  engine.takeItem('key');
  let r = engine.useItem('key');
  assert(r.success === false, 'Key use in wrong location fails');
  assertMessageContains(r.message, 'none of them fit', 'Key message says no fit');

  // Lantern in start (neutral location)
  engine.move('west');
  engine.move('north');
  engine.takeItem('lantern');
  engine.move('south'); // back to start — neutral location for testing
  r = engine.useItem('lantern');
  assert(r.success === true, 'Lantern can be used anywhere');
  // It should say nothing special outside cave
  assertMessageContains(r.message, 'nothing special', 'Lantern elsewhere has generic message');
}

// -----------------------------------------------------------
// Test 12: Coin offering
// -----------------------------------------------------------
console.log('\n12. Ancient Coin Optional Interaction:');
{
  const engine = makeEngine();
  engine.move('east');
  engine.move('north');
  engine.takeItem('ancient_coin');
  // Need to get to underground lake
  engine.move('south');
  engine.move('west');
  engine.move('north');
  engine.takeItem('lantern');
  engine.useItem('lantern');
  engine.move('west');
  let r = engine.useItem('ancient_coin');
  assert(r.success === true, 'Coin can be used at lake');
  assert(r.effect === 'coin_offering', 'Coin offering effect triggers');
}

// -----------------------------------------------------------
// Test 13: visitedRooms tracking
// -----------------------------------------------------------
console.log('\n13. Visited Room Tracking:');
{
  const engine = makeEngine();
  let state = engine.getState();
  assert(state.visitedRooms.size === 1, 'Only start visited initially');
  assert(state.visitedRooms.has('start'), 'Start is in visited set');

  engine.move('north');
  state = engine.getState();
  assert(state.visitedRooms.size === 2, '2 rooms visited after moving');
  assert(state.visitedRooms.has('cave'), 'Cave is in visited set');

  engine.move('south');
  state = engine.getState();
  assert(state.visitedRooms.size === 2, 'Still 2 rooms (no new room)');
}

// -----------------------------------------------------------
// Test 14: Help includes the combine command
// -----------------------------------------------------------
console.log('\n14. Help Includes Combine:');
{
  const engine = makeEngine();
  const r = engine.help();
  assertMessageContains(r.message, 'combine', 'Help mentions combine command');
}

// -----------------------------------------------------------
// Summary
// -----------------------------------------------------------
console.log(`\n=== Results: ${passCount}/${testCount} tests passed ===`);
if (!allPassed) {
  console.log('Some tests FAILED!');
  process.exit(1);
} else {
  console.log('All tests passed! ✅');
}