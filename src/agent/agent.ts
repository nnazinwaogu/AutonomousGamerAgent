import { OpenRouter } from '@openrouter/agent';
import { tool, stepCountIs, maxCost } from '@openrouter/agent';
import { z } from 'zod';
import { gameEngine } from '../game/engine';

// Create OpenRouter instance (in a real app, you'd get API key from env)
require('dotenv').config();
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Base instructions for the agent
const baseInstructions = `You are an AI agent playing a text-based adventure game called "Explorer's Quest".
Your goal is to explore the world, collect items, solve puzzles, and reach the treasure chamber.

You will receive information about your surroundings through tool results. Use this information
to make decisions about what actions to take next.

Available actions you can take:
- Move between rooms using the move tool (directions: north, south, east, west)
- Take items from rooms using the take_item tool
- Examine items in your inventory or room using the examine_item tool
- Check what you're carrying using the inventory tool
- Look at your current surroundings using the look tool
- Use items from your inventory using the use_item tool
- Combine two items together using the combine_items tool
- Get help using the help tool

You MUST use the available tools to interact with the game world to progress and win.
Think of each tool as an action you can take in the game.

IMPORTANT: To combine items, use the combine_items tool with the two item names (item IDs, not the display names). The item IDs are: map, key, lantern, ancient_coin, crystal_gem, silver_amulet.

THE WORLD:
You start in a Forest Clearing. To the north is a Dark Cave, to the east is an Old Cabin.
- The Old Cabin has a garden to its north, which leads east to ancient Ruins.
- The Dark Cave connects to an Underground Lake to the west.
- Beyond the Underground Lake is a Sealed Passage leading to the Treasure Chamber.

PUZZLES TO SOLVE:
1. The cave is too dark to explore — you'll need to light the Brass Lantern to see the western passage.
2. The Underground Lake has a locked iron gate — the Rusty Key will unlock it.
3. There is a Sealed Passage with a stone door that requires the Gemmed Amulet to open.
4. To make the Gemmed Amulet, you must combine the Crystal Gem with the Silver Amulet using the combine tool.

Think step-by-step about your goals and what actions will help you achieve them.
Try to explore systematically and remember what you've seen in each room.
The ultimate goal is to reach the Treasure Chamber.`;

// Define game-specific tools for the agent

// Move tool: Handle navigation between rooms
export const moveTool = tool({
  name: 'move',
  description: 'Move to a connected room in the specified direction',
  inputSchema: z.object({
    direction: z.enum(['north', 'south', 'east', 'west']).describe('Direction to move'),
  }),
  execute: async ({ direction }) => {
    const result = gameEngine.move(direction);
    return {
      success: result.success,
      message: result.message,
      ...(result.roomId && { roomId: result.roomId }),
      ...(result.roomName && { roomName: result.roomName })
    };
  },
});

// Take item tool: Handle item collection
export const takeItemTool = tool({
  name: 'take_item',
  description: 'Take an item from the current room',
  inputSchema: z.object({
    itemName: z.string().describe('Name of item to take'),
  }),
  execute: async ({ itemName }) => {
    const result = gameEngine.takeItem(itemName);
    return {
      success: result.success,
      message: result.message,
      ...(result.itemId && { itemId: result.itemId }),
      ...(result.itemName && { itemName: result.itemName })
    };
  },
});

// Examine item tool: Provide item descriptions
export const examineItemTool = tool({
  name: 'examine_item',
  description: 'Examine an item in your inventory or the current room',
  inputSchema: z.object({
    itemName: z.string().describe('Name of item to examine'),
  }),
  execute: async ({ itemName }) => {
    const result = gameEngine.examineItem(itemName);
    return {
      success: result.success,
      message: result.message,
      ...(result.itemId && { itemId: result.itemId }),
      ...(result.itemName && { itemName: result.itemName }),
      ...(result.location && { location: result.location })
    };
  },
});

// Inventory tool: Show current inventory
export const inventoryTool = tool({
  name: 'inventory',
  description: 'Show what items you are currently carrying',
  inputSchema: z.object({}),
  execute: async () => {
    const result = gameEngine.showInventory();
    return {
      success: result.success,
      message: result.message,
      inventory: result.inventory,
      itemDetails: result.itemDetails
    };
  },
});

// Look tool: Describe current location
export const lookTool = tool({
  name: 'look',
  description: 'Get a description of your current location',
  inputSchema: z.object({}),
  execute: async () => {
    const result = gameEngine.look();
    return {
      success: result.success,
      message: result.message,
      ...(result.roomId && { roomId: result.roomId }),
      ...(result.roomName && { roomName: result.roomName }),
      ...(result.roomDescription && { roomDescription: result.roomDescription }),
      ...(result.exits && { exits: result.exits }),
      ...(result.itemsHere && { itemsHere: result.itemsHere })
    };
  },
});

