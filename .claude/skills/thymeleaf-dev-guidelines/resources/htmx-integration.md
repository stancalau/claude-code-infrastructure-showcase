# HTMX Integration

## Introduction

HTMX enables modern, interactive UIs with server-side rendering. It allows partial page updates without full-page reloads while keeping all logic on the server.

---

## Setup

### Include HTMX

```html
<!-- In layout head or before closing body -->
<script src="https://unpkg.com/htmx.org@1.9.10"></script>

<!-- Or via WebJars -->
<script th:src="@{/webjars/htmx.org/dist/htmx.min.js}"></script>
```

### Maven Dependency (WebJars)

```xml
<dependency>
    <groupId>org.webjars.npm</groupId>
    <artifactId>htmx.org</artifactId>
    <version>1.9.10</version>
</dependency>
```

---

## Basic Patterns

### Click to Load Content

```html
<button hx-get="/users/list"
        hx-target="#user-table-body"
        hx-swap="innerHTML"
        class="btn btn-primary">
    Load Users
</button>

<table class="table">
    <thead>
        <tr><th>Name</th><th>Email</th></tr>
    </thead>
    <tbody id="user-table-body">
        <!-- Content loaded here -->
    </tbody>
</table>
```

### Controller for Partial Response

```java
@Controller
@RequestMapping("/users")
public class UserController {

    @GetMapping("/list")
    public String listFragment(Model model) {
        model.addAttribute("users", userService.findAll());
        return "admin/users/fragments :: user-rows";
    }
}
```

### Fragment for Response

```html
<!-- admin/users/fragments.html -->
<th:block th:fragment="user-rows">
    <tr th:each="user : ${users}">
        <td th:text="${user.name}">Name</td>
        <td th:text="${user.email}">Email</td>
        <td>
            <button hx-get th:hx-get="@{/users/{id}/edit-form(id=${user.id})}"
                    hx-target="#modal-content"
                    hx-trigger="click"
                    class="btn btn-sm btn-warning">
                Edit
            </button>
        </td>
    </tr>
</th:block>
```

---

## Form Submission

### HTMX Form

```html
<form hx-post="/users"
      hx-target="#user-list"
      hx-swap="beforeend"
      hx-on::after-request="this.reset()">

    <div class="mb-3">
        <input type="text" name="name" class="form-control"
               placeholder="Name" required>
    </div>
    <div class="mb-3">
        <input type="email" name="email" class="form-control"
               placeholder="Email" required>
    </div>
    <button type="submit" class="btn btn-primary">Add User</button>
</form>

<div id="user-list">
    <!-- New users appended here -->
</div>
```

### Controller

```java
@PostMapping
public String create(@Valid UserForm form,
                    BindingResult result,
                    Model model) {
    if (result.hasErrors()) {
        model.addAttribute("errors", result.getAllErrors());
        return "admin/users/fragments :: form-errors";
    }

    User user = userService.create(form);
    model.addAttribute("user", user);
    return "admin/users/fragments :: user-row";
}
```

---

## Search with Debounce

### Search Input

```html
<input type="search"
       name="query"
       class="form-control"
       placeholder="Search users..."
       hx-get="/users/search"
       hx-trigger="input changed delay:300ms, search"
       hx-target="#search-results"
       hx-indicator="#search-spinner">

<span id="search-spinner" class="htmx-indicator">
    <span class="spinner-border spinner-border-sm"></span>
</span>

<div id="search-results">
    <!-- Results appear here -->
</div>
```

### Controller

```java
@GetMapping("/search")
public String search(@RequestParam(defaultValue = "") String query,
                    Model model) {
    List<User> users = query.isBlank()
        ? userService.findAll()
        : userService.search(query);
    model.addAttribute("users", users);
    return "admin/users/fragments :: user-rows";
}
```

---

## Delete with Confirmation

### Delete Button

```html
<button hx-delete th:hx-delete="@{/users/{id}(id=${user.id})}"
        hx-target="closest tr"
        hx-swap="outerHTML swap:1s"
        hx-confirm="Are you sure you want to delete this user?"
        class="btn btn-sm btn-danger">
    Delete
</button>
```

### Controller

```java
@DeleteMapping("/{id}")
@ResponseBody
public ResponseEntity<Void> delete(@PathVariable Long id) {
    userService.delete(id);
    return ResponseEntity.ok().build();
}
```

---

## Inline Editing

### Display Mode

