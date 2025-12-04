# Complete Examples - End-to-End Implementation

## Full Container Setup

```java
@Slf4j
public class ContainerStateManager {
    private static ContainerStateManager instance;
    private Network network;
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
        log.info("Starting containers...");
        network = Network.newNetwork();

        redis = new RedisContainer()
            .withNetwork(network)
            .withNetworkAliases("redis");
        redis.start();

        livekit = new LiveKitContainer("v1.5.0")
            .withNetwork(network)
            .withNetworkAliases("livekit");
        livekit.start();

        minio = new MinIOContainer()
            .withNetwork(network)
            .withNetworkAliases("minio");
        minio.start();

        log.info("All containers started");
    }

    public void stopAll() {
        Stream.of(livekit, redis, minio)
            .filter(Objects::nonNull)
            .forEach(container -> {
                try { container.stop(); }
                catch (Exception e) { log.warn("Stop failed: {}", e.getMessage()); }
            });
        if (network != null) network.close();
        log.info("All containers stopped");
    }
}
```

## Complete Feature File

```gherkin
@room
Feature: Room Operations

  Background:
    Given LiveKit server is running
    And I have admin credentials

  @smoke
  Scenario: Publisher joins and streams
    Given a room "test-room" exists
    When publisher joins with video permission
    And publisher starts streaming
    Then video track should be visible
    And room should have 1 participant

  @regression
  Scenario: Multiple participants
    Given a room "multi-room" exists
    When publisher joins with video permission
    And subscriber joins with subscribe permission
    Then both should be connected
    And subscriber should see publisher's video
```

## Complete Step Definitions

```java
@Slf4j
public class RoomSteps {
    private final ContainerStateManager containers = ContainerStateManager.getInstance();
    private final WebDriverStateManager webDriver = WebDriverStateManager.getInstance();
    private final TokenService tokenService = new TokenService("devkey", "secret");

    @Given("LiveKit server is running")
    public void livekitRunning() {
        containers.startAll();
        log.info("LiveKit at: {}", containers.getLiveKitUrl());
    }

    @Given("a room {string} exists")
    public void roomExists(String roomName) {
        ScenarioContext.set("roomName", roomName);
    }

    @When("publisher joins with video permission")
    public void publisherJoins() {
        String room = ScenarioContext.get("roomName");
        String token = tokenService.createToken(room, "publisher",
            List.of(Permission.ROOM_JOIN, Permission.CAN_PUBLISH));

        LiveKitMeet page = new LiveKitMeet(webDriver.getDriver());
        page.joinRoom(containers.getLiveKitUrl(), token);
        ScenarioContext.set("publisherPage", page);
    }

    @Then("video track should be visible")
    public void videoVisible() {
        LiveKitMeet page = ScenarioContext.get("publisherPage");
        assertThat(page.isVideoVisible()).isTrue();
    }

    @After
    public void cleanup() {
        webDriver.cleanup();
        ScenarioContext.clear();
    }
}
```

## Complete Cucumber Hooks

```java
@Slf4j
public class CucumberHooks {
    @BeforeAll
    public static void globalSetup() {
        ContainerStateManager.getInstance().startAll();
    }

    @AfterAll
    public static void globalTeardown() {
        ContainerStateManager.getInstance().stopAll();
    }

    @Before
    public void beforeScenario(Scenario scenario) {
        log.info("=== Starting: {} ===", scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        if (scenario.isFailed()) {
            WebDriver driver = WebDriverStateManager.getInstance().getDriver();
            if (driver != null) {
                byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
                scenario.attach(screenshot, "image/png", "failure-screenshot");
            }
        }
        WebDriverStateManager.getInstance().cleanup();
        ScenarioContext.clear();
        log.info("=== Finished: {} - {} ===", scenario.getName(), scenario.getStatus());
    }
}
```