// Use item tool: Handle item usage (for puzzles)
export const useItemTool = tool({
  name: 'use_item',
  description: 'Use an item from your inventory',
  inputSchema: z.object({
    itemName: z.string().describe('Name of item to use'),
  }),
  execute: async ({ itemName }) => {
    const result = gameEngine.useItem(itemName);
    return {
      success: result.success,
      message: result.message,
      ...(result.itemId && { itemId: result.itemId }),
      ...(result.itemName && { itemName: result.itemName }),
      ...(result.effect && { effect: result.effect })
    };
  },
});

// Combine items tool: Combine two items
export const combineItemsTool = tool({
  name: 'combine_items',
  description: 'Combine two items together to create a new item',
  inputSchema: z.object({
    item1: z.string().describe('Name of the first item to combine'),
    item2: z.string().describe('Name of the second item to combine'),
  }),
  execute: async ({ item1, item2 }) => {
    const result = gameEngine.combineItems(item1, item2);
    return {
      success: result.success,
      message: result.message,
      ...(result.resultItem && { resultItem: result.resultItem }),
      ...(result.resultItemName && { resultItemName: result.resultItemName })
    };
  },
});

// Help tool: Show available commands
export const helpTool = tool({
  name: 'help',
  description: 'Show available commands and their descriptions',
  inputSchema: z.object({}),
  execute: async () => {
    const result = gameEngine.help();
    return {
      success: result.success,
      message: result.message
    };
  }
});

// Agent configuration
export const agentConfig = {
  model: 'nvidia/nemotron-3-super-120b-a12b:free', // Using a capable model for reasoning
  messages: [
    {
      role: 'system',
      content: baseInstructions
    }
  ],
  tools: [
    moveTool,
    takeItemTool,
    examineItemTool,
    inventoryTool,
    lookTool,
    useItemTool,
    combineItemsTool,
    helpTool
  ],
  stopWhen: [
    stepCountIs(50), // Prevent infinite loops
    maxCost(0.50)    // Limit cost to reasonable amount
  ],
};

// Function to run the agent
export const runAgent = async () => {
  console.log('Starting Explorer\'s Quest AI Agent...');
  console.log('='.repeat(50));

  const result = openrouter.callModel({
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
    instructions: `${baseInstructions}`,
    input: [],
    tools: agentConfig.tools,
    stopWhen: agentConfig.stopWhen
  });

  // Instrument execution timing — wrapped around getResponse() which
  // is where the actual multi-turn agent loop runs (callModel is synchronous)
  const startTime = process.hrtime.bigint();

  // Track tool calls across ALL agent turns via items stream
  let totalToolCalls = 0;
  const toolUsage = {} as Record<string, number>;
  for await (const item of result.getItemsStream()) {
    if (item.type === 'function_call') {
      totalToolCalls++;
      toolUsage[item.name] = (toolUsage[item.name] || 0) + 1;
    }
  }

  // Get response data (cached from agent loop that ran during items stream)
  const response = await result.getResponse();
  const endTime = process.hrtime.bigint();
  const durationSec = Number(endTime - startTime) / 1_000_000_000;
  const usage = response.usage;
  const responseText = await result.getText();

   // Use SDK-provided cost when available

  console.log('\nAgent Response:');
  console.log(responseText);

  // Display telemetry report
  console.log('\n=== Telemetry Report ===');
  console.log(`Execution Time: ${durationSec.toFixed(2)}s`);
  console.log(`Total Tool Calls: ${totalToolCalls}`);
  if (usage) {
    console.log(`Token Usage: ${usage.inputTokens.toLocaleString()} input, ${usage.outputTokens.toLocaleString()} output (${usage.totalTokens.toLocaleString()} total)`);
    const displayCost = usage.cost != null ? `$${usage.cost.toFixed(6)}` : 'N/A';
    console.log(`Cost: ${displayCost}`);
  } else {
    console.log('Token Usage: N/A');
    console.log('Cost: N/A');
  }
  console.log('Tool Usage:');
  if (Object.keys(toolUsage).length === 0) {
    console.log('  No tool calls recorded');
  } else {
    Object.entries(toolUsage).forEach(([tool, count]) => {
      console.log(`  ${tool}: ${count}`);
    });
  }

  // Check if we won
  const state = gameEngine.getState();
  if (state.currentLocation === 'treasure') {
    console.log('\n🎉 VICTORY! You have reached the Treasure Chamber! 🎉');
    console.log('Thanks for playing Explorer\'s Quest!');
  } else {
    console.log(`\nCurrent location: ${state.currentLocation}`);
    console.log('The adventure continues...');
  }

}
  
