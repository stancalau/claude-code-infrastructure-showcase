# Page Objects - Selenium WebRTC Automation

## Basic Page Object Pattern

```java
@Slf4j
public class LiveKitMeet {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public LiveKitMeet(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    public void joinRoom(String url, String token) {
        driver.get(url + "?token=" + token);
        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-room-connected='true']")));
        log.info("Joined room successfully");
    }

    public void publishVideo() {
        WebElement btn = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("publish-video")));
        btn.click();
        log.info("Video published");
    }

    public boolean isConnected() {
        return driver.findElements(
            By.cssSelector("[data-room-connected='true']")).size() > 0;
    }
}
```

## WebRTC Publish Page

```java
@Slf4j
public class WebrtcPublish {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public void startPublishing() {
        WebElement startBtn = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("start-publish")));
        startBtn.click();
    }

    public void stopPublishing() {
        WebElement stopBtn = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("stop-publish")));
        stopBtn.click();
    }

    public boolean isPublishing() {
        return driver.findElements(By.cssSelector(".publishing")).size() > 0;
    }
}
```

## Locator Strategies

| Strategy | Example | Use Case |
|----------|---------|----------|
| `By.id()` | `By.id("join-btn")` | Unique elements |
| `By.cssSelector()` | `By.cssSelector("[data-testid='video']")` | Data attributes |
| `By.xpath()` | `By.xpath("//button[text()='Join']")` | Text matching |

## Wait Patterns

```java
// Wait for element visible
wait.until(ExpectedConditions.visibilityOfElementLocated(locator));

// Wait for element clickable
wait.until(ExpectedConditions.elementToBeClickable(locator));

// Wait for text
wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, "Connected"));
```

## Best Practices

- Never use Thread.sleep()
- Always use explicit waits
- Log actions for debugging
- Keep page objects focused
- Don't expose WebDriver directly