```html
<tr th:id="${'user-' + user.id}">
    <td>
        <span th:text="${user.name}" class="editable"
              hx-get th:hx-get="@{/users/{id}/edit-inline(id=${user.id})}"
              hx-target="closest tr"
              hx-swap="outerHTML">Name</span>
    </td>
    <td th:text="${user.email}">Email</td>
</tr>
```

### Edit Mode Fragment

```html
<tr th:fragment="edit-row" th:id="${'user-' + user.id}">
    <td colspan="2">
        <form hx-put th:hx-put="@{/users/{id}(id=${user.id})}"
              hx-target="closest tr"
              hx-swap="outerHTML">
            <div class="input-group">
                <input type="text" name="name" th:value="${user.name}"
                       class="form-control" required>
                <input type="email" name="email" th:value="${user.email}"
                       class="form-control" required>
                <button type="submit" class="btn btn-success">Save</button>
                <button type="button" class="btn btn-secondary"
                        hx-get th:hx-get="@{/users/{id}/view-inline(id=${user.id})}"
                        hx-target="closest tr"
                        hx-swap="outerHTML">Cancel</button>
            </div>
        </form>
    </td>
</tr>
```

---

## Modal Dialogs

### Modal Trigger

```html
<button hx-get="/users/new"
        hx-target="#modal-content"
        hx-trigger="click"
        data-bs-toggle="modal"
        data-bs-target="#formModal"
        class="btn btn-primary">
    Add User
</button>

<div class="modal fade" id="formModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" id="modal-content">
            <!-- Content loaded here -->
        </div>
    </div>
</div>
```

### Modal Content Fragment

```html
<!-- fragments/modals.html -->
<th:block th:fragment="user-form-modal">
    <div class="modal-header">
        <h5 class="modal-title" th:text="${user.id != null} ? 'Edit User' : 'New User'">
            User Form
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form hx-post="/users"
          hx-target="#user-table-body"
          hx-swap="beforeend"
          hx-on::after-request="bootstrap.Modal.getInstance(document.getElementById('formModal')).hide()">
        <div class="modal-body">
            <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" name="name" th:value="${user.name}"
                       class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" name="email" th:value="${user.email}"
                       class="form-control" required>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
            </button>
            <button type="submit" class="btn btn-primary">Save</button>
        </div>
    </form>
</th:block>
```

---

## Pagination

```html
<div id="user-container">
    <table class="table">
        <tbody id="user-table-body">
            <tr th:each="user : ${users.content}">
                <td th:text="${user.name}">Name</td>
                <td th:text="${user.email}">Email</td>
            </tr>
        </tbody>
    </table>

    <nav th:if="${users.totalPages > 1}">
        <ul class="pagination">
            <li th:each="pageNum : ${#numbers.sequence(0, users.totalPages - 1)}"
                class="page-item"
                th:classappend="${pageNum == users.number} ? 'active'">
                <a class="page-link"
                   th:href="@{/users(page=${pageNum})}"
                   hx-get th:hx-get="@{/users/list(page=${pageNum})}"
                   hx-target="#user-container"
                   hx-push-url="true"
                   th:text="${pageNum + 1}">1</a>
            </li>
        </ul>
    </nav>
</div>
```

---

## CSRF with HTMX

### Configuration (hx-config)

```html
<body hx-headers='{"X-CSRF-TOKEN": "[[${_csrf.token}]]"}'>
```

### Or via Meta Tag

```html
<head>
    <meta name="csrf-token" th:content="${_csrf.token}">
</head>

<script>
document.body.addEventListener('htmx:configRequest', (event) => {
    event.detail.headers['X-CSRF-TOKEN'] =
        document.querySelector('meta[name="csrf-token"]').content;
});
</script>
```

---

## Loading Indicators

```html
<style>
.htmx-indicator {
    display: none;
}
.htmx-request .htmx-indicator {
    display: inline-block;
}
.htmx-request.htmx-indicator {
    display: inline-block;
}
</style>

<button hx-get="/slow-endpoint"
        hx-indicator="#spinner"
        class="btn btn-primary">
    Load Data
    <span id="spinner" class="htmx-indicator spinner-border spinner-border-sm"></span>
</button>
```

---

## Best Practices

### DO

- Return HTML fragments, not JSON
- Use meaningful target IDs
- Include CSRF tokens for mutations
- Use loading indicators for slow operations
- Leverage `hx-push-url` for bookmarkable states
- Keep fragments small and focused

### DON'T

- Return full pages for HTMX requests
- Forget CSRF protection on POST/PUT/DELETE
- Overuse HTMX for simple links
- Nest HTMX requests unnecessarily
- Ignore error handling
