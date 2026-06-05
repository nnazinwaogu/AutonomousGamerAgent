import { GameState, createInitialGameState } from './world';

// Define action result interface
interface ActionResult {
  success: boolean;
  message: string;
  [key: string]: any;
}

class GameEngine {
  private state: GameState;

  constructor() {
    this.state = createInitialGameState();
  }

  // Get current game state (read-only)
  getState(): GameState {
    return {
      ...this.state,
      visitedRooms: new Set(this.state.visitedRooms),
      rooms: { ...this.state.rooms },
      items: { ...this.state.items },
      stateFlags: { ...this.state.stateFlags }
    };
  }

  // Check if player has won (reached treasure chamber)
  checkWinCondition(): boolean {
    return this.state.currentLocation === 'treasure';
  }

  // Resolve effective connections for a room, factoring in dynamic state
  private getEffectiveConnections(roomId: string): Record<string, string> {
    const room = this.state.rooms[roomId];
    const base = { ...room.connections };

    // Cave: west only opens when illuminated
    if (roomId === 'cave' && !this.state.stateFlags.cave_illuminated) {
      delete base.west;
    }

    // Underground Lake: north only opens when gate is unlocked
    if (roomId === 'underground_lake' && !this.state.stateFlags.lake_unlocked) {
      delete base.north;
    }

    // Sealed Passage: east only opens when stone door is unlocked
    if (roomId === 'sealed_passage' && !this.state.stateFlags.passage_unlocked) {
      delete base.east;
    }

    return base;
  }

  // Process a move action
  move(direction: string): ActionResult {
    const currentRoom = this.state.rooms[this.state.currentLocation];
    const effectiveConnections = this.getEffectiveConnections(this.state.currentLocation);

    if (!effectiveConnections[direction]) {
      // Provide a more informative message when a path is blocked by a puzzle
      const allConnections = Object.keys(currentRoom.connections);
      if (allConnections.includes(direction)) {
        return {
          success: false,
          message: `You cannot go ${direction} from here — the way is blocked or impassable. You may need to solve a puzzle first.`
        };
      }
      return {
        success: false,
        message: `You cannot go ${direction} from here.`
      };
    }

    const nextRoomId = effectiveConnections[direction];
    const nextRoom = this.state.rooms[nextRoomId];

    if (!nextRoom) {
      return {
        success: false,
        message: `The path to the ${direction} leads nowhere.`
      };
    }

    // Update state
    this.state.visitedRooms.add(nextRoomId);
    this.state.currentLocation = nextRoomId;

    return {
      success: true,
      message: `You move ${direction} and enter the ${nextRoom.name}.`,
      roomId: nextRoomId,
      roomName: nextRoom.name
    };
  }

  // Process taking an item
  takeItem(itemId: string): ActionResult {
    const currentRoom = this.state.rooms[this.state.currentLocation];

    // Check if item exists in current room
    if (!currentRoom.items.includes(itemId)) {
      return {
        success: false,
        message: `There is no ${itemId} here to take.`
      };
    }

    // Check if item exists in our item definitions
    if (!this.state.items[itemId]) {
      return {
        success: false,
        message: `The item ${itemId} doesn't exist in this world.`
      };
    }

    // Remove item from room and add to inventory
    const itemIndex = currentRoom.items.indexOf(itemId);
    if (itemIndex > -1) {
      currentRoom.items.splice(itemIndex, 1);
    }
    this.state.inventory.push(itemId);

    const itemName = this.state.items[itemId].name;
    return {
      success: true,
      message: `You take the ${itemName}.`,
      itemId: itemId,
      itemName: itemName
    };
  }

  // Process examining an item (in inventory or room)
  examineItem(itemId: string): ActionResult {
    // Check if item is in inventory
    if (this.state.inventory.includes(itemId)) {
      const item = this.state.items[itemId];
      let extra = '';
      // Add puzzle hints
      if (itemId === 'map') {
        extra = ' The map suggests the treasure lies deep underground, accessible through the cave system and beyond.';
      }
      if (itemId === 'crystal_gem') {
        extra = ' It looks like it would fit perfectly into some kind of setting or mount.';
      }
      if (itemId === 'silver_amulet') {
        extra = ' The empty setting in the centre seems to be exactly the right size for a gemstone or coin.';
      }
      if (itemId === 'ancient_coin') {
        extra = ' The face of the forgotten king seems to gaze knowingly. Could this be some kind of offering or toll?';
      }
      if (itemId === 'gemmed_amulet') {
        extra = ' The amulet pulses with an otherworldly warmth. Strange symbols along its rim glow faintly — they might match the carvings at the sealed passage.';
      }
      if (itemId === 'lantern' && !this.state.stateFlags.cave_illuminated) {
        extra = ' It is currently unlit.';
      }
      return {
        success: true,
        message: `You examine the ${item.name}: ${item.description}${extra}`,
        itemId: itemId,
        itemName: item.name,
        itemDescription: item.description,
        location: 'inventory'
      };
    }

    // Check if item is in current room
    const currentRoom = this.state.rooms[this.state.currentLocation];
    if (currentRoom.items.includes(itemId)) {
      const item = this.state.items[itemId];
      return {
        success: true,
        message: `You see a ${item.name} here: ${item.description}`,
        itemId: itemId,
        itemName: item.name,
        itemDescription: item.description,
        location: 'room'
      };
    }

    return {
      success: false,
      message: `You don't see a ${itemId} here or in your inventory.`
    };
  }

