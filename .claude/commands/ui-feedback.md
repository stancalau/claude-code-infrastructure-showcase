---
description: Test Thymeleaf UI pages with Playwright browser tools
argument-hint: "<url-path> [--visual] [--functional] [--autofix] [--iterations=N]"
model: sonnet
---

## UI Feedback Command

Test and verify Thymeleaf UI pages using Playwright browser automation with visual and functional testing.

### Arguments

`$ARGUMENTS`

### Argument Parsing

Parse the arguments to determine:

1. **Target URL**: First argument should be the URL path (e.g., `/users`, `/admin/dashboard`)
   - Prepend `http://localhost:8080` if path starts with `/`
   - Use as full URL if includes protocol

2. **Test Types**:
   - `--visual`: Screenshot-based visual verification (DEFAULT if no flags)
   - `--functional`: Form and interaction testing
   - If both flags present: run both test types

3. **Auto-fix**:
   - `--autofix`: Enable iterative fixing of issues found

4. **Iterations**:
   - `--iterations=N`: Max auto-fix iterations (default: 3, max: 5)

### Pre-flight Checks

Before testing, verify:

1. **Spring Boot Running**: Check if localhost:8080 responds
   - Use `browser_navigate` to test connection
   - If fails, warn user: "Please start your Spring Boot application first"

2. **URL Valid**: Ensure target path exists
   - Navigate to URL
   - Check `browser_snapshot` for error pages

### Execution Flow

**Step 1: Navigate and Capture Initial State**

```
browser_navigate → http://localhost:8080{url-path}
browser_snapshot → verify page loaded, get element refs
browser_take_screenshot → capture visual baseline
browser_console_messages → check for pre-existing JS errors
```

**Step 2: Visual Testing (if --visual or default)**

Analyze screenshot for:
- Layout correctness (elements positioned properly)
- Styling consistency (Bootstrap classes applied)
- Spacing and alignment
- Text readability and overflow
- Color contrast

**Step 3: Functional Testing (if --functional)**

```
1. Identify interactive elements from snapshot:
   - Forms (inputs, buttons)
   - Links
   - HTMX elements (hx-get, hx-post)

2. For forms:
   - browser_fill_form with test data
   - browser_click submit
   - browser_wait_for result
   - browser_snapshot to verify

3. For HTMX elements:
   - browser_click trigger
   - browser_wait_for target update
   - browser_snapshot to verify
   - browser_network_requests to confirm XHR

4. Check browser_console_messages for errors
```

**Step 4: Auto-fix Loop (if --autofix)**

```
MAX_ITERATIONS = iterations_arg or 3

for iteration in 1..MAX_ITERATIONS:
    if no issues found:
        report "All tests pass!"
        break

    issue = highest_priority_issue

    # Locate and fix
    if template issue:
        Edit src/main/resources/templates/...
    if styling issue:
        Add Bootstrap classes or edit CSS
    if controller issue:
        Edit src/main/java/.../controller/...

    # Re-test
    browser_navigate to same URL
    run tests again

if issues remain:
    report "Remaining issues after {iterations} iterations"
```

### Output Report

Generate a structured report:

```markdown
## UI Feedback Report: {URL}

### Test Summary
- **URL**: http://localhost:8080{path}
- **Test Types**: Visual, Functional
- **Status**: PASS / FAIL / PARTIAL

### Visual Analysis
| Check | Status | Notes |
|-------|--------|-------|
| Layout | OK/Issue | [description] |
| Styling | OK/Issue | [description] |
| Content | OK/Issue | [description] |

### Functional Tests (if run)
| Test | Status | Notes |
|------|--------|-------|
| Form submission | OK/Issue | [description] |
| HTMX interactions | OK/Issue | [description] |
| Navigation | OK/Issue | [description] |

### Console Errors
[List or "None found"]

### Auto-fix Summary (if enabled)
| Iteration | Issue Fixed | File Modified |
|-----------|-------------|---------------|
| 1 | [description] | [file:line] |

### Remaining Issues
[List or "All tests pass"]
```

### For Complex Testing

If extensive testing or complex auto-fixing is needed, launch the full agent:

```
Use Task tool with:
  subagent_type: "ui-design-tester"
  prompt: "Comprehensively test {URL} with visual and functional verification, auto-fix enabled"
```

### Examples

```bash
# Quick visual check of users page
/ui-feedback /users

# Test user form with functional testing
/ui-feedback /users/new --functional

# Full testing with auto-fix
/ui-feedback /users/new --visual --functional --autofix

# Custom iteration limit
/ui-feedback /admin/dashboard --autofix --iterations=5
```
