---
name: thymeleaf-dev-guidelines
description: Comprehensive Thymeleaf UI development guide for Spring Boot 3.x applications. Use when creating HTML templates, layouts, fragments, forms, or working with server-side rendering. Covers template organization, fragment reuse, layout patterns, form handling, internationalization, Spring Security integration, and best practices for modern Thymeleaf development.
---

# Thymeleaf Development Guidelines - Spring Boot 3.x

## Purpose

Establish consistency and best practices for Thymeleaf-based server-side rendered UIs in Spring Boot applications, following modern patterns with Bootstrap 5, HTMX integration, and Spring Security.

## When to Use This Skill

Automatically activates when working on:
- Creating or modifying HTML templates (`.html` files in templates/)
- Building layouts and reusable fragments
- Implementing forms with validation
- Working with Spring MVC view controllers
- Integrating Spring Security with views
- Adding internationalization (i18n)
- Implementing HTMX for dynamic content

---

## Quick Start

### New Page Checklist

- [ ] **Template**: HTML file in `templates/` with Thymeleaf namespace
- [ ] **Controller**: `@Controller` with model attributes
- [ ] **Layout**: Extend base layout using fragments
- [ ] **Navigation**: Update navigation fragment if needed
- [ ] **Security**: Add `@PreAuthorize` or Thymeleaf security tags
- [ ] **i18n**: Use `#{message.key}` for all text
- [ ] **Forms**: Use proper binding with `th:object` and `th:field`

### New Application UI Checklist

- [ ] Base layout template with common structure
- [ ] Navigation fragment with active state handling
- [ ] Footer fragment with common content
- [ ] Error pages (404, 500, error)
- [ ] Form validation error display
- [ ] Flash message handling (success/error)
- [ ] CSS/JS asset organization
- [ ] Security integration for conditional display

---

## Architecture Overview

### Template Organization

```
src/main/resources/
├── templates/
│   ├── layout/
│   │   ├── base.html          # Main layout template
│   │   └── admin-base.html    # Admin-specific layout
│   ├── fragments/
│   │   ├── navigation.html    # Main navigation
│   │   ├── footer.html        # Page footer
│   │   ├── alerts.html        # Flash messages
│   │   └── pagination.html    # Pagination controls
│   ├── pages/
│   │   ├── home.html          # Public pages
│   │   ├── about.html
│   │   └── contact.html
│   ├── admin/
│   │   ├── dashboard.html     # Admin dashboard
│   │   └── users/
│   │       ├── list.html
│   │       └── form.html
│   └── error/
│       ├── 404.html
│       ├── 500.html
│       └── error.html
├── static/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── images/
└── messages/
    ├── messages.properties
    └── messages_de.properties
```

**Key Principle:** Separate concerns - layouts, fragments, and page-specific templates.

See [template-organization.md](resources/template-organization.md) for complete details.

---

## Core Principles (7 Key Rules)

### 1. Always Declare Thymeleaf Namespace

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
```

### 2. Use Layouts and Fragments for Reuse

```html
<!-- layout/base.html -->
<!DOCTYPE html>
<html th:fragment="layout(title, content)">
<head>
    <title th:replace="${title}">Default Title</title>
</head>
<body>
    <div th:replace="~{fragments/navigation :: nav}"></div>
    <main th:replace="${content}">Content</main>
    <div th:replace="~{fragments/footer :: footer}"></div>
</body>
</html>

<!-- Using the layout -->
<html th:replace="~{layout/base :: layout(~{::title}, ~{::main})}">
<head><title>My Page</title></head>
<body><main>Page content here</main></body>
</html>
```

### 3. Use th:object for Form Binding

```html
<form th:action="@{/users}" th:object="${userForm}" method="post">
    <input type="text" th:field="*{name}" class="form-control">
    <span th:if="${#fields.hasErrors('name')}"
          th:errors="*{name}" class="text-danger"></span>
    <button type="submit" class="btn btn-primary">Save</button>
</form>
```

### 4. Externalize All Text with i18n

```html
<!-- Never hardcode text -->
<h1 th:text="#{page.home.title}">Welcome</h1>
<button th:text="#{button.save}">Save</button>
<p th:text="#{message.greeting(${user.name})}">Hello, User!</p>
```

### 5. Use Security Extras for Conditional Display

```html
<div sec:authorize="isAuthenticated()">
    <span th:text="${#authentication.name}">Username</span>
</div>
<div sec:authorize="hasRole('ADMIN')">
    <a th:href="@{/admin}">Admin Panel</a>
</div>
<div sec:authorize="!isAuthenticated()">
    <a th:href="@{/login}">Login</a>
</div>
```

### 6. Proper URL Building with th:href

```html
<!-- Static URL -->
<a th:href="@{/users}">Users</a>

<!-- URL with path variable -->
<a th:href="@{/users/{id}(id=${user.id})}">View User</a>

<!-- URL with query parameters -->
<a th:href="@{/users(page=${page}, size=${size})}">Next Page</a>

