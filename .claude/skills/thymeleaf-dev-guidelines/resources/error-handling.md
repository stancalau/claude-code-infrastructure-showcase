# Error Handling

## Error Page Configuration

### Application Properties

```yaml
server:
  error:
    whitelabel:
      enabled: false
    include-message: always
    include-binding-errors: always
    include-stacktrace: never
    include-exception: false
```

---

## Custom Error Pages

### Error Directory Structure

```
src/main/resources/templates/error/
├── 400.html
├── 403.html
├── 404.html
├── 500.html
└── error.html    # Fallback for unhandled codes
```

### 404 Not Found

```html
<!-- error/404.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{error.404.title}">Page Not Found</title>
</head>
<body>
<main>
    <div class="container text-center py-5">
        <h1 class="display-1 text-muted">404</h1>
        <h2 th:text="#{error.404.title}">Page Not Found</h2>
        <p class="lead" th:text="#{error.404.message}">
            The page you are looking for does not exist.
        </p>
        <a th:href="@{/}" class="btn btn-primary">
            <span th:text="#{button.backToHome}">Back to Home</span>
        </a>
    </div>
</main>
</body>
</html>
```

### 403 Access Denied

```html
<!-- error/403.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{error.403.title}">Access Denied</title>
</head>
<body>
<main>
    <div class="container text-center py-5">
        <h1 class="display-1 text-danger">403</h1>
        <h2 th:text="#{error.403.title}">Access Denied</h2>
        <p class="lead" th:text="#{error.403.message}">
            You do not have permission to access this page.
        </p>
        <div class="mt-4">
            <a th:href="@{/}" class="btn btn-primary me-2">
                <span th:text="#{button.backToHome}">Home</span>
            </a>
            <a th:href="@{/login}" class="btn btn-outline-secondary">
                <span th:text="#{nav.login}">Login</span>
            </a>
        </div>
    </div>
</main>
</body>
</html>
```

### 500 Server Error

```html
<!-- error/500.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{error.500.title}">Server Error</title>
</head>
<body>
<main>
    <div class="container text-center py-5">
        <h1 class="display-1 text-warning">500</h1>
        <h2 th:text="#{error.500.title}">Server Error</h2>
        <p class="lead" th:text="#{error.500.message}">
            An unexpected error occurred. Please try again later.
        </p>
        <p class="text-muted" th:if="${timestamp}">
            Error ID: <code th:text="${timestamp}">timestamp</code>
        </p>
        <a th:href="@{/}" class="btn btn-primary">
            <span th:text="#{button.backToHome}">Back to Home</span>
        </a>
    </div>
</main>
</body>
</html>
```

### Generic Error Page

```html
<!-- error/error.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{error.generic.title}">Error</title>
</head>
<body>
<main>
    <div class="container text-center py-5">
        <h1 class="display-1 text-muted" th:text="${status ?: '?'}">Error</h1>
        <h2 th:text="${error ?: #{error.generic.title}}">An Error Occurred</h2>
        <p class="lead" th:text="${message ?: #{error.generic.message}}">
            Something went wrong.
        </p>
        <a th:href="@{/}" class="btn btn-primary">
            <span th:text="#{button.backToHome}">Back to Home</span>
        </a>
    </div>
</main>
</body>
</html>
```

---

## Custom Error Controller

```java
@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            model.addAttribute("status", statusCode);
            model.addAttribute("message", message);

            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                return "error/404";
            } else if (statusCode == HttpStatus.FORBIDDEN.value()) {
                return "error/403";
            } else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                return "error/500";
            }
        }

        return "error/error";
    }
}
```

---

## Form Validation Error Display

### Field-Level Errors

```html
<div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input type="email" id="email" th:field="*{email}"
           class="form-control"
           th:classappend="${#fields.hasErrors('email')} ? 'is-invalid'">
    <div th:if="${#fields.hasErrors('email')}" class="invalid-feedback">
        <span th:errors="*{email}">Email error</span>
    </div>
</div>
```

### All Field Errors at Top

