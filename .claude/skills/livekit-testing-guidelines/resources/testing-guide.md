# Testing Guide - Unit and Integration Tests

## Unit Tests for Containers

```java
class LiveKitContainerTest {
    @Test
    void shouldStartAndExposePort() {
        try (LiveKitContainer livekit = new LiveKitContainer("v1.5.0")) {
            livekit.start();

            assertThat(livekit.isRunning()).isTrue();
            assertThat(livekit.getMappedPort(7880)).isNotNull();
            assertThat(livekit.getWsUrl()).startsWith("ws://");
        }
    }

    @Test
    void shouldProvideApiUrl() {
        try (LiveKitContainer livekit = new LiveKitContainer("v1.5.0")) {
            livekit.start();

            assertThat(livekit.getApiUrl()).startsWith("http://");
        }
    }
}
```

## Unit Tests for Token Service

```java
class TokenServiceTest {
    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService("devkey", "secret");
    }

    @Test
    void shouldCreateValidToken() {
        String token = tokenService.createToken("room-1", "user1",
            List.of(Permission.ROOM_JOIN, Permission.CAN_PUBLISH));

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // JWT format
    }
}
```

## Integration Tests with Cucumber

```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "ro.stancalau.test.bdd.steps")
public class CucumberTestRunner {
}
```

## Running Tests

```bash
# All tests
./gradlew test

# Cucumber only
./gradlew test --tests "*Cucumber*"

# By tag
./gradlew test -Dcucumber.filter.tags="@smoke"

# Specific feature
./gradlew test -Dcucumber.features=src/test/resources/features/room.feature
```

## Test Configuration

### junit-platform.properties

```properties
cucumber.plugin=pretty,html:build/reports/cucumber/report.html
cucumber.glue=ro.stancalau.test.bdd.steps
cucumber.features=src/test/resources/features
cucumber.filter.tags=not @wip
```

### Gradle Configuration

```groovy
test {
    useJUnitPlatform()
    systemProperty "cucumber.junit-platform.naming-strategy", "long"

    testLogging {
        events "passed", "skipped", "failed"
    }
}
```

## Test Reports

- JUnit: `build/reports/tests/test/index.html`
- Cucumber: `build/reports/cucumber/report.html`
- VNC recordings: `build/recordings/`
