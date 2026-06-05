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
  stateFlags: Record<string, boolean>; // tracks puzzle progress (e.g. cave_illuminated, lake_unlocked, passage_unlocked)
}

// Initial game world setup
export const createInitialGameState = (): GameState => {
  // Define items
  const items: Record<string, Item> = {
    map: {
      id: 'map',
      name: 'Torn Map',
      description: 'A partially destroyed map showing some connections between locations. It marks the Forest Clearing, a cave to the north, and a cabin to the east, with hints of more places beyond.',
      properties: { usable: false }
    },
    key: {
      id: 'key',
      name: 'Rusty Key',
      description: 'An old iron key, caked with rust but still sturdy. It might open locked doors.',
      properties: { usable: true }
    },
    lantern: {
      id: 'lantern',
      name: 'Brass Lantern',
      description: 'A well-crafted brass lantern with a glass chimney. It\'s unlit but functional.',
      properties: { usable: true, lightSource: true }
    },
    ancient_coin: {
      id: 'ancient_coin',
      name: 'Ancient Coin',
      description: 'A tarnished gold coin bearing the profile of a forgotten king. It feels warm to the touch, as if imbued with residual magic.',
      properties: { usable: false }
    },
    crystal_gem: {
      id: 'crystal_gem',
      name: 'Crystal Gem',
      description: 'A faceted crystal gem that catches the light and refracts it into tiny rainbows. It hums faintly with latent energy.',
      properties: { usable: true, combinable: true }
    },
    silver_amulet: {
      id: 'silver_amulet',
      name: 'Silver Amulet',
      description: 'A beautiful silver amulet on a chain. The intricate metalwork depicts a tree with roots reaching deep underground. There\'s an empty setting in the center, as if a gem is missing.',
      properties: { usable: true, combinable: true }
    },
    gemmed_amulet: {
      id: 'gemmed_amulet',
      name: 'Gemmed Amulet',
      description: 'The silver amulet now gleams with an embedded crystal gem at its center, pulsing with warm, ancient light.',
      properties: { usable: true, isCombined: true }
    }
  };

  // Define rooms
  const rooms: Record<string, Room> = {
    start: {
      id: 'start',
      name: 'Forest Clearing',
      description: 'You stand in a peaceful forest clearing. Sunlight dapples the mossy ground through the ancient oaks above. The air smells of earth and wildflowers. A well-worn path leads north toward a dark cave entrance, while an old cabin sits to the east.',
      connections: { north: 'cave', east: 'cabin' },
      items: ['map']
    },
    cave: {
      id: 'cave',
      name: 'Dark Cave',
      description: 'The darkness here is nearly absolute. Damp air carries the sound of dripping water from deeper within. The cave walls are rough stone, cool to the touch. A faint draft suggests there\'s more to the west, but you can\'t see without light. Faint carvings are barely visible on the walls.',
      connections: { south: 'start', west: 'underground_lake' },
      items: ['lantern']
    },
    cabin: {
      id: 'cabin',
      name: 'Old Cabin',
      description: 'A humble hunter\'s cabin long abandoned. Dust motes float in the thin light piercing through cracked window panes. A sturdy table sits in the center covered in odds and ends. A path leads west back to the clearing, and a small garden trail leads north.',
      connections: { west: 'start', north: 'garden' },
      items: ['key']
    },
    garden: {
      id: 'garden',
      name: 'Enchanted Garden',
      description: 'A walled garden overtaken by wild, magical flora. Luminescent flowers sway gently despite no breeze, and a marble fountain gurgles with crystal-clear water that seems to glow from within. Weathered stone walls are covered in climbing roses. A path leads east toward crumbling stone structures visible through a gap in the wall.',
      connections: { south: 'cabin', east: 'ruins' },
      items: ['ancient_coin']
    },
    ruins: {
      id: 'ruins',
      name: 'Abandoned Ruins',
      description: 'Ancient stone ruins of what was once a temple or observatory. Broken pillars reach toward the sky like skeletal fingers against the canopy. The floor is paved with cracked flagstones bearing strange symbols carved into the surviving walls. Something glints among the rubble in the far corner.',
      connections: { west: 'garden' },
      items: ['crystal_gem']
    },
    underground_lake: {
      id: 'underground_lake',
      name: 'Underground Lake',
      description: 'A vast underground lake stretches before you, its still water reflecting the faint bioluminescent glow of strange fungi growing on the cavern ceiling. The air is cool and damp. A stone pier juts into the dark water. To the north, a heavy iron gate is set into the rock face.',
      connections: { east: 'cave', north: 'sealed_passage' },
      items: ['silver_amulet']
    },
    sealed_passage: {
      id: 'sealed_passage',
      name: 'Sealed Passage',
      description: 'A narrow stone corridor recently revealed. The walls are lined with ancient murals depicting a treasure of great power. Dust hangs in the air, disturbed for the first time in centuries. At the east end stands a massive stone door with a circular indentation at its centre, as if awaiting a key of some kind.',
      connections: { south: 'underground_lake', east: 'treasure' },
      items: []
    },
    treasure: {
      id: 'treasure',
      name: 'Treasure Chamber',
      description: 'A small chamber filled with glittering treasure! Gold coins and precious gems spill from an old chest in the centre of the room, casting dancing reflections across the walls. This is the goal of your adventure — you have truly found the lost treasure!',
      connections: { west: 'sealed_passage' },
      items: []
    }
  };

  return {
    currentLocation: 'start',
    inventory: [],
    visitedRooms: new Set(['start']),
    rooms,
    items,
    stateFlags: {
      cave_illuminated: false,
      lake_unlocked: false,
      passage_unlocked: false
    }
  };
};