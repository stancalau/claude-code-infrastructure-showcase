# Forms and Validation

## Basic Form Structure

### Form with Object Binding

```html
<form th:action="@{/users}" th:object="${userForm}" method="post" class="needs-validation">
    <!-- CSRF token automatically included by Spring Security -->

    <div class="mb-3">
        <label for="name" class="form-label" th:text="#{user.name}">Name</label>
        <input type="text" id="name" th:field="*{name}"
               class="form-control"
               th:classappend="${#fields.hasErrors('name')} ? 'is-invalid'"
               required>
        <div th:if="${#fields.hasErrors('name')}" class="invalid-feedback">
            <span th:errors="*{name}">Name error</span>
        </div>
    </div>

    <div class="mb-3">
        <label for="email" class="form-label" th:text="#{user.email}">Email</label>
        <input type="email" id="email" th:field="*{email}"
               class="form-control"
               th:classappend="${#fields.hasErrors('email')} ? 'is-invalid'"
               required>
        <div th:if="${#fields.hasErrors('email')}" class="invalid-feedback">
            <span th:errors="*{email}">Email error</span>
        </div>
    </div>

    <button type="submit" class="btn btn-primary" th:text="#{button.save}">Save</button>
    <a th:href="@{/users}" class="btn btn-secondary" th:text="#{button.cancel}">Cancel</a>
</form>
```

### Controller for Form

```java
@Controller
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/new")
    public String showForm(Model model) {
        model.addAttribute("userForm", new UserForm());
        return "admin/users/form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("userForm") UserForm form,
                        BindingResult result,
                        RedirectAttributes ra) {
        if (result.hasErrors()) {
            return "admin/users/form";
        }

        userService.create(form);
        ra.addFlashAttribute("successMessage", "User created successfully");
        return "redirect:/users";
    }
}
```

### Form DTO with Validation

```java
@Data
public class UserForm {

    private Long id;

    @NotBlank(message = "{validation.name.required}")
    @Size(min = 2, max = 100, message = "{validation.name.size}")
    private String name;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    private String email;

    @NotBlank(message = "{validation.password.required}")
    @Size(min = 8, message = "{validation.password.minLength}")
    private String password;

    @NotNull(message = "{validation.role.required}")
    private UserRole role;
}
```

---

## Edit Form (Pre-populated)

```java
@GetMapping("/{id}/edit")
public String editForm(@PathVariable Long id, Model model) {
    User user = userService.findById(id);
    UserForm form = userMapper.toForm(user);
    model.addAttribute("userForm", form);
    model.addAttribute("isEdit", true);
    return "admin/users/form";
}

@PutMapping("/{id}")
public String update(@PathVariable Long id,
                    @Valid @ModelAttribute("userForm") UserForm form,
                    BindingResult result,
                    RedirectAttributes ra) {
    if (result.hasErrors()) {
        return "admin/users/form";
    }

    userService.update(id, form);
    ra.addFlashAttribute("successMessage", "User updated successfully");
    return "redirect:/users";
}
```

```html
<form th:action="${isEdit} ? @{/users/{id}(id=${userForm.id})} : @{/users}"
      th:object="${userForm}"
      th:method="${isEdit} ? 'put' : 'post'"
      class="needs-validation">

    <input type="hidden" th:if="${isEdit}" th:field="*{id}">

    <!-- Form fields... -->

    <button type="submit" class="btn btn-primary">
        <span th:text="${isEdit} ? #{button.update} : #{button.create}">Save</span>
    </button>
</form>
```

---

## Select Dropdowns

### Single Select

```html
<div class="mb-3">
    <label for="role" class="form-label" th:text="#{user.role}">Role</label>
    <select id="role" th:field="*{role}" class="form-select"
            th:classappend="${#fields.hasErrors('role')} ? 'is-invalid'">
        <option value="" th:text="#{select.placeholder}">-- Select --</option>
        <option th:each="role : ${roles}"
                th:value="${role}"
                th:text="${role.displayName}">Role Name</option>
    </select>
    <div th:if="${#fields.hasErrors('role')}" class="invalid-feedback">
        <span th:errors="*{role}">Role error</span>
    </div>
</div>
```

### Multi-Select

```html
<div class="mb-3">
    <label for="permissions" class="form-label" th:text="#{user.permissions}">Permissions</label>
    <select id="permissions" th:field="*{permissionIds}" class="form-select" multiple size="5">
        <option th:each="perm : ${permissions}"
                th:value="${perm.id}"
                th:text="${perm.name}">Permission</option>
    </select>
</div>
```

---

## Checkboxes and Radio Buttons

### Single Checkbox

```html
<div class="mb-3 form-check">
    <input type="checkbox" id="active" th:field="*{active}" class="form-check-input">
    <label for="active" class="form-check-label" th:text="#{user.active}">Active</label>
</div>
```

### Checkbox Group

