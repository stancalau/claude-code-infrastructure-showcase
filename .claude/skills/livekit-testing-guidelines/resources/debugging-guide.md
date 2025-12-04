# Debugging Guide - Troubleshooting Tests

## Container Debugging

### Container Won't Start

```java
// Check container logs
log.error("Container logs:\n{}", container.getLogs());

// Check Docker daemon
// docker ps -a

// Check image availability
// docker pull livekit/livekit-server:v1.5.0
```

### Port Mapping Issues

```java
// Use getMappedPort(), not the exposed port
int actualPort = container.getMappedPort(7880);
String url = String.format("http://%s:%d", container.getHost(), actualPort);
```

### Wait Strategy Timeout

```java
// Increase timeout
waitingFor(Wait.forHttp("/health")
    .forPort(8080)
    .withStartupTimeout(Duration.ofMinutes(2)));
```

## WebDriver Debugging

### Screenshot on Failure

```java
@After
public void captureOnFailure(Scenario scenario) {
    if (scenario.isFailed()) {
        byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
        scenario.attach(screenshot, "image/png", "failure");
    }
}
```

### Browser Console Logs

```java
LogEntries logs = driver.manage().logs().get(LogType.BROWSER);
for (LogEntry entry : logs) {
    log.info("Browser: {} - {}", entry.getLevel(), entry.getMessage());
}
```

### Current Page State

```java
log.info("URL: {}", driver.getCurrentUrl());
log.info("Title: {}", driver.getTitle());
log.debug("Page source:\n{}", driver.getPageSource());
```

## BDD Scenario Debugging

### Step Not Found

- Check step definition regex
- Verify glue path configuration
- Look for undefined steps in output

### State Not Shared

- Use ScenarioContext correctly
- Clear state between scenarios
- Check thread safety

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Container timeout | Slow image pull | Pre-pull images |
| WebRTC media fail | No fake devices | Add Chrome flags |
| Step undefined | Wrong glue path | Check configuration |
| Port conflict | Container not stopped | Add cleanup hooks |

## Logging Configuration

```xml
<logger name="ro.stancalau.test" level="DEBUG"/>
<logger name="org.testcontainers" level="INFO"/>
<logger name="org.openqa.selenium" level="WARN"/>
```
