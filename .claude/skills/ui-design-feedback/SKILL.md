---
name: ui-design-feedback
description: Playwright-based frontend design feedback for Spring Boot Thymeleaf applications. Use when testing UI pages, verifying visual appearance, testing forms, validating HTMX interactions, or implementing auto-fix iterations. Covers browser MCP tools (snapshot, screenshot, click, type), visual verification, functional testing, and iterative improvement workflows.
---

# UI Design Feedback - Playwright Testing

## Purpose

Provide comprehensive frontend testing and design feedback for Spring Boot Thymeleaf applications using Playwright MCP browser tools. This skill enables Claude to see what it's building and iteratively fix issues.

## When to Use This Skill

Automatically activates when:
- Testing Thymeleaf templates visually
- Validating form functionality
- Testing HTMX interactions
- Checking responsive design
- Auto-fixing UI issues
- Using browser MCP tools

---

## Quick Start

### Test a Page (3 Steps)

1. **Navigate**: `browser_navigate` to URL (e.g., `http://localhost:8080/users`)
2. **Analyze**: `browser_snapshot` for structure OR `browser_take_screenshot` for visual
3. **Interact**: `browser_click`, `browser_fill_form` for functional testing

### Decision Tree: Which Tool?

```
What do you need?
├── Page structure/elements → browser_snapshot (fast, structured)
├── Visual appearance → browser_take_screenshot (image for analysis)
├── Fill a form → browser_fill_form (multiple fields at once)
├── Click something → browser_click (buttons, links, HTMX triggers)
├── Wait for update → browser_wait_for (HTMX responses, animations)
├── Debug JS errors → browser_console_messages
└── Check API calls → browser_network_requests (HTMX XHR debugging)
```

---

## Core MCP Browser Tools

### Navigation & Analysis

| Tool | Returns | Use For |
|------|---------|---------|
| `browser_navigate` | Page loaded | Navigate to URL |
| `browser_snapshot` | Accessibility tree (text) | Structure, element refs, state |
| `browser_take_screenshot` | PNG/JPEG image | Visual verification, design review |

### Interaction

| Tool | Parameters | Use For |
|------|------------|---------|
| `browser_click` | `element`, `ref` | Buttons, links, HTMX triggers |
| `browser_type` | `element`, `ref`, `text` | Single input field |
| `browser_fill_form` | `fields[]` | Multiple form fields at once |
| `browser_hover` | `element`, `ref` | Tooltips, dropdowns |
| `browser_select_option` | `element`, `ref`, `values` | Dropdown selection |

### Waiting & Debugging

| Tool | Parameters | Use For |
|------|------------|---------|
| `browser_wait_for` | `text` OR `time` OR `textGone` | HTMX updates, animations |
| `browser_console_messages` | `onlyErrors` (optional) | JS error debugging |
| `browser_network_requests` | none | HTMX XHR verification |

---

## Snapshot vs Screenshot

**Critical distinction for effective testing:**

### browser_snapshot (Structured Analysis)
- Returns accessibility tree as **structured text**
- Contains element `ref` values needed for interactions
- Fast and deterministic
- Use for: Navigation, finding elements, verifying state, getting refs for clicks

### browser_take_screenshot (Visual Verification)
- Returns **image** (PNG/JPEG)
- Claude analyzes visually (multimodal)
- Shows actual appearance
- Use for: Design review, layout verification, visual regression

**Pattern**: Use snapshot to navigate/interact, screenshot to verify appearance.

---

## Testing Workflows

### Visual Testing Workflow

```
1. browser_navigate → http://localhost:8080/target-page
2. browser_snapshot → verify page loaded (check title, key elements)
3. browser_take_screenshot → capture visual state
4. Analyze screenshot for:
   - Layout correctness (elements positioned properly)
   - Spacing and alignment
   - Colors and contrast
   - Text readability
   - Responsive behavior
5. If issues found → identify source file, generate fix
```

### Functional Testing Workflow (Forms)

```
1. browser_navigate → form page
2. browser_snapshot → get form field refs
3. browser_fill_form with fields:
   [
     {"name": "Username", "type": "textbox", "ref": "N[ref]", "value": "testuser"},
     {"name": "Email", "type": "textbox", "ref": "N[ref]", "value": "test@example.com"},
     {"name": "Accept Terms", "type": "checkbox", "ref": "N[ref]", "value": "true"}
   ]
4. browser_click → submit button ref
5. browser_wait_for → success message text
6. browser_snapshot → verify result state
7. If errors → browser_console_messages to debug
```

