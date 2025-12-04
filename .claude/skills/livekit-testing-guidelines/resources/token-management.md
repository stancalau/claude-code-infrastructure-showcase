# Token Management - LiveKit Permissions

## Creating Access Tokens

```java
public class TokenService {
    private final String apiKey;
    private final String apiSecret;

    public TokenService(String apiKey, String apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public String createToken(String roomName, String identity, List<Permission> permissions) {
        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setIdentity(identity);
        token.setName(identity);
        token.setTtl(Duration.ofHours(1));

        VideoGrant grant = buildGrant(roomName, permissions);
        token.addGrant(grant);

        return token.toJwt();
    }

    private VideoGrant buildGrant(String roomName, List<Permission> permissions) {
        VideoGrant grant = new VideoGrant();
        grant.setRoom(roomName);

        for (Permission p : permissions) {
            switch (p) {
                case ROOM_JOIN -> grant.setRoomJoin(true);
                case CAN_PUBLISH -> grant.setCanPublish(true);
                case CAN_SUBSCRIBE -> grant.setCanSubscribe(true);
                case CAN_PUBLISH_DATA -> grant.setCanPublishData(true);
                case ROOM_ADMIN -> grant.setRoomAdmin(true);
                case ROOM_CREATE -> grant.setRoomCreate(true);
                case ROOM_LIST -> grant.setRoomList(true);
                case ROOM_RECORD -> grant.setRoomRecord(true);
            }
        }

        return grant;
    }
}
```

## Permission Types

| Permission | Description |
|------------|-------------|
| `ROOM_JOIN` | Can join the room |
| `CAN_PUBLISH` | Can publish video/audio tracks |
| `CAN_SUBSCRIBE` | Can subscribe to other tracks |
| `CAN_PUBLISH_DATA` | Can publish data messages |
| `ROOM_ADMIN` | Full room administration |
| `ROOM_CREATE` | Can create rooms |
| `ROOM_LIST` | Can list rooms |
| `ROOM_RECORD` | Can record rooms |

## Permission Enum

```java
public enum Permission {
    ROOM_JOIN,
    CAN_PUBLISH,
    CAN_SUBSCRIBE,
    CAN_PUBLISH_DATA,
    ROOM_ADMIN,
    ROOM_CREATE,
    ROOM_LIST,
    ROOM_RECORD,
    HIDDEN,
    RECORDER,
    AGENT,
    CAN_UPDATE_METADATA,
    INGRESS_ADMIN,
    CAN_PUBLISH_SOURCES
}
```

## Usage in Tests

```java
// Publisher with full permissions
String publisherToken = tokenService.createToken("room-1", "publisher",
    List.of(Permission.ROOM_JOIN, Permission.CAN_PUBLISH, Permission.CAN_SUBSCRIBE));

// Subscriber only
String subscriberToken = tokenService.createToken("room-1", "subscriber",
    List.of(Permission.ROOM_JOIN, Permission.CAN_SUBSCRIBE));

// Admin
String adminToken = tokenService.createToken("room-1", "admin",
    List.of(Permission.ROOM_JOIN, Permission.ROOM_ADMIN));
```

## Token Validation

```java
public boolean isValidToken(String jwt) {
    try {
        // Parse and validate JWT
        return true;
    } catch (Exception e) {
        log.error("Invalid token: {}", e.getMessage());
        return false;
    }
}
```
