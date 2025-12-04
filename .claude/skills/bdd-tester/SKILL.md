---
name: bdd-tester
description: Cucumber/Gherkin BDD testing patterns for Java applications. Use this skill when writing feature files, step definitions, scenario outlines, or implementing BDD workflows with Cucumber and JUnit 5.
---

# Cucumber BDD Testing

## Purpose

This skill provides patterns for Behavior-Driven Development (BDD) testing using Cucumber with Gherkin syntax, focusing on readable test scenarios and maintainable step definitions.

## When to Use This Skill

- Writing Gherkin feature files
- Creating step definitions
- Implementing BDD test scenarios
- Testing with Scenario Outlines (data-driven)
- Setting up Cucumber test infrastructure
- Integrating BDD with TestContainers

## Feature File Structure

### Basic Feature File

```gherkin
@room-management
Feature: Room Management
  As a LiveKit user
  I want to manage WebRTC rooms
  So that I can host video conferences

  Background:
    Given the LiveKit server is running
    And I have valid credentials

  @smoke
  Scenario: Create a new room
    When I create a room named "test-room"
    Then the room should be created successfully
    And I should receive a room token

  Scenario: Join existing room
    Given a room named "existing-room" exists
    When I join the room with publish permissions
    Then I should be connected to the room
    And I should see other participants
```

### Scenario Outline (Data-Driven)

```gherkin
@permissions
Scenario Outline: Permission-based room access
  Given a room named "<room_name>" exists
  And I have "<permission_type>" permissions
  When I attempt to "<action>"
  Then the result should be "<expected_result>"

  Examples:
    | room_name | permission_type | action        | expected_result |
    | room-1    | publish         | publish video | success         |
    | room-2    | subscribe       | publish video | denied          |
    | room-3    | admin           | kick user     | success         |
    | room-4    | none            | join room     | denied          |
```

## Step Definitions

### Basic Step Definition Pattern

```java
@Slf4j
public class RoomSteps {

    private final ContainerStateManager containers;
    private final RoomClientStateManager roomClient;
    private String currentRoomName;
    private String currentToken;
    private Exception lastException;

    public RoomSteps() {
        this.containers = ContainerStateManager.getInstance();
        this.roomClient = new RoomClientStateManager();
    }

    @Given("the LiveKit server is running")
    public void theLiveKitServerIsRunning() {
        containers.ensureLiveKitStarted();
        log.info("LiveKit server is running at {}", containers.getLiveKitUrl());
    }

    @Given("I have valid credentials")
    public void iHaveValidCredentials() {
        assertThat(roomClient.getApiKey()).isNotBlank();
        assertThat(roomClient.getApiSecret()).isNotBlank();
    }

    @When("I create a room named {string}")
    public void iCreateRoomNamed(String roomName) {
        currentRoomName = roomName;
        currentToken = roomClient.createRoomToken(roomName);
    }

    @Then("the room should be created successfully")
    public void theRoomShouldBeCreatedSuccessfully() {
        assertThat(currentToken).isNotNull();
        assertThat(roomClient.roomExists(currentRoomName)).isTrue();
    }
}
```

### Step with Data Table

```java
@When("I create users with the following details:")
public void iCreateUsersWithFollowingDetails(DataTable dataTable) {
    List<Map<String, String>> users = dataTable.asMaps();

    for (Map<String, String> user : users) {
        String identity = user.get("identity");
        String permissions = user.get("permissions");

        roomClient.createUser(identity, parsePermissions(permissions));
        log.info("Created user: {} with permissions: {}", identity, permissions);
    }
}
```

### Step with DocString

```java
@When("I send the following JSON payload:")
public void iSendJsonPayload(String docString) {
    JsonObject payload = JsonParser.parseString(docString).getAsJsonObject();
    response = apiClient.post("/api/rooms", payload);
}
```

## Cucumber Hooks

### Setup and Teardown

