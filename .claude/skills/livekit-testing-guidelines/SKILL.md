---
name: livekit-testing-guidelines
description: Comprehensive testing framework guide for LiveKit WebRTC applications. Use when creating container orchestration, page objects, state management, Selenium automation, or working with TestContainers, Cucumber BDD, WebRTC testing, token management, or browser automation. Covers container management (LiveKit, Egress, MinIO, Redis), page object patterns, state managers, and integration testing patterns.
---

# LiveKit Testing Framework Guidelines

## Purpose

Establish consistency and best practices across the LiveKit testing framework using Java 21+, TestContainers, Selenium WebDriver, and Cucumber for BDD testing.

## When to Use This Skill

Automatically activates when working on:
- Creating or modifying container orchestration classes
- Building page objects for WebRTC automation
- Implementing state managers
- Selenium WebDriver configuration and automation
- Cucumber/Gherkin BDD scenarios
- Token and permission management
- S3/MinIO storage integration
- Test recording and VNC setup

---

## Quick Start

### New Container Checklist

- [ ] **Container Class**: Extends GenericContainer with proper configuration
- [ ] **Lifecycle Management**: Start/stop/cleanup methods
- [ ] **State Integration**: Register with ContainerStateManager
- [ ] **Configuration**: Expose ports, environment variables
- [ ] **Health Checks**: Wait strategies for container readiness
- [ ] **Logging**: @Slf4j for debugging
- [ ] **Tests**: Unit tests for container behavior

### New Page Object Checklist

- [ ] **Page Class**: Selenium WebDriver page object
- [ ] **Locators**: Element locators (By strategies)
- [ ] **Actions**: User interaction methods
- [ ] **Waits**: Explicit waits for dynamic content
- [ ] **State Integration**: Register with WebDriverStateManager
- [ ] **Tests**: Integration tests with real browser

### New BDD Scenario Checklist

- [ ] **Feature File**: Gherkin syntax in `.feature` file
- [ ] **Step Definitions**: Java methods with @Given/@When/@Then
- [ ] **State Management**: Use appropriate state managers
- [ ] **Cleanup**: Proper resource cleanup in @After hooks
- [ ] **Tags**: Appropriate test tags for filtering

---

## Architecture Overview

### Component Architecture

```
Test Execution
    ↓
BDD Step Definitions (Cucumber)
    ↓
Page Objects (Selenium automation)
    ↓
State Managers (lifecycle coordination)
    ↓
Containers (TestContainers orchestration)
    ↓
External Services (LiveKit, Redis, MinIO)
```

**Key Principle:** Each layer has ONE responsibility.

See [architecture-overview.md](resources/architecture-overview.md) for complete details.

---

## Directory Structure

```
src/main/java/ro/stancalau/test/framework/
├── container/              # Docker container management
│   ├── LiveKitContainer.java
│   ├── EgressContainer.java
│   ├── MinIOContainer.java
│   └── RedisContainer.java
├── page/                   # Page Objects for WebRTC
│   ├── LiveKitMeet.java
│   ├── WebrtcPublish.java
│   └── WebrtcPlayback.java
├── state/                  # State management
│   ├── ContainerStateManager.java
│   ├── RoomClientStateManager.java
│   └── WebDriverStateManager.java
├── config/                 # Configuration
│   └── SeleniumConfig.java
└── util/                   # Utilities
    ├── StringParsingUtils.java
    ├── S3ClientUtils.java
    ├── DateUtils.java
    └── FileUtils.java

src/test/java/ro/stancalau/test/
├── framework/              # Unit tests
└── bdd/                    # BDD step definitions
    └── steps/

src/test/resources/
├── features/               # Cucumber feature files
│   └── *.feature
└── junit-platform.properties
```

**Naming Conventions:**
- Containers: `PascalCase + Container` - `LiveKitContainer.java`
- Page Objects: `PascalCase` - `LiveKitMeet.java`
- State Managers: `PascalCase + StateManager` - `ContainerStateManager.java`
- Step Definitions: `PascalCase + Steps` - `RoomSteps.java`
- Feature Files: `kebab-case` - `room-creation.feature`

---

## Core Principles (7 Key Rules)

### 1. Containers Must Be Self-Contained

