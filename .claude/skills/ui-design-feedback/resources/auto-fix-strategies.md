# Auto-Fix Strategies

Patterns for automatically identifying and fixing common UI issues in Thymeleaf applications.

## Overview

The auto-fix system follows a cycle:
1. **Detect** - Identify issue via snapshot/screenshot
2. **Locate** - Find the source file
3. **Fix** - Apply targeted change
4. **Verify** - Re-test to confirm fix

---

## Fix Iteration Logic

### Iteration Parameters

```
MAX_ITERATIONS = 3  (default)
MAX_ITERATIONS = 5  (maximum allowed)
```

### Priority Order

Fix issues in this order:
1. **Critical** - Page won't render, JS errors blocking functionality
2. **Major** - Forms don't submit, navigation broken
3. **Minor** - Styling issues, alignment problems

### Stop Conditions

Stop iterating when:
- All tests pass
- Max iterations reached
- Same issue persists after 2 fix attempts (likely wrong diagnosis)
- Fix requires structural changes (ask user first)

---

## Issue Detection Patterns

### Using browser_snapshot

| Issue | Detection Pattern |
|-------|-------------------|
| Missing element | Expected ref not found |
| Wrong text | Text content doesn't match expected |
| Missing link | No `link` element with expected text |
| Form field missing | No `textbox`/`checkbox` with expected name |
| Button missing | No `button` with expected text |

### Using browser_take_screenshot

| Issue | Visual Pattern |
|-------|----------------|
| Layout broken | Elements misaligned, overlapping |
| Styling missing | Plain unstyled elements |
| Text overflow | Content cut off, runs outside container |
| Spacing wrong | Too cramped or too sparse |
| Colors wrong | Not matching expected design |

### Using browser_console_messages

| Issue | Console Pattern |
|-------|-----------------|
| JS error | `Uncaught TypeError`, `ReferenceError` |
| Missing resource | `404 Not Found` |
| Template error | Thymeleaf parsing exception |

---

## Common Fixes by File Type

### Template Fixes (.html)

#### Missing Element

**Issue**: Expected element not in DOM

**Fix Pattern**:
```html
<!-- Add the missing element -->
<div th:if="${condition}">
    <span th:text="${data}">Placeholder</span>
</div>
```

**Location**: Find template in `src/main/resources/templates/`

#### Wrong Text Binding

**Issue**: Text shows placeholder or wrong data

**Fix Pattern**:
```html
<!-- Before -->
<span>Placeholder</span>

<!-- After -->
<span th:text="${user.name}">Placeholder</span>
```

#### Missing th:if Condition

**Issue**: Element shows when it shouldn't (or vice versa)

**Fix Pattern**:
```html
<!-- Add condition -->
<div th:if="${users != null and !users.empty}">
    <!-- content -->
</div>

<!-- Or inverse -->
<div th:unless="${users.empty}">
    No users found.
</div>
```

#### Missing Fragment

**Issue**: Section not rendering, th:replace failing

**Fix Pattern**:
```html
<!-- Ensure fragment exists in referenced file -->
<div th:fragment="header">
    <!-- fragment content -->
</div>

<!-- And reference is correct -->
<div th:replace="~{fragments/common :: header}"></div>
```

#### Form Action Missing

**Issue**: Form submits to wrong URL or doesn't submit

**Fix Pattern**:
```html
<form th:action="@{/users}" th:object="${user}" method="post">
    <!-- Ensure th:action and th:object are set -->
</form>
```

#### Validation Errors Not Showing

**Issue**: Invalid input but no error message

**Fix Pattern**:
```html
<input type="email" th:field="*{email}" class="form-control"
       th:classappend="${#fields.hasErrors('email')} ? 'is-invalid'">
<div class="invalid-feedback" th:if="${#fields.hasErrors('email')}"
     th:errors="*{email}"></div>
```

---

### Styling Fixes (CSS/Bootstrap Classes)

#### Missing Bootstrap Class

**Issue**: Element unstyled

**Common Fixes**:
```html
<!-- Button -->
<button class="btn btn-primary">Save</button>

<!-- Input -->
<input class="form-control">

<!-- Table -->
<table class="table table-striped">

<!-- Card -->
<div class="card">
    <div class="card-body">
```

#### Layout Issues

**Issue**: Elements not aligned properly

**Fix Pattern**:
```html
<!-- Use Bootstrap grid -->
<div class="container">
    <div class="row">
        <div class="col-md-6">Left</div>
        <div class="col-md-6">Right</div>
    </div>
</div>
```

#### Spacing Issues

**Issue**: Too cramped or too spread out

**Fix Pattern**:
```html
<!-- Add margin -->
<div class="mb-3">  <!-- margin-bottom: 1rem -->
<div class="mt-4">  <!-- margin-top: 1.5rem -->
<div class="my-2">  <!-- margin y-axis: 0.5rem -->

<!-- Add padding -->
<div class="p-3">   <!-- padding: 1rem -->
<div class="px-4">  <!-- padding x-axis: 1.5rem -->
```

