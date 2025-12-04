# Architecture Overview - LiveKit Testing Framework

## Component Architecture

```
Test Execution (Gradle/JUnit 5)
    ↓
BDD Step Definitions (Cucumber)
    ↓
Page Objects (Selenium WebDriver)
    ↓
State Managers (Lifecycle coordination)
    ↓
Containers (TestContainers)
    ↓
External Services (LiveKit, Redis, MinIO)
```

## Layer Responsibilities

### Test Execution Layer
- JUnit 5 test runner
- Cucumber integration
- Test configuration
- Report generation

### BDD Step Definitions
- Gherkin step implementations
- State orchestration
- Assertion logic
- Cleanup hooks

### Page Objects Layer
- Browser automation
- Element locators
- User interactions
- WebRTC controls

### State Managers
- Container lifecycle
- WebDriver lifecycle
- Room/client state
- Token management

### Containers Layer
- Docker container orchestration
- Network configuration
- Port mapping
- Health checks

## Directory Structure

```
src/main/java/ro/stancalau/test/framework/
├── container/           # TestContainers
├── page/               # Page Objects
├── state/              # State Managers
├── config/             # Configuration
└── util/               # Utilities

src/test/java/ro/stancalau/test/
├── framework/          # Unit tests
└── bdd/steps/          # Step definitions

src/test/resources/
└── features/           # Gherkin files
```

## Data Flow

1. Cucumber parses feature files
2. Step definitions invoke state managers
3. State managers coordinate containers and WebDrivers
4. Page objects automate browser interactions
5. Assertions verify expected outcomes
6. Cleanup releases resources
