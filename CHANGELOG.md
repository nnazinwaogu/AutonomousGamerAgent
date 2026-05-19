# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Initial project setup with OpenRouter Agent SDK
- Text-based adventure game "Explorer's Quest"
- Tool-based architecture for reliable agent actions
- Integration with nvidia/nemotron-3-super-120b-a12b:free model

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