  // Combine two items
  combineItems(item1Id: string, item2Id: string): ActionResult {
    // Both items must be in inventory
    if (!this.state.inventory.includes(item1Id)) {
      const name = this.state.items[item1Id]?.name || item1Id;
      return { success: false, message: `You don't have ${name} to combine.` };
    }
    if (!this.state.inventory.includes(item2Id)) {
      const name = this.state.items[item2Id]?.name || item2Id;
      return { success: false, message: `You don't have ${name} to combine.` };
    }

    // Crystal gem + Silver amulet = Gemmed Amulet
    if (
      (item1Id === 'crystal_gem' && item2Id === 'silver_amulet') ||
      (item1Id === 'silver_amulet' && item2Id === 'crystal_gem')
    ) {
      // Remove the two components from inventory
      this.state.inventory = this.state.inventory.filter(id => id !== 'crystal_gem' && id !== 'silver_amulet');
      // Add the combined item
      this.state.inventory.push('gemmed_amulet');
      return {
        success: true,
        message: 'You carefully fit the Crystal Gem into the Silver Amulet\'s setting. It clicks into place perfectly, and the amulet begins to pulse with a warm, golden light. You now have a Gemmed Amulet!',
        resultItem: 'gemmed_amulet',
        resultItemName: 'Gemmed Amulet'
      };
    }

    return {
      success: false,
      message: 'Those items cannot be combined.'
    };
  }

  // Process using an item
  useItem(itemId: string): ActionResult {
    // Check if item is in inventory
    if (!this.state.inventory.includes(itemId)) {
      const item = this.state.items[itemId];
      const name = item ? item.name : itemId;
      // Check if it's in the current room
      const currentRoom = this.state.rooms[this.state.currentLocation];
      if (currentRoom.items.includes(itemId)) {
        return {
          success: false,
          message: `You need to take the ${name} first before you can use it.`
        };
      }
      return {
        success: false,
        message: `You don't have a ${name} to use.`
      };
    }

    const item = this.state.items[itemId];

    // --- Lantern in cave ---
    if (itemId === 'lantern' && this.state.currentLocation === 'cave') {
      if (this.state.stateFlags.cave_illuminated) {
        return {
          success: true,
          message: `The lantern is already lit, casting a warm glow throughout the cave. You can now see a passage to the west.`,
          effect: 'already_illuminated'
        };
      }
      this.state.stateFlags.cave_illuminated = true;
      return {
        success: true,
        message: `You light the brass lantern. A warm, steady flame pushes back the darkness, revealing the cave around you. On the western wall, you spot a previously hidden passage leading deeper underground.`,
        itemId: itemId,
        itemName: item.name,
        effect: 'illuminated_cave'
      };
    }

    // --- Rusty Key at underground lake ---
    if (itemId === 'key' && this.state.currentLocation === 'underground_lake') {
      if (this.state.stateFlags.lake_unlocked) {
        return {
          success: true,
          message: `The heavy iron gate is already unlocked.`,
          effect: 'already_unlocked'
        };
      }
      this.state.stateFlags.lake_unlocked = true;
      return {
        success: true,
        message: `You insert the rusty key into the ancient lock of the iron gate. It turns with a heavy clank, and the gate swings open with a groan. A dark passage leads north into the unknown.`,
        itemId: itemId,
        itemName: item.name,
        effect: 'unlock_gate'
      };
    }

    // --- Ancient Coin at underground lake (alternative/optional interaction) ---
    if (itemId === 'ancient_coin' && this.state.currentLocation === 'underground_lake') {
      return {
        success: true,
        message: `You toss the ancient coin into the dark water. It makes a soft plink before disappearing into the depths. For a moment, the bioluminescent fungi pulse brighter, as if acknowledging the offering.`,
        itemId: itemId,
        itemName: item.name,
        effect: 'coin_offering'
      };
    }

    // --- Gemmed Amulet at sealed passage ---
    if (itemId === 'gemmed_amulet' && this.state.currentLocation === 'sealed_passage') {
      if (this.state.stateFlags.passage_unlocked) {
        return {
          success: true,
          message: `The stone door is already open, revealing the treasure chamber beyond.`,
          effect: 'already_open'
        };
      }
      this.state.stateFlags.passage_unlocked = true;
      return {
        success: true,
        message: `You hold the Gemmed Amulet before the circular indentation in the stone door. The amulet's glow intensifies, and the symbols along its rim align perfectly with the carvings on the door. With a deep rumble, the massive stone door slides aside, revealing a chamber glittering with treasure to the east!`,
        itemId: itemId,
        itemName: item.name,
        effect: 'unlock_passage'
      };
    }

    // --- Lantern elsewhere ---
    if (itemId === 'lantern') {
      return {
        success: true,
        message: `You hold the lantern high, but it provides light only in the immediate area. There's nothing special to illuminate here.`,
        itemId: itemId,
        itemName: item.name
      };
    }

    // --- Key elsewhere ---
    if (itemId === 'key') {
      return {
        success: false,
        message: `You try the rusty key in various locks, but none of them fit here.`,
        itemId: itemId,
        itemName: item.name
      };
    }

    // --- Gemmed Amulet elsewhere ---
    if (itemId === 'gemmed_amulet') {
      return {
        success: true,
        message: `The Gemmed Amulet glows warmly in your hands, but nothing happens. It seems to respond only to specific locations.`,
        itemId: itemId,
        itemName: item.name
      };
    }

    // Map Functionality (should default to look())
    if (itemId === 'map') {
      return {
        success: true,
        message: `You unfold the map and study the layout of the area. It shows the locations of various rooms and items, helping you navigate more effectively.`,
        itemId: itemId,
        itemName: item.name,
        look: this.look()
      };
    }

    // Default use response
    return {
      success: true,
      message: `You use the ${item.name}, but nothing special happens.`,
      itemId: itemId,
      itemName: item.name
    };
  }