```java
public class LiveKitContainer extends GenericContainer<LiveKitContainer> {

    private static final String IMAGE = "livekit/livekit-server";

    public LiveKitContainer(String version) {
        super(DockerImageName.parse(IMAGE + ":" + version));
        withExposedPorts(7880, 7881, 7882);
        withEnv("LIVEKIT_KEYS", "devkey: secret");
        waitingFor(Wait.forHttp("/").forPort(7880));
    }

    public String getWsUrl() {
        return String.format("ws://%s:%d", getHost(), getMappedPort(7880));
    }
}
```

### 2. Use Page Object Pattern for Browser Automation

```java
@Slf4j
public class LiveKitMeet {

    private final WebDriver driver;
    private final WebDriverWait wait;

    public LiveKitMeet(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    public void joinRoom(String roomName, String token) {
        driver.get(buildJoinUrl(roomName, token));
        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-room-connected='true']")));
        log.info("Joined room: {}", roomName);
    }

    public void publishVideo() {
        WebElement publishBtn = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("publish-video")));
        publishBtn.click();
    }
}
```

### 3. State Managers Coordinate Lifecycle

```java
@Slf4j
public class ContainerStateManager {

    private static ContainerStateManager instance;
    private LiveKitContainer livekit;
    private RedisContainer redis;
    private MinIOContainer minio;

    public static synchronized ContainerStateManager getInstance() {
        if (instance == null) {
            instance = new ContainerStateManager();
        }
        return instance;
    }

    public void startAll() {
        redis = new RedisContainer();
        redis.start();

        livekit = new LiveKitContainer("v1.5.0")
            .withNetwork(redis.getNetwork());
        livekit.start();

        minio = new MinIOContainer();
        minio.start();

        log.info("All containers started");
    }

    public void stopAll() {
        Stream.of(livekit, redis, minio)
            .filter(Objects::nonNull)
            .forEach(GenericContainer::stop);
    }
}
```

### 4. Use Cucumber for BDD Scenarios

```gherkin
Feature: Room Management

  Background:
    Given LiveKit server is running
    And a user with publish permissions

  Scenario: Join room and publish video
    When the user joins room "test-room"
    Then the user should be connected
    When the user publishes video
    Then the video track should be visible to other participants
```

### 5. Step Definitions Orchestrate State

```java
public class RoomSteps {

    private final ContainerStateManager containers = ContainerStateManager.getInstance();
    private final RoomClientStateManager roomClient = new RoomClientStateManager();
    private final WebDriverStateManager webDriver = WebDriverStateManager.getInstance();

    @Given("LiveKit server is running")
    public void livekitServerIsRunning() {
        containers.startAll();
    }

    @When("the user joins room {string}")
    public void userJoinsRoom(String roomName) {
        String token = roomClient.createToken(roomName, "user1",
            List.of(Permission.ROOM_JOIN, Permission.CAN_PUBLISH));
        LiveKitMeet page = new LiveKitMeet(webDriver.getDriver());
        page.joinRoom(roomName, token);
    }

    @After
    public void cleanup() {
        webDriver.cleanup();
    }
}
```

### 6. Token Management with Full Permissions

```java
public class RoomClientStateManager {

    private static final String API_KEY = "devkey";
    private static final String API_SECRET = "secret";

    public String createToken(String roomName, String identity, List<Permission> permissions) {
        AccessToken token = new AccessToken(API_KEY, API_SECRET);
        token.setIdentity(identity);
        token.setName(identity);

        VideoGrant grant = new VideoGrant();
        grant.setRoom(roomName);
        grant.setRoomJoin(permissions.contains(Permission.ROOM_JOIN));
        grant.setCanPublish(permissions.contains(Permission.CAN_PUBLISH));
        grant.setCanSubscribe(permissions.contains(Permission.CAN_SUBSCRIBE));

        token.addGrant(grant);
        return token.toJwt();
    }
}
```

### 7. Comprehensive Logging Required

```java
@Slf4j
public class SeleniumConfig {

    public WebDriver createDriver(boolean headless) {
        log.info("Creating WebDriver, headless={}", headless);

        ChromeOptions options = new ChromeOptions();
        if (headless) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--use-fake-ui-for-media-stream");
        options.addArguments("--use-fake-device-for-media-stream");

        WebDriver driver = new ChromeDriver(options);
        log.info("WebDriver created successfully");
        return driver;
    }
}
```

---

## Common Imports