#### Text Overflow

**Issue**: Text runs outside container

**Fix Pattern**:
```html
<!-- Truncate with ellipsis -->
<div class="text-truncate">Long text here...</div>

<!-- Or allow wrap -->
<div class="text-wrap">Long text here...</div>

<!-- Or use word break -->
<div class="text-break">LongURLWithoutSpaces</div>
```

---

### Controller Fixes (.java)

#### Missing Model Attribute

**Issue**: Template variable is null

**Fix Pattern**:
```java
@GetMapping("/users")
public String listUsers(Model model) {
    model.addAttribute("users", userService.findAll());  // Add this
    return "users/list";
}
```

#### Wrong Return View

**Issue**: Wrong page rendered

**Fix Pattern**:
```java
// Fix return path
return "users/list";  // Not "user/list" or "/users/list"
```

#### Missing @Valid

**Issue**: Validation not triggering

**Fix Pattern**:
```java
@PostMapping("/users")
public String createUser(@Valid @ModelAttribute("user") UserDto user,
                        BindingResult result,
                        RedirectAttributes redirectAttributes) {
    if (result.hasErrors()) {
        return "users/form";
    }
    // ...
}
```

#### Missing Flash Message

**Issue**: No success/error feedback after action

**Fix Pattern**:
```java
redirectAttributes.addFlashAttribute("success", "User created successfully");
return "redirect:/users";
```

---

### HTMX Fixes

#### Target Not Found

**Issue**: HTMX response not updating page

**Fix Pattern**:
```html
<!-- Ensure target exists -->
<div id="results"></div>

<!-- And hx-target is correct -->
<button hx-get="/search" hx-target="#results">
```

#### Wrong Swap Mode

**Issue**: Content replaced incorrectly

**Fix Pattern**:
```html
<!-- Choose appropriate swap -->
hx-swap="innerHTML"   <!-- Replace content inside -->
hx-swap="outerHTML"   <!-- Replace entire element -->
hx-swap="beforeend"   <!-- Append to end -->
```

#### Fragment Not Returned

**Issue**: Full page returned instead of fragment

**Controller Fix**:
```java
@GetMapping("/users/search")
public String search(Model model) {
    // Return fragment reference
    return "users/list :: search-results";
}
```

**Template Fix**:
```html
<div th:fragment="search-results">
    <!-- Fragment content -->
</div>
```

---

## Fix Application Process

### Step 1: Identify File Location

```
Template issues → src/main/resources/templates/**/*.html
Styling issues → template file (inline classes) or src/main/resources/static/css/
Controller issues → src/main/java/**/controller/**/*.java
Validation issues → DTO in src/main/java/**/dto/**/*.java
```

### Step 2: Read Current Content

Always read the file first to understand context:
```
Read file to understand:
- Current structure
- Existing patterns
- Related code
```

### Step 3: Apply Minimal Fix

Make the smallest change that fixes the issue:
- Don't refactor surrounding code
- Don't add features not requested
- Match existing code style

### Step 4: Verify Fix

```
1. Reload page (browser_navigate to same URL)
2. Run same test that found the issue
3. Confirm issue is resolved
4. Check for new issues introduced
```

---

## Fix Templates

### Template: Add Missing th:text

```html
<!-- Find element with static text -->
<span>Static Value</span>

<!-- Replace with dynamic binding -->
<span th:text="${variable}">Static Value</span>
```

### Template: Add Form Validation Display

```html
<!-- After each input, add error display -->
<input type="text" th:field="*{fieldName}" class="form-control">
<div th:if="${#fields.hasErrors('fieldName')}"
     th:errors="*{fieldName}"
     class="text-danger small"></div>
```

### Template: Add Bootstrap Table Styling

```html
<table class="table table-striped table-hover">
    <thead class="table-dark">
        <tr>
            <th>Column</th>
        </tr>
    </thead>
    <tbody>
        <tr th:each="item : ${items}">
            <td th:text="${item.value}"></td>
        </tr>
    </tbody>
</table>
```

### Template: Add Flash Message Display

```html
<!-- At top of content area -->
<div th:if="${success}" class="alert alert-success alert-dismissible fade show">
    <span th:text="${success}"></span>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<div th:if="${error}" class="alert alert-danger alert-dismissible fade show">
    <span th:text="${error}"></span>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

---

## When NOT to Auto-Fix

Ask user before:
- Restructuring template layout
- Changing controller method signatures
- Adding new files
- Modifying security configuration
- Changes affecting multiple pages

Report and wait:
- Multiple related issues (might need coordinated fix)
- Issue requires domain knowledge
- Same fix failed twice
- Uncertain root cause
