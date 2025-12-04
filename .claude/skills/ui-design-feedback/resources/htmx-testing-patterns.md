# HTMX Testing Patterns

Detailed patterns for testing HTMX-powered dynamic interactions in Thymeleaf applications.

## Overview

HTMX enables partial page updates without full page reloads. Testing HTMX requires verifying that:
1. XHR requests fire correctly
2. Responses update the correct target
3. Content swaps happen as expected

---

## HTMX Basics Recap

### Common HTMX Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `hx-get` | GET request on trigger | `hx-get="/api/users"` |
| `hx-post` | POST request on trigger | `hx-post="/api/users"` |
| `hx-target` | Element to update | `hx-target="#results"` |
| `hx-swap` | How to swap content | `hx-swap="innerHTML"` |
| `hx-trigger` | Event that triggers request | `hx-trigger="click"` |
| `hx-indicator` | Loading indicator | `hx-indicator="#spinner"` |

### Swap Modes

| Mode | Behavior |
|------|----------|
| `innerHTML` | Replace target's inner content |
| `outerHTML` | Replace entire target element |
| `beforebegin` | Insert before target |
| `afterbegin` | Insert at start of target |
| `beforeend` | Insert at end of target |
| `afterend` | Insert after target |
| `delete` | Remove target |
| `none` | No swap, just trigger events |

---

## HTMX Testing Workflow

### Basic HTMX Test

```
1. browser_navigate → page with HTMX elements
2. browser_snapshot → identify HTMX elements
3. browser_click → trigger HTMX request
4. browser_wait_for → target update
5. browser_snapshot → verify new content
6. browser_network_requests → confirm XHR
```

### Identifying HTMX Elements

In snapshot, look for elements with hx-* attributes:

```
- button "Search" [ref=N100]
    hx-get="/api/search"
    hx-target="#results"
    hx-trigger="click"
```

---

## Common HTMX Patterns

### Search with Live Results

**Template:**
```html
<input type="search" name="q"
       hx-get="/users/search"
       hx-target="#search-results"
       hx-trigger="keyup changed delay:300ms"
       placeholder="Search users...">
<div id="search-results"></div>
```

**Test:**
```
1. browser_navigate → page with search
2. browser_snapshot → get search input ref
3. browser_type → search term into input
4. browser_wait_for with time: 1  # wait for debounce
5. browser_snapshot → verify results appeared in #search-results
6. browser_network_requests → confirm /users/search was called
```

### Load More / Infinite Scroll

**Template:**
```html
<div id="items">
    <!-- initial items -->
</div>
<button hx-get="/items?page=2"
        hx-target="#items"
        hx-swap="beforeend">
    Load More
</button>
```

**Test:**
```
1. browser_snapshot → count initial items
2. browser_click → "Load More" button
3. browser_wait_for → new item content
4. browser_snapshot → verify more items added
5. browser_network_requests → confirm pagination request
```

### Delete with Confirmation

**Template:**
```html
<button hx-delete="/users/123"
        hx-target="closest tr"
        hx-swap="outerHTML"
        hx-confirm="Are you sure?">
    Delete
</button>
```

**Test:**
```
1. browser_snapshot → verify row exists
2. browser_click → delete button
3. browser_handle_dialog → accept: true
4. browser_wait_for with textGone: "User Name"
5. browser_snapshot → verify row removed
```

### Form Submission with HTMX

**Template:**
```html
<form hx-post="/users"
      hx-target="#user-list"
      hx-swap="beforeend">
    <input type="text" name="name">
    <button type="submit">Add User</button>
</form>
<div id="user-list"></div>
```

**Test:**
```
1. browser_fill_form → user data
2. browser_click → submit button
3. browser_wait_for → new user in list
4. browser_snapshot → verify user added to #user-list
5. browser_network_requests → confirm POST to /users
```

### Inline Editing

**Template:**
```html
<span hx-get="/users/123/edit"
      hx-trigger="click"
      hx-swap="outerHTML">
    John Doe
</span>
```

**Test:**
```
1. browser_click → the span
2. browser_wait_for → input field appears
3. browser_snapshot → verify edit form loaded
4. browser_type → new value
5. browser_click → save button
6. browser_wait_for → span returns with new value
```

---

## Verifying HTMX Requests

### Check Network Requests

```
browser_network_requests

Look for:
- Request URL matches hx-get/hx-post
- Request method is correct (GET, POST, DELETE, etc.)
- Response status is 200
- Response contains expected HTML fragment
```

### Expected Request Pattern

```
{
  "url": "http://localhost:8080/users/search?q=john",
  "method": "GET",
  "status": 200,
  "headers": {
    "HX-Request": "true",
    "HX-Target": "search-results"
  }
}
```

---

## Waiting Strategies for HTMX

### Wait for Text

Best for content that appears:
```
browser_wait_for with:
  text: "Search results for: john"
```

