# State Management - Lifecycle Coordination

## Container State Manager

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
        log.info("Starting all containers...");
        redis = new RedisContainer();
        redis.start();

        livekit = new LiveKitContainer("v1.5.0");
        livekit.start();

        minio = new MinIOContainer();
        minio.start();
        log.info("All containers started");
    }

    public void stopAll() {
        Stream.of(livekit, redis, minio)
            .filter(Objects::nonNull)
            .forEach(GenericContainer::stop);
        log.info("All containers stopped");
    }

    public String getLiveKitUrl() {
        return livekit.getWsUrl();
    }

    public boolean isLiveKitRunning() {
        return livekit != null && livekit.isRunning();
    }
}
```

## WebDriver State Manager

```java
@Slf4j
public class WebDriverStateManager {
    private static WebDriverStateManager instance;
    private WebDriver driver;

    public static synchronized WebDriverStateManager getInstance() {
        if (instance == null) {
            instance = new WebDriverStateManager();
        }
        return instance;
    }

    public WebDriver getDriver() {
        if (driver == null) {
            driver = createDriver();
        }
        return driver;
    }

    public void cleanup() {
        if (driver != null) {
            driver.quit();
            driver = null;
            log.info("WebDriver cleaned up");
        }
    }

    private WebDriver createDriver() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--use-fake-ui-for-media-stream");
        options.addArguments("--use-fake-device-for-media-stream");
        return new ChromeDriver(options);
    }
}
```

## Room Client State Manager

```java
@Slf4j
public class RoomClientStateManager {
    private static final String API_KEY = "devkey";
    private static final String API_SECRET = "secret";

    public String createToken(String room, String identity, List<Permission> perms) {
        AccessToken token = new AccessToken(API_KEY, API_SECRET);
        token.setIdentity(identity);

        VideoGrant grant = new VideoGrant();
        grant.setRoom(room);
        grant.setRoomJoin(perms.contains(Permission.ROOM_JOIN));
        grant.setCanPublish(perms.contains(Permission.CAN_PUBLISH));

        token.addGrant(grant);
        return token.toJwt();
    }
}
```

## Singleton Pattern

All state managers use singleton pattern:
- Single instance across all tests
- Consistent state management
- Resource reuse
- Proper cleanup coordination

## Lifecycle Hooks

```java
@BeforeAll
static void globalSetup() {
    ContainerStateManager.getInstance().startAll();
}

@AfterAll
static void globalTeardown() {
    ContainerStateManager.getInstance().stopAll();
}

@After
void scenarioCleanup() {
    WebDriverStateManager.getInstance().cleanup();
}
```
