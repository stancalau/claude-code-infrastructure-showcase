# BDD Patterns - Cucumber/Gherkin

## Feature File Structure

```gherkin
@room-management
Feature: Room Management
  As a LiveKit user
  I want to manage WebRTC rooms
  So that I can host video conferences

  Background:
    Given the LiveKit server is running

  @smoke
  Scenario: Create and join room
    When I create a room named "test-room"
    Then the room should be created
    When I join the room with publish permissions
    Then I should be connected

  Scenario Outline: Permission-based access
    Given I have "<permission>" permissions
    When I attempt to "<action>"
    Then the result should be "<expected>"

    Examples:
      | permission | action        | expected |
      | publish    | publish video | success  |
      | subscribe  | publish video | denied   |
```

## Step Definitions

```java
public class RoomSteps {
    private final ContainerStateManager containers = ContainerStateManager.getInstance();
    private final RoomClientStateManager roomClient = new RoomClientStateManager();

    @Given("the LiveKit server is running")
    public void livekitServerIsRunning() {
        containers.startAll();
    }

    @When("I create a room named {string}")
    public void createRoom(String roomName) {
        ScenarioContext.set("roomName", roomName);
        ScenarioContext.set("token", roomClient.createToken(roomName, "user1"));
    }

    @Then("the room should be created")
    public void roomShouldBeCreated() {
        assertThat(ScenarioContext.get("token")).isNotNull();
    }
}
```

## Cucumber Hooks

```java
public class CucumberHooks {
    @Before
    public void beforeScenario(Scenario scenario) {
        log.info("Starting: {}", scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        if (scenario.isFailed()) {
            captureScreenshot(scenario);
        }
        WebDriverStateManager.getInstance().cleanup();
    }

    @Before("@browser")
    public void setupBrowser() {
        WebDriverStateManager.getInstance().getDriver();
    }
}
```

## State Sharing

```java
public class ScenarioContext {
    private static final ThreadLocal<Map<String, Object>> context =
        ThreadLocal.withInitial(HashMap::new);

    public static void set(String key, Object value) {
        context.get().put(key, value);
    }

    public static <T> T get(String key) {
        return (T) context.get().get(key);
    }

    public static void clear() {
        context.get().clear();
    }
}
```

## Tag Usage

| Tag | Purpose |
|-----|---------|
| `@smoke` | Quick sanity tests |
| `@regression` | Full test suite |
| `@browser` | Requires WebDriver |
| `@wip` | Work in progress |
