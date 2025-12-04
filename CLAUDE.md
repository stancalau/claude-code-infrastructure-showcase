# Claude Code Infrastructure Showcase

This is a reference library of Claude Code infrastructure components designed for **LiveKit Testing Framework** development.

## Tech Stack

- **Java 21+** - Core language
- **Gradle** - Build tool
- **TestContainers 1.20.x** - Docker container orchestration
- **Selenium WebDriver 4.27.0** - Browser automation
- **Cucumber 7.18.0** - BDD testing framework
- **LiveKit Server SDK** - WebRTC integration
- **JUnit 5** - Unit testing
- **Lombok** - Boilerplate reduction

## Project Purpose

This showcase provides production-tested patterns for:
- Auto-activating skills via hooks
- Modular skill pattern (500-line rule with progressive disclosure)
- Specialized agents for complex tasks
- Dev docs system that survives context resets

## Target Project

[LiveKit Testing Framework](https://github.com/Stancalau-ro/livekit-testing) - A BDD integration testing framework for LiveKit WebRTC applications.

## Key Components

### Skills
- **livekit-testing-guidelines** - Container orchestration, page objects, state management
- **bdd-tester** - Cucumber/Gherkin BDD testing patterns
- **error-tracking** - Logging and debugging patterns
- **skill-developer** - Meta-skill for creating skills

### Agents
- **bdd-scenario-tester** - Test Cucumber BDD scenarios
- **container-debugger** - Debug TestContainers/Docker issues
- **code-architecture-reviewer** - Review code for consistency
- **refactor-planner** - Plan refactoring strategies

### Hooks
- **skill-activation-prompt** - Auto-suggests skills based on context
- **error-handling-reminder** - Reminds about best practices

## Integration Guide

See [CLAUDE_INTEGRATION_GUIDE.md](CLAUDE_INTEGRATION_GUIDE.md) for detailed instructions on integrating these components into your project.

## Development Guidelines

1. **Containers** - Use TestContainers pattern with proper lifecycle management
2. **Page Objects** - Selenium page object pattern for WebRTC automation
3. **State Managers** - Singleton pattern for coordinating lifecycle
4. **BDD Scenarios** - Cucumber/Gherkin for readable test specifications
5. **Logging** - @Slf4j for all debugging and monitoring

## Important Notes

- This is NOT a working application - it's a reference library
- Copy what you need and customize for your project
- Skills use progressive disclosure (main file + resource files)
- Hooks require Node.js for TypeScript execution
