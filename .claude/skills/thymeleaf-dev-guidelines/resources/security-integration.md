# Security Integration

## Spring Security Thymeleaf Extras

### Maven Dependency

```xml
<dependency>
    <groupId>org.thymeleaf.extras</groupId>
    <artifactId>thymeleaf-extras-springsecurity6</artifactId>
</dependency>
```

### Namespace Declaration

```html
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
```

---

## Authentication Status

### Check If Authenticated

```html
<div sec:authorize="isAuthenticated()">
    <p>Welcome, <span sec:authentication="name">Username</span>!</p>
</div>

<div sec:authorize="!isAuthenticated()">
    <p>Please <a th:href="@{/login}">login</a> to continue.</p>
</div>
```

### Display User Information

```html
<span sec:authentication="name">Username</span>

<span sec:authentication="principal.email">user@example.com</span>

<span sec:authentication="principal.authorities">ROLE_USER, ROLE_ADMIN</span>
```

---

## Role-Based Authorization

### Single Role Check

```html
<div sec:authorize="hasRole('ADMIN')">
    <a th:href="@{/admin}" class="btn btn-danger">Admin Panel</a>
</div>

<div sec:authorize="hasRole('USER')">
    <p>You have user access</p>
</div>
```

### Multiple Roles (OR)

```html
<div sec:authorize="hasAnyRole('ADMIN', 'MANAGER')">
    <a th:href="@{/reports}">View Reports</a>
</div>
```

### Multiple Roles (AND)

```html
<div sec:authorize="hasRole('ADMIN') and hasRole('SUPER_ADMIN')">
    <a th:href="@{/system-settings}">System Settings</a>
</div>
```

---

## Permission-Based Authorization

### Authority Check

```html
<div sec:authorize="hasAuthority('WRITE_USERS')">
    <a th:href="@{/users/new}" class="btn btn-primary">Add User</a>
</div>

<div sec:authorize="hasAnyAuthority('READ_REPORTS', 'WRITE_REPORTS')">
    <a th:href="@{/reports}">Reports</a>
</div>
```

### Complex Expressions

```html
<div sec:authorize="hasRole('ADMIN') or (hasRole('MANAGER') and hasAuthority('APPROVE_REQUESTS'))">
    <button type="button" class="btn btn-success">Approve Request</button>
</div>
```

---

## Conditional Navigation

```html
<!-- fragments/navigation.html -->
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <a class="navbar-brand" th:href="@{/}">App Name</a>

        <div class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/}">Home</a>
                </li>

                <li class="nav-item" sec:authorize="isAuthenticated()">
                    <a class="nav-link" th:href="@{/dashboard}">Dashboard</a>
                </li>

                <li class="nav-item" sec:authorize="hasRole('ADMIN')">
                    <a class="nav-link" th:href="@{/admin}">Admin</a>
                </li>

                <li class="nav-item dropdown" sec:authorize="hasAnyRole('ADMIN', 'MANAGER')">
                    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                        Management
                    </a>
                    <ul class="dropdown-menu">
                        <li sec:authorize="hasAuthority('READ_USERS')">
                            <a class="dropdown-item" th:href="@{/users}">Users</a>
                        </li>
                        <li sec:authorize="hasAuthority('READ_REPORTS')">
                            <a class="dropdown-item" th:href="@{/reports}">Reports</a>
                        </li>
                    </ul>
                </li>
            </ul>

            <ul class="navbar-nav">
                <li class="nav-item" sec:authorize="!isAuthenticated()">
                    <a class="nav-link" th:href="@{/login}">Login</a>
                </li>

                <li class="nav-item dropdown" sec:authorize="isAuthenticated()">
                    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                        <span sec:authentication="name">User</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" th:href="@{/profile}">Profile</a></li>
                        <li><a class="dropdown-item" th:href="@{/settings}">Settings</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <form th:action="@{/logout}" method="post" class="d-inline">
                                <button type="submit" class="dropdown-item">Logout</button>
                            </form>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>
```

