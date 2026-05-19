# AGENTS.md

## Project Setup
- Initialize TypeScript project: `npm init -y`
- Install dependencies: `npm install typescript @types/node @openrouter/agent zod`
- Install dev dependencies: `npm install -D ts-node @types/node`
- Create `tsconfig.json` for TypeScript compilation
- **Important**: To run the agent, you need to have your OpenRouter API key in a `.env` file as `OPENROUTER_API_KEY=your_key_here` (the `.env` file is already excluded from git via .gitignore)

## Development Conventions
- Source code lives in `src/` directory
- Game engine code: `src/game/`
- Agent SDK integration: `src/agent/`
- Entry point: `src/main.ts`
- Use TypeScript strict mode (enabled in tsconfig.json)
- Define game actions as OpenRouter Agent SDK tools with Zod schemas
- Game state updates happen exclusively in tool execute functions
- Follow the tool-based architecture: LLM selects tools, SDK executes them

## Common Commands
- Compile TypeScript: `npx tsc`
- Run development: `npx ts-node src/main.ts`
- (Test commands to be added when test framework is selected)

## Architecture Notes
- Agent uses OpenRouter SDK's `callModel` for automatic multi-turn loops
- Conversation state managed by SDK (message history, tool results)
- Stop conditions: step count and cost limits defined in agent config
- Game world defined in `src/game/world.ts` (rooms, items, connections)
- Command handler in `src/game/commandHandler.ts` updates state from tool executions
- Agent includes built-in telemetry reporting execution time, tool usage, token counts, and estimated costs