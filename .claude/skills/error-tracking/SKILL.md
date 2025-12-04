---
name: error-tracking
description: Centralized logging, debugging, and error tracking patterns for Java test frameworks. Use this skill when adding logging to tests, debugging container issues, troubleshooting Selenium failures, or implementing test monitoring.
---

# Test Framework Error Tracking and Debugging

## Purpose

This skill establishes patterns for centralized logging, debugging, and error tracking in Java test frameworks using TestContainers, Selenium, and Cucumber.

## When to Use This Skill

- Adding logging to test framework code
- Debugging container startup/shutdown issues
- Troubleshooting Selenium/WebDriver failures
- Investigating BDD scenario failures
- Creating diagnostic utilities
- Implementing test reporting

## Core Patterns

### 1. Logging with @Slf4j

```java
@Slf4j
public class ContainerStateManager {

    public void startAll() {
        log.info("Starting all containers...");

        try {
            redis = new RedisContainer();
            redis.start();
            log.info("Redis started at port: {}", redis.getMappedPort(6379));

            livekit = new LiveKitContainer("v1.5.0");
            livekit.start();
            log.info("LiveKit started at: {}", livekit.getWsUrl());

        } catch (Exception e) {
            log.error("Failed to start containers", e);
            throw new ContainerStartupException("Container startup failed", e);
        }
    }

    public void stopAll() {
        log.info("Stopping all containers...");

        Stream.of(livekit, redis, minio)
            .filter(Objects::nonNull)
            .forEach(container -> {
                try {
                    container.stop();
                    log.debug("Stopped container: {}", container.getDockerImageName());
                } catch (Exception e) {
                    log.warn("Error stopping container: {}", e.getMessage());
                }
            });

        log.info("All containers stopped");
    }
}
```

### 2. Container Debugging

```java
@Slf4j
public class LiveKitContainer extends GenericContainer<LiveKitContainer> {

    @Override
    public void start() {
        log.info("Starting LiveKit container with image: {}", getDockerImageName());

        try {
            super.start();
            log.info("LiveKit container started successfully");
            log.debug("Container ID: {}", getContainerId());
            log.debug("Mapped ports: 7880 -> {}", getMappedPort(7880));

        } catch (Exception e) {
            log.error("LiveKit container failed to start");
            log.error("Container logs:\n{}", getLogs());
            throw e;
        }
    }

    public void logContainerStatus() {
        log.info("Container status:");
        log.info("  Running: {}", isRunning());
        log.info("  Host: {}", getHost());
        log.info("  Ports: {}", getExposedPorts());
        log.debug("  Full logs:\n{}", getLogs());
    }
}
```

### 3. Selenium/WebDriver Debugging

```java
@Slf4j
public class WebDriverStateManager {

    public WebDriver createDriver(boolean headless) {
        log.info("Creating WebDriver (headless={})", headless);

        try {
            ChromeOptions options = buildChromeOptions(headless);
            WebDriver driver = new ChromeDriver(options);

            log.info("WebDriver created successfully");
            log.debug("Session ID: {}", ((ChromeDriver) driver).getSessionId());

            return driver;

        } catch (Exception e) {
            log.error("Failed to create WebDriver", e);
            throw new WebDriverException("WebDriver creation failed", e);
        }
    }

    public byte[] takeScreenshotOnFailure(WebDriver driver, String scenarioName) {
        try {
            byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            log.info("Screenshot captured for scenario: {}", scenarioName);
            return screenshot;
        } catch (Exception e) {
            log.warn("Failed to capture screenshot: {}", e.getMessage());
            return new byte[0];
        }
    }

    public void logBrowserState(WebDriver driver) {
        log.info("Browser state:");
        log.info("  Current URL: {}", driver.getCurrentUrl());
        log.info("  Title: {}", driver.getTitle());
        log.debug("  Page source length: {}", driver.getPageSource().length());
    }
}
```

### 4. Cucumber Scenario Debugging

