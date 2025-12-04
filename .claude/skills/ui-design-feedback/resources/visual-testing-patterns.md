# Visual Testing Patterns

Detailed patterns for screenshot-based visual verification of Thymeleaf UIs.

## Overview

Visual testing uses `browser_take_screenshot` to capture the actual rendered appearance, which Claude analyzes using multimodal capabilities to identify design issues.

---

## When to Use Screenshots

Use `browser_take_screenshot` when you need to verify:
- Overall page layout and structure
- Element positioning and alignment
- Colors, fonts, and styling
- Responsive behavior at different widths
- Visual regression (before/after comparison)

**Do NOT use for:**
- Finding element refs (use `browser_snapshot` instead)
- Every interaction step (too slow)
- Programmatic state verification

---

## Screenshot Workflow

### Basic Visual Check

```
1. browser_navigate("http://localhost:8080/page")
2. browser_take_screenshot()
3. Analyze image for:
   - Does the page look correct?
   - Are elements aligned properly?
   - Is text readable?
   - Do colors match design?
```

### Full Page Screenshot

```
browser_take_screenshot with fullPage: true

Use for:
- Long scrolling pages
- Capturing entire form
- Documentation purposes
```

### Element Screenshot

```
browser_take_screenshot with:
  element: "User profile card"
  ref: "N[123]"

Use for:
- Component-level verification
- Isolated design review
- Smaller file size
```

---

## Visual Analysis Checklist

When analyzing a screenshot, check:

### Layout
- [ ] Header/navigation positioned correctly
- [ ] Main content area properly sized
- [ ] Sidebar (if present) aligned
- [ ] Footer at bottom
- [ ] No overlapping elements
- [ ] Proper use of grid/flexbox

### Typography
- [ ] Headings hierarchy (h1 > h2 > h3)
- [ ] Body text readable size
- [ ] Proper line height/spacing
- [ ] No text overflow or truncation
- [ ] Labels aligned with inputs

### Spacing
- [ ] Consistent margins between sections
- [ ] Proper padding inside containers
- [ ] Form fields evenly spaced
- [ ] Button padding appropriate
- [ ] No cramped or too-sparse areas

### Colors & Contrast
- [ ] Text readable against background
- [ ] Links distinguishable
- [ ] Error states visible (red/danger)
- [ ] Success states visible (green/success)
- [ ] Button colors appropriate

### Bootstrap Components (if used)
- [ ] Cards have proper shadows/borders
- [ ] Tables styled correctly
- [ ] Forms use form-control class
- [ ] Buttons use btn classes
- [ ] Alerts styled appropriately

---

## Common Visual Issues & Fixes

### Issue: Element Not Visible

**Symptoms**: Expected element missing from screenshot

**Diagnosis**:
1. Check `browser_snapshot` - is element in DOM?
2. If yes: CSS issue (display:none, visibility:hidden, opacity:0)
3. If no: Template issue (th:if condition, missing fragment)

**Fixes**:
```html
<!-- Check th:if condition -->
<div th:if="${user != null}">  <!-- Is user passed from controller? -->

<!-- Check fragment inclusion -->
<div th:replace="~{fragments/header :: header}">  <!-- Does fragment exist? -->
```

### Issue: Layout Broken

**Symptoms**: Elements stacked incorrectly, sidebar missing, content too wide

**Diagnosis**:
1. Check Bootstrap grid classes
2. Look for unclosed tags
3. Verify container structure

**Fixes**:
```html
<!-- Ensure proper Bootstrap structure -->
<div class="container">
    <div class="row">
        <div class="col-md-8">Main content</div>
        <div class="col-md-4">Sidebar</div>
    </div>
</div>
```

### Issue: Text Overflow

**Symptoms**: Text cut off, overflows container

**Fixes**:
```html
<!-- Add overflow handling -->
<div class="text-truncate">Long text here</div>

<!-- Or allow wrapping -->
<div class="text-wrap">Long text here</div>
```

### Issue: Form Fields Misaligned

**Symptoms**: Labels not aligned with inputs, uneven spacing

**Fixes**:
```html
<!-- Use Bootstrap form groups -->
<div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input type="email" class="form-control" id="email" th:field="*{email}">
</div>
```

### Issue: Table Not Styled

**Symptoms**: Plain HTML table without Bootstrap styling

**Fixes**:
```html
<table class="table table-striped table-hover">
    <thead class="table-dark">
        <tr><th>Column</th></tr>
    </thead>
    <tbody>
        <!-- rows -->
    </tbody>
</table>
```

---

## Responsive Testing

### Test Different Widths

```
browser_resize with:
  width: 1200  # Desktop
  height: 800

browser_take_screenshot()

browser_resize with:
  width: 768   # Tablet
  height: 1024

browser_take_screenshot()

browser_resize with:
  width: 375   # Mobile
  height: 667

browser_take_screenshot()
```

### Common Responsive Issues

| Width | Common Issue | Fix |
|-------|--------------|-----|
| Mobile | Sidebar overlaps content | Use `col-12` for mobile, `col-md-4` for desktop |
| Tablet | Table too wide | Add `table-responsive` wrapper |
| All | Fixed-width elements | Use percentage widths or Bootstrap grid |

---

## Before/After Comparison

When auto-fixing, always capture before and after:

```
# Before fix
browser_take_screenshot(filename: "before-fix.png")

# Apply fix to template
Edit template file...

# After fix (may need page reload)
browser_navigate(same URL)
browser_take_screenshot(filename: "after-fix.png")

# Compare: Did the fix work?
```

---

## Screenshot File Management

### Naming Convention

```
{timestamp}-{page}-{state}.png

Examples:
- 2024-01-15-users-list-initial.png
- 2024-01-15-users-form-validation-error.png
- 2024-01-15-users-form-after-fix.png
```

### Storage Location

Save to: `./dev/ui-tests/screenshots/`

---

## Integration with Functional Testing

Visual testing complements functional testing:

1. **Functional**: Verify the form submits successfully
2. **Visual**: Verify the success message looks correct

```
# Functional check
browser_fill_form(...)
browser_click(submit)
browser_wait_for("User created")
browser_snapshot()  # Verify state

# Visual check
browser_take_screenshot()  # Verify appearance
```