```html
<div class="mb-3">
    <label class="form-label" th:text="#{user.interests}">Interests</label>
    <div th:each="interest : ${interests}" class="form-check">
        <input type="checkbox"
               th:id="${'interest-' + interest.id}"
               th:field="*{interestIds}"
               th:value="${interest.id}"
               class="form-check-input">
        <label th:for="${'interest-' + interest.id}"
               class="form-check-label"
               th:text="${interest.name}">Interest</label>
    </div>
</div>
```

### Radio Button Group

```html
<div class="mb-3">
    <label class="form-label" th:text="#{user.status}">Status</label>
    <div th:each="status : ${statuses}" class="form-check">
        <input type="radio"
               th:id="${'status-' + status}"
               th:field="*{status}"
               th:value="${status}"
               class="form-check-input">
        <label th:for="${'status-' + status}"
               class="form-check-label"
               th:text="${status.displayName}">Status</label>
    </div>
</div>
```

---

## File Upload

### Template

```html
<form th:action="@{/users/{id}/avatar(id=${user.id})}"
      method="post"
      enctype="multipart/form-data">
    <div class="mb-3">
        <label for="avatar" class="form-label" th:text="#{user.avatar}">Avatar</label>
        <input type="file" id="avatar" name="file" class="form-control"
               accept="image/*">
        <div class="form-text" th:text="#{user.avatar.help}">
            Accepted formats: JPG, PNG. Max size: 2MB
        </div>
    </div>
    <button type="submit" class="btn btn-primary" th:text="#{button.upload}">Upload</button>
</form>
```

### Controller

```java
@PostMapping("/{id}/avatar")
public String uploadAvatar(@PathVariable Long id,
                          @RequestParam("file") MultipartFile file,
                          RedirectAttributes ra) {
    if (file.isEmpty()) {
        ra.addFlashAttribute("errorMessage", "Please select a file");
        return "redirect:/users/" + id + "/edit";
    }

    userService.updateAvatar(id, file);
    ra.addFlashAttribute("successMessage", "Avatar uploaded successfully");
    return "redirect:/users/" + id;
}
```

---

## Date and Time Fields

```html
<div class="mb-3">
    <label for="birthDate" class="form-label" th:text="#{user.birthDate}">Birth Date</label>
    <input type="date" id="birthDate" th:field="*{birthDate}" class="form-control">
</div>

<div class="mb-3">
    <label for="appointmentTime" class="form-label">Appointment</label>
    <input type="datetime-local" id="appointmentTime"
           th:field="*{appointmentTime}" class="form-control">
</div>
```

### Date Formatting in Model

```java
@DateTimeFormat(pattern = "yyyy-MM-dd")
private LocalDate birthDate;

@DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
private LocalDateTime appointmentTime;
```

---

## Global Validation Errors

```html
<div th:if="${#fields.hasGlobalErrors()}" class="alert alert-danger">
    <ul class="mb-0">
        <li th:each="error : ${#fields.globalErrors()}" th:text="${error}">Error</li>
    </ul>
</div>
```

### Adding Global Errors in Controller

```java
@PostMapping
public String create(@Valid @ModelAttribute("userForm") UserForm form,
                    BindingResult result) {
    if (userService.existsByEmail(form.getEmail())) {
        result.reject("email.duplicate", "Email already exists");
    }

    if (result.hasErrors()) {
        return "admin/users/form";
    }
    // ...
}
```

---

## Form Field Component Fragment

```html
<!-- fragments/forms.html -->
<th:block th:fragment="inputField(field, label, type, required)">
    <div class="mb-3">
        <label th:for="${field}" class="form-label">
            <span th:text="${label}">Label</span>
            <span th:if="${required}" class="text-danger">*</span>
        </label>
        <input th:type="${type ?: 'text'}"
               th:id="${field}"
               th:name="${field}"
               th:value="*{__${field}__}"
               class="form-control"
               th:classappend="${#fields.hasErrors('__${field}__')} ? 'is-invalid'"
               th:required="${required}">
        <div th:if="${#fields.hasErrors('__${field}__')}" class="invalid-feedback">
            <span th:errors="*{__${field}__}">Error</span>
        </div>
    </div>
</th:block>
```

### Usage

```html
<div th:replace="~{fragments/forms :: inputField('name', #{user.name}, 'text', true)}"></div>
<div th:replace="~{fragments/forms :: inputField('email', #{user.email}, 'email', true)}"></div>
```

---

## Best Practices

### DO

- Always use `th:field` for form binding
- Display all validation errors near their fields
- Use `@Valid` on controller parameters
- Provide helpful error messages in message properties
- Include CSRF protection (automatic with Spring Security)
- Use POST for form submissions
- Redirect after successful POST (PRG pattern)

### DON'T

- Hardcode validation messages
- Forget to check `BindingResult.hasErrors()`
- Use GET for form submissions
- Expose entity objects directly - use DTOs
- Skip client-side validation (use HTML5 attributes too)
