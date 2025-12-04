# Containers Guide - TestContainers Patterns

## LiveKit Container

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

    public String getApiUrl() {
        return String.format("http://%s:%d", getHost(), getMappedPort(7880));
    }
}
```

## Redis Container

```java
public class RedisContainer extends GenericContainer<RedisContainer> {
    public RedisContainer() {
        super(DockerImageName.parse("redis:7-alpine"));
        withExposedPorts(6379);
        waitingFor(Wait.forListeningPort());
    }

    public String getRedisUrl() {
        return String.format("redis://%s:%d", getHost(), getMappedPort(6379));
    }
}
```

## MinIO Container

```java
public class MinIOContainer extends GenericContainer<MinIOContainer> {
    public MinIOContainer() {
        super(DockerImageName.parse("minio/minio:latest"));
        withExposedPorts(9000, 9001);
        withEnv("MINIO_ROOT_USER", "minioadmin");
        withEnv("MINIO_ROOT_PASSWORD", "minioadmin");
        withCommand("server", "/data", "--console-address", ":9001");
        waitingFor(Wait.forHttp("/minio/health/ready").forPort(9000));
    }
}
```

## Wait Strategies

| Strategy | Use Case |
|----------|----------|
| `Wait.forHttp("/health")` | HTTP health endpoint |
| `Wait.forLogMessage(".*Started.*", 1)` | Log message |
| `Wait.forListeningPort()` | Port listening |
| `Wait.forHealthcheck()` | Docker healthcheck |

## Network Configuration

```java
Network network = Network.newNetwork();

livekit.withNetwork(network).withNetworkAliases("livekit");
redis.withNetwork(network).withNetworkAliases("redis");
```

## Best Practices

- Always use wait strategies
- Clean up containers after tests
- Use singleton pattern for shared containers
- Log container status for debugging
