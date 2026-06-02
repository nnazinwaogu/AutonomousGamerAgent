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
- 🗺️ Text-based adventure game with explorable world
- 🎒 Inventory system for collecting and using items
- 🧩 Simple puzzle mechanics (item-based progression)
- 🤖 Autonomous LLM-driven agent using OpenRouter SDK
- 🔧 Tool-based architecture for reliable agent actions
- 📊 Configurable stop conditions (step count, cost limits)
- 📝 Detailed logging and journey tracking
- 📈 Built-in telemetry: Monitor execution time, tool usage, and token consumption
- 🏆 Clear win condition and victory celebration

## Project Structure
```
game-agent/
├── src/
│   ├── game/                 # Game engine and world model
│   │   ├── engine.ts         # Core game loop and state management
│   │   ├── world.ts          # Room, item, and world definitions
│   │   └── test.ts           # Verification tests
│   ├── agent/                # OpenRouter Agent SDK integration
│   │   └── agent.ts          # Agent configuration and tool definitions
│   └── main.ts               # Entry point - connects game and agent
├── .gitignore                # Git exclusion rules
├── .env                      # Environment variables (API key)
├── AGENTS.md                 # Development instructions for agents
├── IMPLEMENTATION_SPEC.md    # Detailed technical specification
├── PLAN.md                   # Implementation roadmap
├── FINAL_SUMMARY.md          # Project completion summary
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Dependency lockfile
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
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
1. Start in the Forest Clearing
2. Explore the world by making decisions based on observations
3. Collect necessary items (map, lantern, key)
4. Solve the puzzle (use lantern to illuminate cave, use key to unlock passage)
5. Reach the Treasure Chamber and declare victory
6. Terminate via success condition or stop limits

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
  - `lookTool`: Describe current location and contents
  - `useItemTool`: Handle special item effects (lantern illumination, key passage)
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
When the agent successfully completes the adventure:

```
Starting Explorer's Quest AI Agent...
==================================================
Congratulations! You have successfully reached the Treasure Chamber, the goal of your adventure.

Here's a summary of your journey:
1. Started in the Forest Clearing and took the Torn Map.
2. Moved north to the Dark Cave and took the Brass Lantern.
3. Lit the lantern to illuminate the cave.
4. Proceeded west through the illuminated cave to enter the Treasure Chamber.

You are now standing in a small chamber filled with glittering treasure - gold coins and precious gems spill from an old chest in the center of the room. Your quest is complete!

🎉 VICTORY! You have reached the Treasure Chamber! 🎉
Thanks for playing Explorer's Quest!

=== Telemetry Report ===
Execution Time: 3.75s
Total Tool Calls: 6
Token Usage: 2,452 input, 219 output (2,671 total)
Cost: $0.000499
Tool Usage:
  look: 2
  move: 2
  take_item: 1
  use_item: 1

Agent execution completed.
```

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
- **World**: 4 interconnected rooms with distinct descriptions
- **Items**: 3 collectible items with specific properties and uses
- **Actions**: 
  - Movement: `go [direction]` (north, south, east, west)
  - Interaction: `take [item]`, `examine [item]`, `use [item]`
  - Information: `inventory`, `look`, `help`
- **Puzzle**: Lantern required to see in cave, key required to unlock final passage
- **Win Condition**: Reaching the Treasure Chamber room

## Future Enhancements
Planned improvements for future versions:

### Phase 3: Enhanced Gameplay
- Expand to 6-8 interconnected rooms with varied themes
- Add combination puzzles requiring multiple items
- Implement narrative elements, backstory, and character dialogue
- Create specialized tools for complex puzzle solving
- Enhance room descriptions with contextual hints and storytelling
- Add multiple win conditions or branching storylines

### Phase 4: Agent Optimization
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