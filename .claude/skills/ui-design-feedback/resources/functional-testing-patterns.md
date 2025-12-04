# Functional Testing Patterns

Detailed patterns for testing forms, interactions, and user flows in Thymeleaf applications.

## Overview

Functional testing verifies that UI elements work correctly - forms submit, buttons trigger actions, and the application responds appropriately.

---

## Form Testing

### Basic Form Test Flow

```
1. browser_navigate → form page
2. browser_snapshot → get field refs
3. browser_fill_form → populate fields
4. browser_click → submit button
5. browser_wait_for → success/error indicator
6. browser_snapshot → verify result
```

### Getting Field References

First, use `browser_snapshot` to get element refs:

```
Snapshot output example:
- textbox "Username" [ref=N123]
- textbox "Email" [ref=N124]
- checkbox "Accept Terms" [ref=N125]
- button "Submit" [ref=N126]
```

### Using browser_fill_form

Fill multiple fields at once:

```json
{
  "fields": [
    {"name": "Username", "type": "textbox", "ref": "N123", "value": "testuser"},
    {"name": "Email", "type": "textbox", "ref": "N124", "value": "test@example.com"},
    {"name": "Accept Terms", "type": "checkbox", "ref": "N125", "value": "true"}
  ]
}
```

**Field Types:**
- `textbox` - Text inputs, textareas
- `checkbox` - Checkboxes (value: "true" or "false")
- `radio` - Radio buttons
- `combobox` - Select dropdowns (value: option text)
- `slider` - Range inputs

### Submitting the Form

```
browser_click with:
  element: "Submit button"
  ref: "N126"
```

### Waiting for Response

```
# Wait for success message
browser_wait_for with:
  text: "User created successfully"

# Or wait for redirect (new page content)
browser_wait_for with:
  text: "User List"

# Or wait a fixed time
browser_wait_for with:
  time: 2
```

---

## Validation Testing

### Test Invalid Submission

```
1. Navigate to form
2. Submit without filling required fields
3. Verify validation errors appear
4. Fill with invalid data (bad email format)
5. Submit and verify specific error message
```

### Checking Validation Errors

After submission, use `browser_snapshot` to find error messages:

```
Snapshot shows:
- text "Email is required" [ref=N200]
- text "Username must be at least 3 characters" [ref=N201]
```

### Common Validation Scenarios

| Scenario | Test Data | Expected Result |
|----------|-----------|-----------------|
| Required field empty | Leave empty | "Field is required" error |
| Email invalid | "notanemail" | "Invalid email format" error |
| Password too short | "123" | "Password must be at least 8 characters" |
| Passwords don't match | Different values | "Passwords must match" error |

---

## Button and Link Testing

### Click Patterns

```
# Standard click
browser_click with:
  element: "Delete button"
  ref: "N150"

# Double click (if needed)
browser_click with:
  element: "Item"
  ref: "N151"
  doubleClick: true

# Right click (context menu)
browser_click with:
  element: "Item"
  ref: "N152"
  button: "right"
```

### Testing Navigation Links

```
1. browser_snapshot → find link ref
2. browser_click → the link
3. browser_wait_for → new page content
4. browser_snapshot → verify new page
```

---

## Dropdown Testing

### Select an Option

```
browser_select_option with:
  element: "Country dropdown"
  ref: "N160"
  values: ["United States"]
```

### Select Multiple (if multi-select)

```
browser_select_option with:
  element: "Skills dropdown"
  ref: "N161"
  values: ["Java", "Spring", "Thymeleaf"]
```

---

## Modal and Dialog Testing

### Testing Confirm Dialogs

```
1. browser_click → action that triggers dialog
2. browser_handle_dialog with:
     accept: true  # or false to cancel
```

### Testing Modal Content

```
1. browser_click → button that opens modal
2. browser_wait_for → modal title text
3. browser_snapshot → verify modal content
4. browser_fill_form → if modal has form
5. browser_click → modal action button
6. browser_wait_for with textGone: "Modal title"  # modal closed
```

---

## Table Interaction Testing

### Clicking Table Rows

```
1. browser_snapshot → find table row/cell refs
2. browser_click → specific cell or row action button

Snapshot shows:
- row [ref=N200]
  - cell "John Doe" [ref=N201]
  - button "Edit" [ref=N202]
  - button "Delete" [ref=N203]
```

### Testing Pagination

```
1. browser_snapshot → verify initial page data
2. browser_click → "Next" page button
3. browser_wait_for → new data
4. browser_snapshot → verify page changed
```

### Testing Sorting

```
1. browser_click → column header
2. browser_wait_for → reordered data
3. browser_snapshot → verify sort order
```

---

## Error Handling Testing

### Check for JavaScript Errors

```
browser_console_messages with:
  onlyErrors: true

Returns:
- [error] Uncaught TypeError: Cannot read property...
- [error] 404 Not Found: /api/users
```

### Check Network Failures

```
browser_network_requests

Look for:
- Failed requests (status 4xx, 5xx)
- Missing resources
- CORS errors
```

---

## Test Data Strategies

### Valid Test Data

```json
{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "SecurePass123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "555-123-4567"
}
```

### Edge Case Test Data

| Field | Edge Case | Value |
|-------|-----------|-------|
| Text | Maximum length | 255 chars |
| Text | Special characters | `<script>alert('xss')</script>` |
| Number | Boundary | 0, -1, MAX_INT |
| Date | Edge dates | 1970-01-01, 2099-12-31 |
| Email | Valid but unusual | `test+filter@example.com` |

---

## Common Functional Issues & Fixes

### Issue: Form Not Submitting

**Symptoms**: Click submit, nothing happens

**Diagnosis**:
1. Check `browser_console_messages` for JS errors
2. Check `browser_network_requests` for blocked request
3. Verify form has correct `th:action`

**Fixes**:
```html
<!-- Ensure form has action -->
<form th:action="@{/users}" th:object="${user}" method="post">

<!-- Ensure submit button is type="submit" -->
<button type="submit" class="btn btn-primary">Save</button>
```

### Issue: Validation Not Showing

**Symptoms**: Invalid data accepted, no error messages

**Diagnosis**:
1. Check controller has `@Valid`
2. Check template has `th:errors`

**Fixes**:
```java
// Controller
@PostMapping("/users")
public String createUser(@Valid @ModelAttribute User user, BindingResult result) {
    if (result.hasErrors()) {
        return "users/form";
    }
    // ...
}
```

```html
<!-- Template -->
<input type="text" th:field="*{email}" class="form-control">
<div th:if="${#fields.hasErrors('email')}" th:errors="*{email}" class="text-danger"></div>
```

### Issue: Success Message Not Showing

**Symptoms**: Form submits but no feedback

**Fixes**:
```java
// Controller - add flash attribute
redirectAttributes.addFlashAttribute("success", "User created successfully");
return "redirect:/users";
```

```html
<!-- Template - show flash message -->
<div th:if="${success}" class="alert alert-success" th:text="${success}"></div>
```

---

## Test Report Format

After functional testing, report:

```markdown
## Functional Test Results

### Form: User Registration

| Test | Status | Notes |
|------|--------|-------|
| Submit valid data | PASS | User created, redirected to list |
| Submit empty form | PASS | All validation errors shown |
| Invalid email | PASS | "Invalid email" error displayed |
| Duplicate username | PASS | "Username exists" error shown |

### Navigation

| Link | Target | Status |
|------|--------|--------|
| Home | / | PASS |
| Users | /users | PASS |
| Add User | /users/new | PASS |

### Console Errors
None found.
```