```java
@Slf4j
public class CucumberHooks {

    @Before
    public void beforeScenario(Scenario scenario) {
        log.info("========================================");
        log.info("Starting scenario: {}", scenario.getName());
        log.info("Tags: {}", scenario.getSourceTagNames());
        log.info("========================================");
    }

    @After
    public void afterScenario(Scenario scenario) {
        log.info("----------------------------------------");
        log.info("Finished scenario: {}", scenario.getName());
        log.info("Status: {}", scenario.getStatus());

        if (scenario.isFailed()) {
            log.error("Scenario FAILED: {}", scenario.getName());
            captureDebugInfo(scenario);
        }

        log.info("----------------------------------------");
    }

    private void captureDebugInfo(Scenario scenario) {
        WebDriver driver = WebDriverStateManager.getInstance().getDriver();

        if (driver != null) {
            byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            scenario.attach(screenshot, "image/png", "failure-screenshot");

            String pageSource = driver.getPageSource();
            scenario.attach(pageSource.getBytes(), "text/html", "page-source");

            log.error("Current URL: {}", driver.getCurrentUrl());
            log.error("Browser logs captured");
        }

        ContainerStateManager containers = ContainerStateManager.getInstance();
        if (containers.isLiveKitRunning()) {
            String logs = containers.getLiveKitLogs();
            scenario.attach(logs.getBytes(), "text/plain", "livekit-logs");
        }
    }
}
```

### 5. Step Definition Logging

```java
@Slf4j
public class RoomSteps {

    @Given("the LiveKit server is running")
    public void livekitServerIsRunning() {
        log.info("Step: Verifying LiveKit server is running");

        ContainerStateManager containers = ContainerStateManager.getInstance();
        containers.ensureLiveKitStarted();

        log.info("LiveKit URL: {}", containers.getLiveKitUrl());
        log.debug("LiveKit logs:\n{}", containers.getLiveKitLogs());
    }

    @When("the user joins room {string}")
    public void userJoinsRoom(String roomName) {
        log.info("Step: User joining room '{}'", roomName);

        try {
            String token = roomClient.createToken(roomName, "user1");
            log.debug("Created token for room: {}", roomName);

            page.joinRoom(roomName, token);
            log.info("Successfully joined room: {}", roomName);

        } catch (Exception e) {
            log.error("Failed to join room '{}': {}", roomName, e.getMessage());
            throw e;
        }
    }
}
```

## Logging Configuration

### logback-test.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATTERN" value="%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"/>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>build/logs/test.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>build/logs/test.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>

    <logger name="ro.stancalau.test" level="DEBUG"/>
    <logger name="org.testcontainers" level="INFO"/>
    <logger name="org.openqa.selenium" level="WARN"/>
    <logger name="io.cucumber" level="INFO"/>
</configuration>
```

## Debugging Checklist

### Container Issues

- [ ] Check container is running: `container.isRunning()`
- [ ] Verify mapped ports: `container.getMappedPort(port)`
- [ ] Review container logs: `container.getLogs()`
- [ ] Check Docker daemon status
- [ ] Verify image exists and can be pulled

### WebDriver Issues

- [ ] Check driver initialization logs
- [ ] Capture screenshot on failure
- [ ] Log current URL and page title
- [ ] Check browser console logs
- [ ] Verify Chrome options (headless, fake media)

### BDD Scenario Issues

- [ ] Review step definition matching
- [ ] Check ScenarioContext state
- [ ] Verify @Before/@After hook execution
- [ ] Log step parameters
- [ ] Capture debug artifacts on failure

## Best Practices

### DO:
- Use `@Slf4j` for logging (Lombok)
- Log at appropriate levels (error, warn, info, debug)
- Include context in log messages
- Capture artifacts on test failure
- Log container and browser state for debugging

### DON'T:
- Use `System.out.println`
- Log sensitive data (tokens, credentials)
- Catch and swallow exceptions silently
- Use generic `Exception` catch blocks
- Leave debug logging enabled in CI

## Related Skills

- **livekit-testing-guidelines** - Container and page object patterns
- **bdd-tester** - Cucumber BDD testing patterns
