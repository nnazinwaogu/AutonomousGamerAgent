export interface Room {
  id: string;
  name: string;
  description: string;
  connections: Record<string, string>; // direction -> roomId
  items: string[]; // item IDs present in room
}

export interface Item {
  id: string;
  name: string;
  description: string;
  properties: Record<string, any>; // usable, combinable, etc.
}

export interface GameState {
  currentLocation: string;
  inventory: string[]; // item IDs
  visitedRooms: Set<string>;
  rooms: Record<string, Room>;
  items: Record<string, Item>;
}

// Initial game world setup
export const createInitialGameState = (): GameState => {
  // Define items
  const items: Record<string, Item> = {
    key: {
      id: 'key',
      name: 'Rusty Key',
      description: 'An old iron key that might open locked doors.',
      properties: { usable: true }
    },
    lantern: {
      id: 'lantern',
      name: 'Brass Lantern',
      description: 'A lantern that provides light in dark places.',
      properties: { usable: true, lightSource: true }
    },
    map: {
      id: 'map',
      name: 'Torn Map',
      description: 'A partially destroyed map showing some connections.',
      properties: { usable: false }
    }
  };

  // Define rooms
  const rooms: Record<string, Room> = {
    start: {
      id: 'start',
      name: 'Forest Clearing',
      description: 'You are in a peaceful forest clearing. Sunlight filters through the trees above. To the north, you see a dark cave entrance. To the east, there is an old wooden cabin.',
      connections: { north: 'cave', east: 'cabin' },
      items: ['map']
    },
    cave: {
      id: 'cave',
      name: 'Dark Cave',
      description: 'A dark, damp cave. You can barely see anything without a light source. The cave opens up to the south, and there appears to be a deeper passage to the west.',
      connections: { south: 'start', west: 'treasure' },
      items: ['lantern']
    },
    cabin: {
      id: 'cabin',
      name: 'Old Cabin',
      description: 'A small, abandoned wooden cabin. The door is slightly ajar. Inside, you see a table with various items. There is a path leading west back to the clearing.',
      connections: { west: 'start' },
      items: ['key']
    },
    treasure: {
      id: 'treasure',
      name: 'Treasure Chamber',
      description: 'A small chamber filled with glittering treasure! Gold coins and precious gems spill from an old chest in the center of the room. This is the goal of your adventure.',
      connections: { east: 'cave' },
      items: []
    }
  };

  return {
    currentLocation: 'start',
    inventory: [],
    visitedRooms: new Set(['start']),
    rooms,
    items
  };
};