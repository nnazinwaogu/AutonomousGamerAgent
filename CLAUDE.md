# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- **Run agent**: `npx ts-node src/main.ts`
- **Build**: `npx tsc`
- **Run engine tests**: `npx ts-node src/game/test.ts`
- **Dev mode**: `npm run dev` (alias for `npx ts-node src/main.ts`)

## Architecture

**Explorer's Quest** is an LLM-driven text-adventure game agent using the OpenRouter Agent SDK. Game logic is cleanly separated from LLM decision-making.

### Source Layout
- `src/game/world.ts` — Room/Item/GameState TS interfaces and `createInitialGameState()` factory: 8 rooms, 7 items (incl. 1 combined), `stateFlags` for puzzle progress tracking (cave_illuminated, lake_unlocked, passage_unlocked)
- `src/game/engine.ts` — Singleton `GameEngine`: movement (N/S/E/W), items (take/examine/use/combine), dynamic connections via `getEffectiveConnections()` (hides puzzle-blocked exits), puzzle state (cave illumination → key unlocks gate → gemmed amulet opens passage), examine hints, win detection
- `src/agent/agent.ts` — OpenRouter SDK integration. Defines 8 tools (`moveTool`, `takeItemTool`, `examineItemTool`, `inventoryTool`, `lookTool`, `useItemTool`, `combineItemsTool`, `helpTool`) with Zod schemas. Each tool's `execute` delegates to `gameEngine`. System prompt describes the world layout and all puzzles. Stop conditions: 50 steps, $0.50 max cost.
- `src/main.ts` — Entry point. Calls `openrouter.callModel()`, wraps `getItemsStream()` (tool-usage tracking) and `getResponse()` (token/cost data) in timing via `process.hrtime.bigint()`.

### Key Pattern
`callModel()` is synchronous — returns a `ModelResult` immediately. The multi-turn agent loop runs lazily inside `getResponse()` / `getItemsStream()`. Telemetry timing wraps those calls, not `callModel()`.

### Puzzle Chain (3 puzzles, sequential)
1. **Cave Illumination** — Cave west exit blocked unless `cave_illuminated` flag set (use Brass Lantern in cave)
2. **Locked Gate** — Underground Lake north exit blocked unless `lake_unlocked` flag set (use Rusty Key at lake)
3. **Sealed Passage** — Sealed Passage east exit blocked unless `passage_unlocked` flag set (use Gemmed Amulet at passage)
4. **Item Combination** — Crystal Gem (Ruins) + Silver Amulet (Underground Lake) → Gemmed Amulet via `combineItems()`

### Game Flow (optimal)
Clearing (map) → Cabin (key) → Garden (ancient coin) → Ruins (crystal gem) → Cabin → Clearing → Cave (lantern, use lantern) → Underground Lake (silver amulet, combine gem+amulet, use key) → Sealed Passage (use amulet) → Treasure Chamber

### World Map
```
                        [Ruins] — [Garden]
                                      |
[Treasure] — [Sealed Passage]     [Cabin]
                     |               |
           [Underground Lake] — [Cave] — [Clearing]
```