  // Look at current room
  look(): ActionResult {
    const currentRoom = this.state.rooms[this.state.currentLocation];
    const effectiveConnections = this.getEffectiveConnections(this.state.currentLocation);
    const exits = Object.keys(effectiveConnections).join(', ');
    const itemsHere = currentRoom.items.map((id: string) => this.state.items[id].name).join(', ') || 'nothing of interest';

    let message = `You are in the ${currentRoom.name}.\n`;
    message += `${currentRoom.description}\n`;

    // Add dynamic state info
    if (this.state.currentLocation === 'cave' && this.state.stateFlags.cave_illuminated) {
      message += 'The cave is now well-lit by your lantern. You can see a passage heading west.\n';
    }
    if (this.state.currentLocation === 'underground_lake' && this.state.stateFlags.lake_unlocked) {
      message += 'The iron gate to the north stands open, revealing a passage beyond.\n';
    }
    if (this.state.currentLocation === 'sealed_passage' && this.state.stateFlags.passage_unlocked) {
      message += 'The immense stone door is open to the east, revealing the Treasure Chamber!\n';
    }

    // Add hint if there are items but the player hasn't noticed a puzzle
    if (this.state.currentLocation === 'cave' && currentRoom.items.length > 0 && !this.state.stateFlags.cave_illuminated) {
      message += 'It\'s too dark to see much — you\'ll need a light source to explore further.\n';
    }

    message += `Exits: ${exits}\n`;
    message += `You see: ${itemsHere}`;

    return {
      success: true,
      message: message,
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      roomDescription: currentRoom.description,
      exits: Object.keys(effectiveConnections),
      itemsHere: currentRoom.items
    };
  }

  // Show inventory
  showInventory(): ActionResult {
    if (this.state.inventory.length === 0) {
      return {
        success: true,
        message: 'Your inventory is empty.',
        inventory: [],
        itemDetails: []
      };
    }

    const itemDetails = this.state.inventory.map((itemId: string) => {
      const item = this.state.items[itemId];
      return {
        id: itemId,
        name: item.name,
        description: item.description
      };
    });

    return {
      success: true,
      message: `You are carrying: ${this.state.inventory.map((id: string) => this.state.items[id].name).join(', ')}.`,
      inventory: this.state.inventory,
      itemDetails: itemDetails
    };
  }

  // Help
  help(): ActionResult {
    return {
      success: true,
      message:
        'Available commands:\n' +
        'go [direction] - Move north, south, east, or west\n' +
        'take [item] - Take an item from the current room\n' +
        'examine [item] - Examine an item in your inventory or the room\n' +
        'use [item] - Use an item from your inventory\n' +
        'combine [item1] [item2] - Combine two items together\n' +
        'inventory - Show what you\'re carrying\n' +
        'look - Describe your current location\n' +
        'help - Show this help message\n' +
        'quit - Exit the game'
    };
  }
}

// Export a singleton instance
export const gameEngine = new GameEngine();