<!-- Context-relative static resources -->
<link th:href="@{/css/styles.css}" rel="stylesheet">
```

### 7. Controller Returns View Names, Not ResponseEntity

```java
@Controller
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public String list(Model model) {
        model.addAttribute("users", userService.findAll());
        return "admin/users/list";
    }

    @GetMapping("/{id}")
    public String show(@PathVariable Long id, Model model) {
        model.addAttribute("user", userService.findById(id));
        return "admin/users/show";
    }
}
```

---

## Common Patterns

### Flash Messages

```java
@PostMapping
public String create(@Valid UserForm form, RedirectAttributes ra) {
    userService.create(form);
    ra.addFlashAttribute("successMessage", "User created successfully");
    return "redirect:/users";
}
```

```html
<!-- fragments/alerts.html -->
<div th:fragment="alerts">
    <div th:if="${successMessage}" class="alert alert-success" role="alert">
        <span th:text="${successMessage}"></span>
    </div>
    <div th:if="${errorMessage}" class="alert alert-danger" role="alert">
        <span th:text="${errorMessage}"></span>
    </div>
</div>
```

### Iteration with Index

```html
<tr th:each="user, stat : ${users}">
    <td th:text="${stat.index + 1}">1</td>
    <td th:text="${user.name}">Name</td>
    <td th:text="${user.email}">Email</td>
    <td>
        <span th:class="${stat.even ? 'even-row' : 'odd-row'}">
            Row <span th:text="${stat.count}">1</span>
        </span>
    </td>
</tr>
```

### Conditional Classes

```html
<li th:each="item : ${menuItems}"
    th:class="${item.active ? 'nav-item active' : 'nav-item'}">
    <a th:href="${item.url}" th:text="${item.label}">Link</a>
</li>

<!-- Using classappend -->
<div th:classappend="${user.admin ? 'admin-user' : ''}">Content</div>
```

---

## Quick Reference

### Common Thymeleaf Attributes

| Attribute | Purpose |
|-----------|---------|
| `th:text` | Set element text content |
| `th:utext` | Set unescaped HTML content |
| `th:href` | Build URLs |
| `th:src` | Set image/script sources |
| `th:action` | Form action URL |
| `th:object` | Form backing object |
| `th:field` | Form field binding |
| `th:if` / `th:unless` | Conditional rendering |
| `th:each` | Iteration |
| `th:switch` / `th:case` | Switch-case logic |
| `th:fragment` | Define reusable fragment |
| `th:replace` / `th:insert` | Include fragments |
| `th:class` / `th:classappend` | CSS class manipulation |

### Expression Syntax

| Syntax | Purpose | Example |
|--------|---------|---------|
| `${...}` | Variable expression | `${user.name}` |
| `*{...}` | Selection expression | `*{name}` (within th:object) |
| `#{...}` | Message expression | `#{page.title}` |
| `@{...}` | URL expression | `@{/users/{id}(id=1)}` |
| `~{...}` | Fragment expression | `~{fragments/nav :: menu}` |

### Utility Objects

| Object | Purpose |
|--------|---------|
| `#dates` | Date formatting |
| `#numbers` | Number formatting |
| `#strings` | String operations |
| `#lists` | List operations |
| `#sets` | Set operations |
| `#maps` | Map operations |
| `#authentication` | Spring Security principal |
| `#authorization` | Security authorization |

---

## Anti-Patterns to Avoid

- Hardcoded text instead of message properties
- Business logic in templates (use controller/service)
- Inline styles instead of CSS classes
- Direct entity exposure (use DTOs/view models)
- Missing CSRF tokens in forms
- Not escaping user content (XSS vulnerability)
- Monolithic templates without fragments
- Missing error page templates

---

## Navigation Guide

| Need to... | Read this |
|------------|-----------|
| Organize templates | [template-organization.md](resources/template-organization.md) |
| Create layouts | [layouts-and-fragments.md](resources/layouts-and-fragments.md) |
| Build forms | [forms-and-validation.md](resources/forms-and-validation.md) |
| Add security | [security-integration.md](resources/security-integration.md) |
| Internationalize | [internationalization.md](resources/internationalization.md) |
| Use HTMX | [htmx-integration.md](resources/htmx-integration.md) |
| Handle errors | [error-handling.md](resources/error-handling.md) |
| See examples | [complete-examples.md](resources/complete-examples.md) |

---

## Resource Files

### [template-organization.md](resources/template-organization.md)
Directory structure, naming conventions, asset organization

### [layouts-and-fragments.md](resources/layouts-and-fragments.md)
Layout patterns, fragment definition and inclusion, composition

### [forms-and-validation.md](resources/forms-and-validation.md)
Form binding, validation display, multi-select, file upload

### [security-integration.md](resources/security-integration.md)
Spring Security extras, CSRF, conditional rendering by role

### [internationalization.md](resources/internationalization.md)
Message bundles, locale resolution, parameterized messages

### [htmx-integration.md](resources/htmx-integration.md)
HTMX attributes, partial page updates, form submission

### [error-handling.md](resources/error-handling.md)
Error pages, validation errors, exception handling

### [complete-examples.md](resources/complete-examples.md)
Full CRUD example, dashboard layout, admin interface

---

## Related Skills

- **backend-dev-guidelines** - Spring Boot patterns for controllers and services
- **error-tracking** - Centralized logging and monitoring patterns
- **route-tester** - Testing endpoints that serve views

---

**Skill Status**: COMPLETE
**Line Count**: < 500
**Progressive Disclosure**: 8 resource files