---

## CSRF Protection

### Automatic Token (Spring Security enabled)

```html
<!-- Automatically included in forms with th:action -->
<form th:action="@{/users}" method="post">
    <!-- Hidden CSRF input added automatically -->
    <button type="submit">Submit</button>
</form>
```

### Manual CSRF Token

```html
<form action="/api/users" method="post">
    <input type="hidden"
           th:name="${_csrf.parameterName}"
           th:value="${_csrf.token}">
    <button type="submit">Submit</button>
</form>
```

### CSRF for AJAX Requests

```html
<head>
    <meta name="_csrf" th:content="${_csrf.token}">
    <meta name="_csrf_header" th:content="${_csrf.headerName}">
</head>
```

```javascript
const token = document.querySelector('meta[name="_csrf"]').content;
const header = document.querySelector('meta[name="_csrf_header"]').content;

fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        [header]: token
    },
    body: JSON.stringify(data)
});
```

---

## Login Page

```html
<!-- auth/login.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/auth-base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{login.title}">Login</title>
</head>
<body>
<main>
    <div class="card" style="max-width: 400px; margin: 0 auto;">
        <div class="card-body">
            <h3 class="card-title text-center mb-4" th:text="#{login.heading}">Sign In</h3>

            <div th:if="${param.error}" class="alert alert-danger">
                <span th:text="#{login.error.invalid}">Invalid username or password</span>
            </div>

            <div th:if="${param.logout}" class="alert alert-success">
                <span th:text="#{login.logout.success}">You have been logged out</span>
            </div>

            <form th:action="@{/login}" method="post">
                <div class="mb-3">
                    <label for="username" class="form-label"
                           th:text="#{login.username}">Username</label>
                    <input type="text" id="username" name="username"
                           class="form-control" required autofocus>
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label"
                           th:text="#{login.password}">Password</label>
                    <input type="password" id="password" name="password"
                           class="form-control" required>
                </div>

                <div class="mb-3 form-check">
                    <input type="checkbox" id="remember-me" name="remember-me"
                           class="form-check-input">
                    <label for="remember-me" class="form-check-label"
                           th:text="#{login.rememberMe}">Remember me</label>
                </div>

                <button type="submit" class="btn btn-primary w-100"
                        th:text="#{login.submit}">Sign In</button>
            </form>

            <div class="text-center mt-3">
                <a th:href="@{/forgot-password}" th:text="#{login.forgotPassword}">
                    Forgot password?
                </a>
            </div>
        </div>
    </div>
</main>
</body>
</html>
```

---

## Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/about", "/contact").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                .requestMatchers("/webjars/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .rememberMe(remember -> remember
                .key("uniqueAndSecret")
                .tokenValiditySeconds(86400)
            )
            .build();
    }
}
```

---

## Secure Delete Buttons

```html
<td>
    <a th:href="@{/users/{id}(id=${user.id})}" class="btn btn-sm btn-info">View</a>
    <a th:href="@{/users/{id}/edit(id=${user.id})}" class="btn btn-sm btn-warning"
       sec:authorize="hasAuthority('WRITE_USERS')">Edit</a>

    <form th:action="@{/users/{id}(id=${user.id})}" method="post"
          class="d-inline" sec:authorize="hasAuthority('DELETE_USERS')"
          onsubmit="return confirm('Are you sure?');">
        <input type="hidden" name="_method" value="delete">
        <button type="submit" class="btn btn-sm btn-danger">Delete</button>
    </form>
</td>
```

---

## Best Practices

### DO

- Always use CSRF tokens in forms
- Use `sec:authorize` for UI element visibility
- Implement proper logout with POST
- Use Spring Security's built-in login page features
- Combine with method-level security (`@PreAuthorize`)
- Display appropriate error messages on login failure

### DON'T

- Hide menu items without server-side security
- Use GET for logout
- Store sensitive data in hidden fields
- Trust client-side security alone
- Expose security exceptions to users
