import { GameState, createInitialGameState } from './world';

// Define action result interface
interface ActionResult {
  success: boolean;
  message: string;
  // For actions that might change state, we'll return relevant data
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
      visitedRooms: new Set(this.state.visitedRooms), // Copy the Set
      rooms: { ...this.state.rooms }, // Shallow copy of rooms
      items: { ...this.state.items } // Shallow copy of items
    };
  }

  // Check if player has won (reached treasure chamber)
  checkWinCondition(): boolean {
    return this.state.currentLocation === 'treasure';
  }

  // Process a move action
  move(direction: string): ActionResult {
    const currentRoom = this.state.rooms[this.state.currentLocation];
    if (!currentRoom.connections[direction]) {
      return {
        success: false,
        message: `You cannot go ${direction} from here.`
      };
    }

    const nextRoomId = currentRoom.connections[direction];
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
      return {
        success: true,
        message: `You examine the ${item.name}: ${item.description}`,
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

  // Process using an item
  useItem(itemId: string): ActionResult {
    // Check if item is in inventory
    if (!this.state.inventory.includes(itemId)) {
      return {
        success: false,
        message: `You don't have a ${itemId} to use.`
      };
    }

    const item = this.state.items[itemId];
    
    // Handle specific item uses
    if (itemId === 'lantern' && this.state.currentLocation === 'cave') {
      return {
        success: true,
        message: `You light the brass lantern. The cave is now illuminated, revealing more details of the rocky walls.`,
        itemId: itemId,
        itemName: item.name,
        effect: 'illuminated_cave'
      };
    }
    
    if (itemId === 'key' && this.state.currentLocation === 'cave') {
      // Check if we're trying to use key on something specific
      // For simplicity, let's say the key opens a path in the cave when used
      return {
        success: true,
        message: `You use the rusty key to unlock a sealed passage in the cave. A new path opens to the west!`,
        itemId: itemId,
        itemName: item.name,
        effect: 'unlock_passage'
        // Note: In a more complex implementation, we'd modify the room connections here
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

  // Get current room description
  look(): ActionResult {
    const currentRoom = this.state.rooms[this.state.currentLocation];
    const exits = Object.keys(currentRoom.connections).join(', ');
    const itemsHere = currentRoom.items.map((id: string) => this.state.items[id].name).join(', ') || 'nothing';
    
    let message = `You are in the ${currentRoom.name}.\n`;
    message += `${currentRoom.description}\n`;
    message += `Exits: ${exits}\n`;
    message += `You see: ${itemsHere}`;
    
    return {
      success: true,
      message: message,
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      roomDescription: currentRoom.description,
      exits: Object.keys(currentRoom.connections),
      itemsHere: currentRoom.items
    };
  }

  // Show inventory
  showInventory(): ActionResult {
    if (this.state.inventory.length === 0) {
      return {
        success: true,
        message: `Your inventory is empty.`,
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

  // Process a help command
  help(): ActionResult {
    return {
      success: true,
      message: `Available commands:\n` +
               `go [direction] - Move north, south, east, or west\n` +
               `take [item] - Take an item from the current room\n` +
               `examine [item] - Examine an item in your inventory or the room\n` +
               `use [item] - Use an item from your inventory\n` +
               `inventory - Show what you're carrying\n` +
               `look - Describe your current location\n` +
               `help - Show this help message\n` +
               `quit - Exit the game`
    };
  }
}

// Export a singleton instance for simplicity in this early phase
export const gameEngine = new GameEngine();

// Also export the class for potential multiple instances
export { GameEngine };