```java
// TestContainers
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

// Selenium
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

// Cucumber
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.After;
import io.cucumber.java.Before;

// LiveKit SDK
import io.livekit.server.AccessToken;
import io.livekit.server.VideoGrant;

// JUnit 5
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;

// Lombok
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

// AWS SDK (for MinIO)
import software.amazon.awssdk.services.s3.S3Client;
```

---

## Quick Reference

### Container Wait Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| `Wait.forHttp()` | HTTP health endpoint | `Wait.forHttp("/health").forPort(8080)` |
| `Wait.forLogMessage()` | Log message appears | `Wait.forLogMessage(".*Started.*", 1)` |
| `Wait.forListeningPort()` | Port is listening | `Wait.forListeningPort()` |
| `Wait.forHealthcheck()` | Docker healthcheck | `Wait.forHealthcheck()` |

### Selenium Locator Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| `By.id()` | Unique ID | `By.id("submit-btn")` |
| `By.cssSelector()` | CSS selector | `By.cssSelector("[data-testid='video']")` |
| `By.xpath()` | Complex queries | `By.xpath("//button[text()='Join']")` |
| `By.className()` | Class name | `By.className("active-participant")` |

### LiveKit Permission Types

| Permission | Description |
|------------|-------------|
| `ROOM_JOIN` | Can join the room |
| `CAN_PUBLISH` | Can publish tracks |
| `CAN_SUBSCRIBE` | Can subscribe to tracks |
| `CAN_PUBLISH_DATA` | Can publish data messages |
| `ROOM_ADMIN` | Full room administration |
| `ROOM_CREATE` | Can create rooms |
| `ROOM_LIST` | Can list rooms |
| `ROOM_RECORD` | Can record rooms |

---

## Anti-Patterns to Avoid

- Containers without proper cleanup (memory leaks)
- Page objects with hardcoded waits (`Thread.sleep`)
- State managers without singleton pattern
- Step definitions with business logic
- Missing @After hooks for resource cleanup
- Exposing WebDriver directly to tests
- Using `System.out.println` instead of @Slf4j
- Hardcoded test data in feature files

---

## Navigation Guide

| Need to... | Read this |
|------------|-----------|
| Understand architecture | [architecture-overview.md](resources/architecture-overview.md) |
| Create containers | [containers-guide.md](resources/containers-guide.md) |
| Build page objects | [page-objects.md](resources/page-objects.md) |
| Manage state | [state-management.md](resources/state-management.md) |
| Write BDD scenarios | [bdd-patterns.md](resources/bdd-patterns.md) |
| Configure Selenium | [selenium-config.md](resources/selenium-config.md) |
| Handle tokens | [token-management.md](resources/token-management.md) |
| Write tests | [testing-guide.md](resources/testing-guide.md) |
| Debug issues | [debugging-guide.md](resources/debugging-guide.md) |
| See complete examples | [complete-examples.md](resources/complete-examples.md) |

---

## Resource Files

### [architecture-overview.md](resources/architecture-overview.md)
Component architecture, request lifecycle, separation of concerns

### [containers-guide.md](resources/containers-guide.md)
TestContainers patterns, LiveKit/Redis/MinIO/Egress setup

### [page-objects.md](resources/page-objects.md)
Selenium page object patterns, WebRTC automation

### [state-management.md](resources/state-management.md)
State manager patterns, lifecycle coordination

### [bdd-patterns.md](resources/bdd-patterns.md)
Cucumber/Gherkin patterns, step definitions

### [selenium-config.md](resources/selenium-config.md)
WebDriver configuration, Chrome options, VNC recording

### [token-management.md](resources/token-management.md)
LiveKit token creation, permissions, grants

### [testing-guide.md](resources/testing-guide.md)
Unit tests, integration tests, E2E tests with Cucumber

### [debugging-guide.md](resources/debugging-guide.md)
Container debugging, browser debugging, test isolation

### [complete-examples.md](resources/complete-examples.md)
Full examples, CRUD implementation guide

---

## Related Skills

- **bdd-tester** - Cucumber/Gherkin BDD testing patterns
- **error-tracking** - Centralized logging and debugging patterns
- **skill-developer** - Meta-skill for creating and managing skills

---

**Skill Status**: COMPLETE
**Line Count**: < 500
**Progressive Disclosure**: 10 resource files
