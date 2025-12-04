# Selenium Configuration - WebDriver Setup

## Chrome Options for WebRTC

```java
public class SeleniumConfig {
    public static ChromeOptions buildOptions(boolean headless) {
        ChromeOptions options = new ChromeOptions();

        // Fake media devices for WebRTC testing
        options.addArguments("--use-fake-ui-for-media-stream");
        options.addArguments("--use-fake-device-for-media-stream");

        // Optional: Use specific test video/audio
        options.addArguments("--use-file-for-fake-video-capture=/path/to/video.y4m");
        options.addArguments("--use-file-for-fake-audio-capture=/path/to/audio.wav");

        if (headless) {
            options.addArguments("--headless=new");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
        }

        // Window size
        options.addArguments("--window-size=1920,1080");

        return options;
    }
}
```

## WebDriver Creation

```java
@Slf4j
public class WebDriverFactory {
    public WebDriver createDriver(boolean headless) {
        log.info("Creating WebDriver (headless={})", headless);

        ChromeOptions options = SeleniumConfig.buildOptions(headless);
        WebDriver driver = new ChromeDriver(options);

        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));

        log.info("WebDriver created successfully");
        return driver;
    }
}
```

## VNC Recording

```java
public class VncRecordingConfig {
    public enum RecordingMode {
        SKIP,           // Never record
        RECORD_FAILED,  // Record only failed tests
        RECORD_ALL      // Record all tests
    }

    private final RecordingMode mode;
    private final Path outputDir;

    public boolean shouldRecord(boolean testFailed) {
        return switch (mode) {
            case SKIP -> false;
            case RECORD_FAILED -> testFailed;
            case RECORD_ALL -> true;
        };
    }
}
```

## BrowserContainer (Selenium Grid)

```java
public class BrowserContainer extends BrowserWebDriverContainer<BrowserContainer> {
    public BrowserContainer() {
        super();
        withCapabilities(SeleniumConfig.buildOptions(true));
        withRecordingMode(VncRecordingMode.RECORD_FAILING,
            new File("./build/recordings"));
    }
}
```

## Best Practices

- Always use fake media streams for WebRTC
- Set appropriate timeouts
- Use headless mode in CI/CD
- Configure VNC recording for debugging
- Clean up drivers after tests
