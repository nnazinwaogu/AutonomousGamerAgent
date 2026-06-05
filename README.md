# Explorer's Quest: LLM-Driven Game Agent with OpenRouter SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![OpenRouter SDK](https://img.shields.io/badge/OpenRouter-SDK-brightgreen.svg)](https://openrouter.ai/sdk)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [API Key Setup](#api-key-setup)
- [Example Output](#example-output)
- [Technical Details](#technical-details)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview
Explorer's Quest is a text-based adventure game agent built using the OpenRouter Agent SDK. The agent autonomously explores a game world, collects items, solves simple puzzles, and reaches the treasure chamber goal—all powered by LLM-driven decision making.

This project demonstrates:
- Tool-based agent architecture (recommended OpenRouter SDK pattern)
- Automatic multi-turn execution loops
- Conversation state management
- Separation of game logic from agent decision-making
- Integration with open-source LLM models via OpenRouter


## Features
- 🗺️ Expansive world: 8 interconnected rooms with distinct themes and narrative descriptions
- 🎒 Inventory system for collecting, examining, and using items
- 🧩 3 sequential puzzles with conditional room access (illumination, locked gate, stone door)
- 🔗 Item combination system: combine two items to create a new one (Crystal Gem + Silver Amulet → Gemmed Amulet)
- 🤖 Autonomous LLM-driven agent using OpenRouter SDK
- 🔧 Tool-based architecture with 8 tools and Zod schema validation
- 📊 Configurable stop conditions (50 step limit, $0.50 cost ceiling)
- 📝 Dynamic room descriptions that reflect puzzle state and solved progress
- 📈 Built-in telemetry: execution time, tool call counts, token consumption, and cost
- 🏆 Clear win condition and victory celebration

## Project Structure
```
game-agent/
├── misc/                   # Planning and specification documents
├── src/
│   ├── game/               # Game engine and world model
│   │   ├── engine.ts       # Core game loop, puzzle state, and action processing
│   │   ├── world.ts        # Room, item, and world definitions (8 rooms, 7 items)
│   │   └── test.ts         # 83 verification tests
│   ├── agent/              # OpenRouter Agent SDK integration
│   │   └── agent.ts        # Agent configuration, 8 tool definitions, telemetry
│   └── main.ts             # Entry point - connects game and agent
├── .gitignore
├── .env                    # Environment variables (API key, excluded from git)
├── AGENTS.md               # Development instructions for agentic coding
├── CHANGELOG.md            # Version history
├── CLAUDE.md               # Claude Code project guidance
├── package.json
├── tsconfig.json
└── README.md               # This file
```

## Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd game-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Ensure your `.env` file contains: `OPENROUTER_API_KEY=your-api-key-here`
   - Get your API key from [OpenRouter.ai](https://openrouter.ai/settings/keys)
   - The dotenv package is included to automatically load variables from `.env`

## Usage
To run the agent:
```bash
npx ts-node src/main.ts
```

The agent will:
1. Start in the Forest Clearing with the Torn Map
2. Explore 8 interconnected rooms, discovering items and locations
3. Collect necessary items (lantern, key, crystal gem, silver amulet, ancient coin)
4. Combine the Crystal Gem and Silver Amulet to create the Gemmed Amulet
5. Solve 3 sequential puzzles: illuminate the dark cave, unlock the gate at the underground lake, and open the sealed passage with the gemmed amulet
6. Reach the Treasure Chamber and declare victory
7. Terminate via success condition or stop limits

## How It Works
### Game Engine
- Custom TypeScript implementation managing game state
- Room-based world with connections, items, and descriptions
- Action processing for movement, item interaction, and usage
- Win condition detection (reaching treasure chamber)

### OpenRouter Agent SDK Integration
- **Tool-Based Architecture**: All game actions implemented as SDK tools with Zod validation
  - `moveTool`: Handle navigation between rooms
  - `takeItemTool`: Collect items from current room
  - `examineItemTool`: Inspect items in inventory or room
  - `inventoryTool`: Show currently carried items
  - `lookTool`: Describe current location and contents (reflects puzzle state dynamically)
  - `useItemTool`: Handle special item effects (lantern illuminates cave, key unlocks gate, gemmed amulet opens passage)
  - `combineItemsTool`: Combine two items to create a new item (Crystal Gem + Silver Amulet → Gemmed Amulet)
  - `helpTool`: Display available commands
- **Agent Configuration**: 
  - System prompt defining goals and available actions
  - Stop conditions: 50 step limit, $0.50 cost ceiling
  - Proper input/instructions format for SDK compatibility
- **Execution Flow**: 
  - SDK's `callModel` handles automatic multi-turn loops
  - LLM decides which tool to call based on current context
  - SDK executes tool and feeds results back to LLM
  - Process repeats until goal reached or stop condition triggered
- **Telemetry Collection**: 
  - Execution timing with process.hrtime.bigint() for precision (displayed in seconds)
  - Token usage extracted from SDK response via getResponse(), including SDK-calculated cost
  - Tool usage collected from getItemsStream() tracking function_call items across all turns
  - Cost displayed as SDK-provided actual cost, or N/A when unavailable
  - Automatic reporting displayed after agent completion

### Decision Making Process
1. **Observation**: Agent receives game state through tool results and system prompt
2. **Analysis**: LLM evaluates current situation against goals
3. **Planning**: Agent selects action that progresses toward treasure chamber
4. **Execution**: SDK invokes selected tool to modify game state
5. **Learning**: Tool results update conversation history for next turn
6. **Iteration**: Process continues until victory

## API Key Setup
The agent requires an OpenRouter API key to access LLM models, which should be stored in the `.env` file:

1. Visit [OpenRouter.ai](https://openrouter.ai) and sign up for an account
2. Navigate to [API Keys](https://openrouter.ai/settings/keys) in your account settings
3. Click "Create Key" and give it a descriptive name (e.g., "Explorer's Quest Agent")
4. Copy the generated key (format: `sk-or-v1-...`)
5. Ensure your `.env` file contains: `OPENROUTER_API_KEY=your-actual-key-here`
6. The agent will automatically read this via `process.env.OPENROUTER_API_KEY`

**Important**: Never commit your `.env` file to version control. The `.gitignore` file already excludes it for security.

## Example Output
When the agent successfully completes the Phase 3 adventure with all puzzles solved:

```
Starting Explorer's Quest AI Agent...
==================================================

Agent Response:
Congratulations! You have successfully reached the Treasure Chamber and found the lost treasure. Your adventure is complete.

=== Telemetry Report ===
Execution Time: 330.85s
Total Tool Calls: 114
Token Usage: 6,046 input, 51 output (6,097 total)
Cost: $0.000000
Tool Usage:
  look: 24
  take_item: 18
  inventory: 9
  move: 51
  use_item: 9
  combine_items: 3

🎉 VICTORY! You have reached the Treasure Chamber! 🎉
Thanks for playing Explorer's Quest!

Agent execution completed.
```

The agent explores, backtracks, examines items, and attempts combinations — the 114 tool calls reflect genuine gameplay, not inefficiency. The theoretical minimum is ~15 tools.

## Technical Details
### OpenRouter SDK Usage
- **Package**: `@openrouter/agent` (includes Client SDKs)
- **Primary Method**: `callModel` for automatic multi-turn agent workflows
- **Tools**: Defined with `tool()` helper and Zod schemas for type safety
- **Stop Conditions**: Built-in helpers (`stepCountIs`, `maxCost`)
- **Conversation State**: Automatically managed by SDK (message history, tool results)
- **Model Used**: `nvidia/nemotron-3-super-120b-a12b:free` (NVIDIA's open-source model)

### Telemetry and Monitoring
- **Execution Timing**: High-precision timing using process.hrtime (displayed in seconds)
- **Token Tracking**: Input/output token counts from SDK response
- **Tool Analytics**: Frequency tracking of all agent actions via getItemsStream() across all turns
- **Cost**: SDK-provided actual cost, or N/A when unavailable
- **Tool Call Count**: Accurate counting of individual tool calls (not SDK turns)
- **Automatic Reporting**: Telemetry displayed after each agent run

### Game Mechanics
- **World**: 8 interconnected rooms with distinct themes and narrative descriptions:
  - Forest Clearing (start), Dark Cave, Old Cabin, Enchanted Garden, Abandoned Ruins, Underground Lake, Sealed Passage, Treasure Chamber
- **Items**: 7 items (including 1 combined):
  - Torn Map, Brass Lantern, Rusty Key, Ancient Coin, Crystal Gem, Silver Amulet, Gemmed Amulet (combined)
- **Actions**: 
  - Movement: `go [direction]` (north, south, east, west)
  - Interaction: `take [item]`, `examine [item]`, `use [item]`, `combine [item1] [item2]`
  - Information: `inventory`, `look`, `help`
- **Puzzle Chain (3 sequential puzzles)**:
  1. **Cave Illumination**: Use the Brass Lantern in the Dark Cave to reveal the western passage
  2. **Locked Gate**: Use the Rusty Key at the Underground Lake to unlock the northern gate
  3. **Sealed Passage**: Use the Gemmed Amulet at the Sealed Passage to open the stone door
- **Item Combination**: Crystal Gem (Ruins) + Silver Amulet (Underground Lake) → Gemmed Amulet (via `combine` tool)
- **Dynamic Connections**: Puzzle-blocked exits are hidden from `look` until solved, and give specific puzzle-hint error messages on attempted traversal
- **Win Condition**: Reaching the Treasure Chamber room

## Future Enhancements
Planned improvements for future versions:

### Phase 4: Agent Optimization (Next)
- Refine system prompt based on observed behaviors for better decision-making
- Implement custom stop conditions (e.g., stop when win condition reached)
- Add telemetry and debugging capabilities (step count, cost, time tracking)
- Experiment with different models for optimal performance/cost balance
- Add fallback strategies for when agent gets stuck (hint system, exploration bonuses)

### Additional Features
- Save/load game state functionality
- Multiple difficulty settings
- Sound effects and ASCII art enhancements
- Web-based version for browser play
- Comprehensive test suite with Jest or Vitest
- Docker container for easy deployment

## Technical Requirements
- Node.js 16+ (for TypeScript and ts-node)
- npm 8+ (for package management)
- OpenRouter API key (free tier sufficient for testing)
- Compatible with Windows, macOS, and Linux

## How the Agent Achieves Autonomy
The agent demonstrates true autonomy through:
1. **Goal-Oriented Behavior**: Clear objective (reach treasure chamber) defined in system prompt
2. **Environmental Perception**: Observes world state through tool results
3. **Action Selection**: Chooses appropriate tools based on current state and goals
4. **Execution Reliability**: SDK handles tool execution and result feeding
5. **Learning from Experience**: Conversation history informs future decisions
6. **Termination Conditions**: Stops when goal achieved or limits exceeded

## Why Tool-Based Architecture?
Following OpenRouter SDK best practices:
- **Reliability**: Prevents malformed command parsing errors
- **Type Safety**: Zod schemas validate all inputs and outputs
- **Separation of Concerns**: Game logic isolated from decision-making
- **Extensibility**: Easy to add new actions as new tools
- **Debugging**: Clear action tracking through tool calls and results
- **SDK Optimization**: Leverages built-in looping and state management

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [OpenRouter](https://openrouter.ai) for providing the Agent SDK and model access
- [NVIDIA](https://www.nvidia.com) for the Nemotron model family
- The open-source TypeScript and Node.js communities