```java
public class CucumberHooks {

    private static final ContainerStateManager containers = ContainerStateManager.getInstance();
    private static final WebDriverStateManager webDriver = WebDriverStateManager.getInstance();

    @BeforeAll
    public static void globalSetup() {
        containers.startAll();
    }

    @AfterAll
    public static void globalTeardown() {
        containers.stopAll();
    }

    @Before
    public void scenarioSetup(Scenario scenario) {
        log.info("Starting scenario: {}", scenario.getName());
    }

    @After
    public void scenarioTeardown(Scenario scenario) {
        if (scenario.isFailed()) {
            captureScreenshot(scenario);
        }
        webDriver.cleanup();
        log.info("Finished scenario: {} - {}", scenario.getName(), scenario.getStatus());
    }

    @Before("@browser")
    public void setupBrowser() {
        webDriver.createDriver();
    }

    @After("@browser")
    public void closeBrowser() {
        webDriver.quitDriver();
    }

    private void captureScreenshot(Scenario scenario) {
        byte[] screenshot = webDriver.takeScreenshot();
        scenario.attach(screenshot, "image/png", scenario.getName());
    }
}
```

## Test Configuration

### junit-platform.properties

```properties
cucumber.plugin=pretty,html:build/reports/cucumber/cucumber-report.html,json:build/reports/cucumber/cucumber-report.json
cucumber.glue=ro.stancalau.test.bdd.steps
cucumber.features=src/test/resources/features
cucumber.filter.tags=not @wip
cucumber.publish.quiet=true
```

### Cucumber Runner (JUnit 5)

```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "ro.stancalau.test.bdd.steps")
public class CucumberTestRunner {
}
```

## Common Patterns

### State Sharing Between Steps

```java
public class ScenarioContext {

    private static final ThreadLocal<Map<String, Object>> context =
        ThreadLocal.withInitial(HashMap::new);

    public static void set(String key, Object value) {
        context.get().put(key, value);
    }

    @SuppressWarnings("unchecked")
    public static <T> T get(String key) {
        return (T) context.get().get(key);
    }

    public static void clear() {
        context.get().clear();
    }
}
```

### Using Context in Steps

```java
@When("I create a room named {string}")
public void iCreateRoomNamed(String roomName) {
    String token = roomClient.createRoomToken(roomName);
    ScenarioContext.set("roomName", roomName);
    ScenarioContext.set("token", token);
}

@Then("I should be able to join the room")
public void iShouldBeAbleToJoinRoom() {
    String roomName = ScenarioContext.get("roomName");
    String token = ScenarioContext.get("token");

    assertThat(roomClient.joinRoom(roomName, token)).isTrue();
}
```

### Tag-Based Test Execution

```gherkin
@smoke @critical
Feature: Critical Room Operations

  @regression
  Scenario: Basic room creation
    # ...

  @wip
  Scenario: Work in progress
    # ...
```

```bash
# Run smoke tests only
./gradlew test -Dcucumber.filter.tags="@smoke"

# Run all except WIP
./gradlew test -Dcucumber.filter.tags="not @wip"

# Run smoke AND critical
./gradlew test -Dcucumber.filter.tags="@smoke and @critical"
```

## Test Dependencies (build.gradle)

```groovy
dependencies {
    testImplementation platform('io.cucumber:cucumber-bom:7.18.0')
    testImplementation 'io.cucumber:cucumber-java'
    testImplementation 'io.cucumber:cucumber-junit-platform-engine'

    testImplementation 'org.junit.platform:junit-platform-suite'
    testImplementation 'org.junit.jupiter:junit-jupiter'

    testImplementation 'org.assertj:assertj-core:3.24.2'
    testImplementation 'org.testcontainers:testcontainers:1.20.4'
    testImplementation 'org.testcontainers:junit-jupiter:1.20.4'
}

test {
    useJUnitPlatform()
    systemProperty "cucumber.junit-platform.naming-strategy", "long"
}
```

## Debugging Failed Scenarios

### Scenario Fails Silently

- Check step definition matching (regex/Cucumber expressions)
- Verify glue path in configuration
- Look for undefined steps in output

### State Not Shared

- Use ScenarioContext or dependency injection
- Avoid static state between scenarios
- Check thread safety

### Container Not Ready

- Add proper wait strategies
- Check container health checks
- Verify network connectivity

### Browser Issues

- Check WebDriver configuration
- Verify headless mode settings
- Look for timeout issues

## Testing Checklist

Before writing a feature file:

- [ ] Define clear user story (As a... I want... So that...)
- [ ] Identify acceptance criteria
- [ ] Write scenarios in business language
- [ ] Use Background for common setup
- [ ] Tag scenarios appropriately
- [ ] Create step definitions
- [ ] Implement state management
- [ ] Add cleanup in @After hooks
- [ ] Run and verify all scenarios pass

## Related Skills

- **livekit-testing-guidelines** - Container and page object patterns
- **error-tracking** - Logging and debugging patterns