```html
<div th:if="${#fields.hasAnyErrors()}" class="alert alert-danger">
    <h5 class="alert-heading">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Please correct the following errors:
    </h5>
    <ul class="mb-0">
        <li th:each="error : ${#fields.allErrors()}" th:text="${error}">Error</li>
    </ul>
</div>
```

### Global Errors (Non-Field)

```html
<div th:if="${#fields.hasGlobalErrors()}" class="alert alert-danger">
    <ul class="mb-0">
        <li th:each="error : ${#fields.globalErrors()}" th:text="${error}">
            Global error
        </li>
    </ul>
</div>
```

---

## Exception Handler for Views

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public String handleNotFound(ResourceNotFoundException ex, Model model) {
        model.addAttribute("message", ex.getMessage());
        return "error/404";
    }

    @ExceptionHandler(AccessDeniedException.class)
    public String handleAccessDenied(AccessDeniedException ex, Model model) {
        model.addAttribute("message", ex.getMessage());
        return "error/403";
    }

    @ExceptionHandler(Exception.class)
    public String handleGeneric(Exception ex, Model model) {
        model.addAttribute("message", "An unexpected error occurred");
        model.addAttribute("timestamp", System.currentTimeMillis());
        return "error/500";
    }
}
```

---

## Flash Messages for User Feedback

### Controller

```java
@PostMapping
public String create(@Valid UserForm form,
                    BindingResult result,
                    RedirectAttributes ra) {
    if (result.hasErrors()) {
        return "admin/users/form";
    }

    try {
        userService.create(form);
        ra.addFlashAttribute("successMessage", "User created successfully");
    } catch (DuplicateEmailException e) {
        ra.addFlashAttribute("errorMessage", "Email already exists");
        return "redirect:/users/new";
    }

    return "redirect:/users";
}
```

### Alert Fragment

```html
<!-- fragments/alerts.html -->
<th:block th:fragment="alerts">
    <div th:if="${successMessage}" class="alert alert-success alert-dismissible fade show">
        <i class="bi bi-check-circle me-2"></i>
        <span th:text="${successMessage}">Success</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>

    <div th:if="${errorMessage}" class="alert alert-danger alert-dismissible fade show">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <span th:text="${errorMessage}">Error</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>

    <div th:if="${warningMessage}" class="alert alert-warning alert-dismissible fade show">
        <i class="bi bi-exclamation-circle me-2"></i>
        <span th:text="${warningMessage}">Warning</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
</th:block>
```

### Include in Layout

```html
<main class="container py-4">
    <th:block th:replace="~{fragments/alerts :: alerts}"></th:block>
    <th:block th:replace="${content}">Content</th:block>
</main>
```

---

## AJAX/HTMX Error Handling

### Error Response Fragment

```html
<!-- fragments/errors.html -->
<th:block th:fragment="validation-errors">
    <div class="alert alert-danger">
        <ul class="mb-0">
            <li th:each="error : ${errors}" th:text="${error.defaultMessage}">Error</li>
        </ul>
    </div>
</th:block>
```

### Controller for HTMX

```java
@PostMapping
public String create(@Valid UserForm form,
                    BindingResult result,
                    Model model) {
    if (result.hasErrors()) {
        model.addAttribute("errors", result.getAllErrors());
        return "fragments/errors :: validation-errors";
    }

    User user = userService.create(form);
    model.addAttribute("user", user);
    return "admin/users/fragments :: user-row";
}
```

---

## Security Error Pages

### Security Configuration

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .exceptionHandling(ex -> ex
            .accessDeniedPage("/error/403")
            .authenticationEntryPoint((request, response, authException) -> {
                response.sendRedirect("/login?error=unauthorized");
            })
        )
        .build();
}
```

---

## Best Practices

### DO

- Create custom error pages for common HTTP status codes
- Use flash messages for user feedback after redirects
- Display validation errors near the relevant fields
- Log exceptions server-side with unique identifiers
- Provide helpful error messages to users
- Include "back to home" navigation on error pages

### DON'T

- Expose stack traces to users
- Show technical error messages
- Leave default whitelabel error page enabled
- Forget to handle validation errors in forms
- Ignore global/non-field errors
