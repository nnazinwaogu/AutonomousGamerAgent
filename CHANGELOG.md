# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-06-04
### Added
- Expanded world from 4 to 8 rooms: Enchanted Garden, Abandoned Ruins, Underground Lake, Sealed Passage
- 4 new items: Ancient Coin, Crystal Gem, Silver Amulet, Gemmed Amulet (combined)
- Item combination system: Crystal Gem + Silver Amulet → Gemmed Amulet via `combineItems()` and `combine_items` tool
- Three linked puzzles: cave illumination (lantern), locked gate (key), stone door (gemmed amulet)
- Dynamic `stateFlags` system tracking puzzle progress
- `getEffectiveConnections()` hides puzzle-blocked exits dynamically
- Puzzle hints in `examine_item` tool results (map, gem, amulet, gemmed amulet)
- Enhanced `look` output with dynamic state descriptions (lit cave, open gate, open door)
- Contextual error messages for puzzle-blocked exits ("the way is blocked or impassable")
- 83 unit tests covering puzzles, combination, navigation, hints, and item interactions

## [Unreleased]
### Fixed
- Telemetry timing: moved timing to wrap getResponse() instead of callModel() — callModel() is synchronous, so the timer was only measuring ModelResult construction (~17ms), not the actual agent loop
- Telemetry tool tracking: replaced getToolCallsStream() with getItemsStream() — getToolCallsStream() only yields from the initial response turn, silently missing multi-turn tool calls
- Telemetry cost: removed hardcoded manual cost estimation with example rates; uses SDK-provided usage.cost (actual cost) when available, displays N/A when absent
- Telemetry fallback: removed `?? { inputTokens: 0, outputTokens: 0 }` fallback that displayed misleading zeros; now shows N/A when usage data is unavailable
- Telemetry labeling: renamed "Total Steps" to "Total Tool Calls" — was counting individual tool calls but labeled as SDK steps (which count turns, where one turn can produce multiple tool calls)
- Deduplication: removed redundant inline stopWhen array from callModel() and referenced agentConfig.stopWhen instead

### Changed
- Execution Time unit from milliseconds to seconds for better readability with longer agent runs

## [Unreleased] - 2026-05-21
### Fixed
- Telemetry implementation: reordered tool calls collection to occur before response consumption
- Code duplication: extracted base instructions constant and use agentConfig.tools instead of recreating tools array
- Dead code: removed commented-out duplicate openrouter initialization
- Tool usage calculation: optimized to avoid intermediate array by counting during stream iteration

## [1.0.0] - 2026-05-19
### Added
- Initial commit of Explorer's Quest LLM-driven game agent
- Game engine with room navigation, item collection, and usage mechanics
- OpenRouter Agent SDK integration using tool-based architecture
- Comprehensive documentation (README.md, AGENTS.md, IMPLEMENTATION_SPEC.md, PLAN.md)
- MIT License file
- Environment variable support via .env file for API key security
- Updated package.json with proper metadata, scripts, and dependencies
- .gitignore to exclude node_modules, dist, and sensitive files

### Changed
- Updated package.json:
  - Name changed from "gameagent" to "explorers-quest-agent"
  - Added detailed description
  - Updated scripts to include start/dev/build commands
  - Added relevant keywords
  - Updated author and license to MIT
  - Added dotenv dependency for environment variable loading

### Files Added
- src/game/engine.ts - Core game logic and state management
- src/game/world.ts - Room and item definitions
- src/game/test.ts - Verification tests
- src/agent/agent.ts - OpenRouter SDK integration with tool definitions
- src/main.ts - Application entry point
- .gitignore - Exclusion rules for dependencies and build artifacts
- .env - Environment variables template (API key)
- LICENSE - MIT license text
- README.md - Comprehensive project documentation
- AGENTS.md - Development instructions for agents/assistants
- IMPLEMENTATION_SPEC.md - Detailed technical specification
- PLAN.md - Implementation roadmap
- FINAL_SUMMARY.md - Project completion summary
- package.json - Project dependencies and metadata
- package-lock.json - Dependency lockfile
- tsconfig.json - TypeScript configuration

### Security Note
- The .env file containing the OpenRouter API key is intentionally excluded from version control via .gitignore
- Users must create their own .env file with OPENROUTER_API_KEY=sk-or-v1-their-key-here