### Wait for Text Gone

Best for content that disappears (delete, loading):
```
browser_wait_for with:
  textGone: "Loading..."
```

### Wait for Time

Fallback when text is unpredictable:
```
browser_wait_for with:
  time: 2  # seconds
```

### Best Practice

Prefer text-based waiting over time-based:
- More reliable
- Faster (doesn't wait unnecessarily)
- Self-documenting (shows expected result)

---

## Testing Loading Indicators

**Template:**
```html
<button hx-get="/slow-operation"
        hx-indicator="#spinner">
    Process
</button>
<div id="spinner" class="htmx-indicator">
    Loading...
</div>
```

**Test:**
```
1. browser_click → process button
2. browser_snapshot → verify spinner visible (htmx-request class)
3. browser_wait_for → operation complete
4. browser_snapshot → verify spinner hidden
```

---

## Common HTMX Issues & Fixes

### Issue: HTMX Request Not Firing

**Symptoms**: Click element, nothing happens, no network request

**Diagnosis**:
1. Check `browser_console_messages` for JS errors
2. Verify HTMX is loaded: look for `htmx` in console
3. Check element has correct hx-* attributes

**Fixes**:
```html
<!-- Ensure HTMX is loaded -->
<script src="/webjars/htmx.org/dist/htmx.min.js"></script>

<!-- Ensure correct trigger -->
<button hx-get="/api/data" hx-trigger="click">  <!-- explicit trigger -->
```

### Issue: Target Not Updated

**Symptoms**: Request fires (see in network) but content doesn't change

**Diagnosis**:
1. Verify `hx-target` points to existing element
2. Check target element has correct ID
3. Verify `hx-swap` mode is appropriate

**Fixes**:
```html
<!-- Ensure target exists -->
<div id="results"></div>  <!-- Must exist before HTMX request -->

<button hx-get="/data"
        hx-target="#results"   <!-- Correct ID with # -->
        hx-swap="innerHTML">   <!-- Appropriate swap mode -->
```

### Issue: Whole Page Replaced

**Symptoms**: Clicking HTMX element replaces entire page

**Diagnosis**:
1. Server returning full HTML page instead of fragment
2. Missing `hx-target`

**Fixes**:
```java
// Controller - return fragment only
@GetMapping("/users/search")
public String searchUsers(@RequestParam String q, Model model) {
    model.addAttribute("users", userService.search(q));
    return "users/fragments :: search-results";  // Return fragment
}
```

```html
<!-- Template fragment -->
<div th:fragment="search-results">
    <div th:each="user : ${users}" th:text="${user.name}"></div>
</div>
```

### Issue: Form Validation Not Showing

**Symptoms**: HTMX form submits, validation errors not displayed

**Fixes**:
```java
// Controller - return form with errors
@PostMapping("/users")
public String createUser(@Valid User user, BindingResult result) {
    if (result.hasErrors()) {
        return "users/fragments :: user-form";  // Return form fragment with errors
    }
    // success...
    return "users/fragments :: user-row";  // Return new row
}
```

### Issue: Events Not Triggering

**Symptoms**: Custom triggers not working

**Fixes**:
```html
<!-- Correct trigger syntax -->
<input hx-get="/search"
       hx-trigger="keyup changed delay:500ms">  <!-- Debounced keyup -->

<div hx-get="/updates"
     hx-trigger="every 5s">  <!-- Polling -->

<form hx-post="/submit"
      hx-trigger="submit">  <!-- Form submission -->
```

---

## HTMX with Thymeleaf Integration

### Dynamic URLs

```html
<button th:hx-get="@{/users/{id}(id=${user.id})}"
        hx-target="#user-details">
    View
</button>
```

### Conditional HTMX

```html
<button th:if="${canDelete}"
        th:hx-delete="@{/users/{id}(id=${user.id})}"
        hx-confirm="Delete this user?">
    Delete
</button>
```

### Fragment References

```html
<!-- In controller -->
return "users/list :: user-table";

<!-- In template -->
<table th:fragment="user-table">
    <!-- table content -->
</table>
```

---

## Test Report Format

```markdown
## HTMX Test Results

### Search Functionality

| Action | Expected | Actual | Status |
|--------|----------|--------|--------|
| Type in search | XHR to /search | Request sent | PASS |
| Results appear | #results updated | Content swapped | PASS |
| Clear search | Results cleared | Empty content | PASS |

### Delete User

| Action | Expected | Actual | Status |
|--------|----------|--------|--------|
| Click delete | Confirm dialog | Dialog shown | PASS |
| Confirm delete | Row removed | outerHTML swap | PASS |
| Network request | DELETE /users/123 | 200 OK | PASS |

### Issues Found
- None

### Network Requests Verified
- GET /users/search?q=john - 200 OK
- DELETE /users/123 - 200 OK
```