### HTMX Testing Workflow

```
1. browser_navigate → page with HTMX elements
2. browser_snapshot → identify HTMX-enabled elements (hx-get, hx-post)
3. browser_click → trigger HTMX request (e.g., search button)
4. browser_wait_for → target element update (text or time)
5. browser_snapshot → verify partial update occurred
6. browser_network_requests → confirm XHR call made
7. If not working → check hx-target, hx-swap attributes
```

---

## Auto-Fix Iteration Pattern

### Loop Structure (Default: 3 iterations)

```
MAX_ITERATIONS = 3
iteration = 0

while iteration < MAX_ITERATIONS:
    iteration++

    # Test current state
    issues = run_visual_and_functional_tests()

    if no issues:
        log("All tests pass!")
        break

    # Prioritize and fix
    issue = highest_priority_issue(issues)
    fix = generate_fix(issue)
    apply_fix(fix)

    log(f"Iteration {iteration}: Fixed {issue.description}")

if iteration == MAX_ITERATIONS and issues remain:
    log("Max iterations reached. Remaining issues:")
    list_remaining_issues()
```

### Issue Types & Fix Locations

| Issue Type | Detection | Fix Location |
|------------|-----------|--------------|
| Missing element | Snapshot missing expected ref | Template (.html) |
| Wrong text | Snapshot text != expected | Template th:text |
| Styling issue | Screenshot shows visual problem | CSS or Bootstrap classes |
| Form not submitting | Console error or no response | Template th:action or Controller |
| HTMX not updating | Network shows no request | Template hx-* attributes |
| Validation error shown | Snapshot shows error message | Controller validation or DTO |

### Stop Conditions

Stop iterating when:
- All tests pass
- Max iterations reached
- Same issue persists after 2 fix attempts
- Fix requires major restructuring (ask user)

---

## Common Patterns

### Testing a New Page

```
1. Ensure Spring Boot is running (localhost:8080)
2. browser_navigate to the new page URL
3. browser_snapshot to verify it renders
4. browser_take_screenshot for visual review
5. Analyze: Does it match expectations?
6. If issues: identify template file, apply fix, re-test
```

### Testing Form Validation

```
1. Navigate to form page
2. Submit with invalid data (empty required fields)
3. Verify validation errors appear (browser_snapshot)
4. Submit with valid data
5. Verify success (redirect or message)
6. Check browser_console_messages for JS errors
```

### Testing HTMX Search

```
1. Navigate to page with search
2. browser_type search query into input
3. browser_click search button (or wait for hx-trigger)
4. browser_wait_for results text or time(2)
5. browser_snapshot to verify results displayed
6. browser_network_requests to confirm XHR
```

---

## Best Practices

### DO

- Use `browser_snapshot` for navigation and interaction (fast)
- Use `browser_take_screenshot` sparingly for visual verification
- Always get element `ref` from snapshot before clicking
- Use `browser_wait_for` after HTMX interactions
- Check `browser_console_messages` when tests fail
- Limit auto-fix iterations to prevent infinite loops

### DON'T

- Screenshot after every single action (slow, expensive)
- Click without first getting the element ref from snapshot
- Skip waiting for HTMX updates
- Ignore console errors
- Auto-fix without understanding the issue
- Exceed iteration limits

---

## Integration with Other Skills

- **thymeleaf-dev-guidelines**: Template patterns for fixes
- **backend-dev-guidelines**: Controller fixes
- **error-tracking**: Console error analysis

---

## Resource Files

For detailed patterns, see:
- [visual-testing-patterns.md](resources/visual-testing-patterns.md) - Screenshot analysis techniques
- [functional-testing-patterns.md](resources/functional-testing-patterns.md) - Form and interaction testing
- [htmx-testing-patterns.md](resources/htmx-testing-patterns.md) - HTMX-specific patterns
- [auto-fix-strategies.md](resources/auto-fix-strategies.md) - Common fix patterns

---

## Quick Reference

### Start Testing
```
browser_navigate → URL
browser_snapshot → structure check
browser_take_screenshot → visual check
```

### Form Test
```
browser_snapshot → get refs
browser_fill_form → populate
browser_click → submit
browser_wait_for → result
```

### HTMX Test
```
browser_click → trigger
browser_wait_for → update
browser_snapshot → verify
browser_network_requests → debug
```
