# Complete Examples

## Full CRUD Application Example

This example demonstrates a complete User management feature with list, create, edit, and delete functionality.

---

## Entity

```java
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

## Form DTO

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserForm {

    private Long id;

    @NotBlank(message = "{validation.name.required}")
    @Size(min = 2, max = 100, message = "{validation.name.size}")
    private String name;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    private String email;

    @NotNull(message = "{validation.role.required}")
    private UserRole role;

    private boolean active = true;
}
```

---

## Controller

```java
@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public String list(@RequestParam(defaultValue = "0") int page,
                      @RequestParam(defaultValue = "10") int size,
                      Model model) {
        Page<User> users = userService.findAll(PageRequest.of(page, size));
        model.addAttribute("users", users);
        return "admin/users/list";
    }

    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("userForm", new UserForm());
        model.addAttribute("roles", UserRole.values());
        model.addAttribute("isEdit", false);
        return "admin/users/form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("userForm") UserForm form,
                        BindingResult result,
                        Model model,
                        RedirectAttributes ra) {
        if (userService.existsByEmail(form.getEmail())) {
            result.rejectValue("email", "email.duplicate", "Email already exists");
        }

        if (result.hasErrors()) {
            model.addAttribute("roles", UserRole.values());
            model.addAttribute("isEdit", false);
            return "admin/users/form";
        }

        userService.create(form);
        ra.addFlashAttribute("successMessage", "User created successfully");
        return "redirect:/admin/users";
    }

    @GetMapping("/{id}")
    public String show(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "admin/users/show";
    }

    @GetMapping("/{id}/edit")
    public String showEditForm(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        UserForm form = userService.toForm(user);
        model.addAttribute("userForm", form);
        model.addAttribute("roles", UserRole.values());
        model.addAttribute("isEdit", true);
        return "admin/users/form";
    }

    @PutMapping("/{id}")
    public String update(@PathVariable Long id,
                        @Valid @ModelAttribute("userForm") UserForm form,
                        BindingResult result,
                        Model model,
                        RedirectAttributes ra) {
        if (result.hasErrors()) {
            model.addAttribute("roles", UserRole.values());
            model.addAttribute("isEdit", true);
            return "admin/users/form";
        }

        userService.update(id, form);
        ra.addFlashAttribute("successMessage", "User updated successfully");
        return "redirect:/admin/users";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        userService.delete(id);
        ra.addFlashAttribute("successMessage", "User deleted successfully");
        return "redirect:/admin/users";
    }
}
```

---

## List Template

```html
<!-- admin/users/list.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:replace="~{layout/admin-base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{user.list.title}">Users</title>
</head>
<body>
<main>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 th:text="#{user.list.heading}">User Management</h1>
        <a th:href="@{/admin/users/new}" class="btn btn-primary"
           sec:authorize="hasAuthority('WRITE_USERS')">
            <i class="bi bi-plus-lg me-1"></i>
            <span th:text="#{button.addUser}">Add User</span>
        </a>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th th:text="#{user.name}">Name</th>
                            <th th:text="#{user.email}">Email</th>
                            <th th:text="#{user.role}">Role</th>
                            <th th:text="#{user.status}">Status</th>
                            <th th:text="#{user.createdAt}">Created</th>
                            <th th:text="#{user.actions}">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr th:each="user, stat : ${users.content}">
                            <td th:text="${stat.index + 1 + (users.number * users.size)}">1</td>
                            <td th:text="${user.name}">John Doe</td>
                            <td th:text="${user.email}">john@example.com</td>
                            <td>
                                <span class="badge"
                                      th:classappend="${user.role.name() == 'ADMIN'} ? 'bg-danger' : 'bg-secondary'"
                                      th:text="${user.role.displayName}">User</span>
                            </td>
                            <td>
                                <span class="badge"
                                      th:classappend="${user.active} ? 'bg-success' : 'bg-warning'"
                                      th:text="${user.active} ? #{status.active} : #{status.inactive}">Active</span>
                            </td>
                            <td th:text="${#temporals.format(user.createdAt, 'MMM dd, yyyy')}">
                                Jan 01, 2024
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a th:href="@{/admin/users/{id}(id=${user.id})}"
                                       class="btn btn-outline-info" th:title="#{button.view}">
                                        <i class="bi bi-eye"></i>
                                    </a>
                                    <a th:href="@{/admin/users/{id}/edit(id=${user.id})}"
                                       class="btn btn-outline-warning" th:title="#{button.edit}"
                                       sec:authorize="hasAuthority('WRITE_USERS')">
                                        <i class="bi bi-pencil"></i>
                                    </a>
                                    <form th:action="@{/admin/users/{id}(id=${user.id})}"
                                          method="post" class="d-inline"
                                          sec:authorize="hasAuthority('DELETE_USERS')"
                                          onsubmit="return confirm('Are you sure?');">
                                        <input type="hidden" name="_method" value="delete">
                                        <button type="submit" class="btn btn-outline-danger"
                                                th:title="#{button.delete}">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        <tr th:if="${users.empty}">
                            <td colspan="7" class="text-center text-muted py-4">
                                <span th:text="#{user.list.empty}">No users found</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <nav th:if="${users.totalPages > 1}" aria-label="Page navigation">
                <ul class="pagination justify-content-center mb-0">
                    <li class="page-item" th:classappend="${users.first} ? 'disabled'">
                        <a class="page-link"
                           th:href="@{/admin/users(page=${users.number - 1})}">
                            <span th:text="#{pagination.previous}">Previous</span>
                        </a>
                    </li>
                    <li th:each="pageNum : ${#numbers.sequence(0, users.totalPages - 1)}"
                        class="page-item"
                        th:classappend="${pageNum == users.number} ? 'active'">
                        <a class="page-link"
                           th:href="@{/admin/users(page=${pageNum})}"
                           th:text="${pageNum + 1}">1</a>
                    </li>
                    <li class="page-item" th:classappend="${users.last} ? 'disabled'">
                        <a class="page-link"
                           th:href="@{/admin/users(page=${users.number + 1})}">
                            <span th:text="#{pagination.next}">Next</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</main>
</body>
</html>
```

---

## Form Template

```html
<!-- admin/users/form.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/admin-base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="${isEdit} ? #{user.edit.title} : #{user.create.title}">User Form</title>
</head>
<body>
<main>
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0"
                        th:text="${isEdit} ? #{user.edit.heading} : #{user.create.heading}">
                        User Form
                    </h4>
                </div>
                <div class="card-body">
                    <form th:action="${isEdit} ? @{/admin/users/{id}(id=${userForm.id})} : @{/admin/users}"
                          th:object="${userForm}"
                          th:method="${isEdit} ? 'put' : 'post'"
                          class="needs-validation" novalidate>

                        <input type="hidden" th:if="${isEdit}" th:field="*{id}">

                        <div th:if="${#fields.hasGlobalErrors()}" class="alert alert-danger">
                            <ul class="mb-0">
                                <li th:each="error : ${#fields.globalErrors()}"
                                    th:text="${error}">Error</li>
                            </ul>
                        </div>

                        <div class="mb-3">
                            <label for="name" class="form-label">
                                <span th:text="#{user.name}">Name</span>
                                <span class="text-danger">*</span>
                            </label>
                            <input type="text" id="name" th:field="*{name}"
                                   class="form-control"
                                   th:classappend="${#fields.hasErrors('name')} ? 'is-invalid'"
                                   required>
                            <div th:if="${#fields.hasErrors('name')}" class="invalid-feedback">
                                <span th:errors="*{name}">Name error</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label">
                                <span th:text="#{user.email}">Email</span>
                                <span class="text-danger">*</span>
                            </label>
                            <input type="email" id="email" th:field="*{email}"
                                   class="form-control"
                                   th:classappend="${#fields.hasErrors('email')} ? 'is-invalid'"
                                   required>
                            <div th:if="${#fields.hasErrors('email')}" class="invalid-feedback">
                                <span th:errors="*{email}">Email error</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="role" class="form-label">
                                <span th:text="#{user.role}">Role</span>
                                <span class="text-danger">*</span>
                            </label>
                            <select id="role" th:field="*{role}" class="form-select"
                                    th:classappend="${#fields.hasErrors('role')} ? 'is-invalid'"
                                    required>
                                <option value="" th:text="#{select.placeholder}">-- Select --</option>
                                <option th:each="role : ${roles}"
                                        th:value="${role}"
                                        th:text="${role.displayName}">Role</option>
                            </select>
                            <div th:if="${#fields.hasErrors('role')}" class="invalid-feedback">
                                <span th:errors="*{role}">Role error</span>
                            </div>
                        </div>

                        <div class="mb-3 form-check">
                            <input type="checkbox" id="active" th:field="*{active}"
                                   class="form-check-input">
                            <label for="active" class="form-check-label"
                                   th:text="#{user.active}">Active</label>
                        </div>

                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <span th:text="${isEdit} ? #{button.update} : #{button.create}">Save</span>
                            </button>
                            <a th:href="@{/admin/users}" class="btn btn-secondary"
                               th:text="#{button.cancel}">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>
</body>
</html>
```

---

## Detail/Show Template

```html
<!-- admin/users/show.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:replace="~{layout/admin-base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{user.show.title}">User Details</title>
</head>
<body>
<main>
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4 class="mb-0" th:text="#{user.show.heading}">User Details</h4>
                    <div class="btn-group btn-group-sm">
                        <a th:href="@{/admin/users/{id}/edit(id=${user.id})}"
                           class="btn btn-warning"
                           sec:authorize="hasAuthority('WRITE_USERS')">
                            <i class="bi bi-pencil me-1"></i>
                            <span th:text="#{button.edit}">Edit</span>
                        </a>
                        <a th:href="@{/admin/users}" class="btn btn-secondary">
                            <i class="bi bi-arrow-left me-1"></i>
                            <span th:text="#{button.backToList}">Back</span>
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <dl class="row">
                        <dt class="col-sm-3" th:text="#{user.id}">ID</dt>
                        <dd class="col-sm-9" th:text="${user.id}">1</dd>

                        <dt class="col-sm-3" th:text="#{user.name}">Name</dt>
                        <dd class="col-sm-9" th:text="${user.name}">John Doe</dd>

                        <dt class="col-sm-3" th:text="#{user.email}">Email</dt>
                        <dd class="col-sm-9" th:text="${user.email}">john@example.com</dd>

                        <dt class="col-sm-3" th:text="#{user.role}">Role</dt>
                        <dd class="col-sm-9">
                            <span class="badge bg-secondary"
                                  th:text="${user.role.displayName}">User</span>
                        </dd>

                        <dt class="col-sm-3" th:text="#{user.status}">Status</dt>
                        <dd class="col-sm-9">
                            <span class="badge"
                                  th:classappend="${user.active} ? 'bg-success' : 'bg-warning'"
                                  th:text="${user.active} ? #{status.active} : #{status.inactive}">
                                Active
                            </span>
                        </dd>

                        <dt class="col-sm-3" th:text="#{user.createdAt}">Created</dt>
                        <dd class="col-sm-9"
                            th:text="${#temporals.format(user.createdAt, 'MMMM dd, yyyy HH:mm')}">
                            January 01, 2024 12:00
                        </dd>

                        <dt class="col-sm-3" th:text="#{user.updatedAt}">Updated</dt>
                        <dd class="col-sm-9"
                            th:text="${#temporals.format(user.updatedAt, 'MMMM dd, yyyy HH:mm')}">
                            January 01, 2024 12:00
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</main>
</body>
</html>
```

---

## Messages Properties

```properties
# User management messages
user.list.title=User Management
user.list.heading=Users
user.list.empty=No users found

user.create.title=Create User
user.create.heading=Create New User

user.edit.title=Edit User
user.edit.heading=Edit User

user.show.title=User Details
user.show.heading=User Details

user.id=ID
user.name=Name
user.email=Email
user.role=Role
user.status=Status
user.active=Active
user.createdAt=Created At
user.updatedAt=Updated At
user.actions=Actions

status.active=Active
status.inactive=Inactive

button.addUser=Add User
button.backToList=Back to List
```

---

## Service Methods

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository repository;

    public Page<User> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public User findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Transactional
    public User create(UserForm form) {
        User user = User.builder()
            .name(form.getName())
            .email(form.getEmail())
            .role(form.getRole())
            .active(form.isActive())
            .build();
        return repository.save(user);
    }

    @Transactional
    public User update(Long id, UserForm form) {
        User user = findById(id);
        user.setName(form.getName());
        user.setEmail(form.getEmail());
        user.setRole(form.getRole());
        user.setActive(form.isActive());
        return repository.save(user);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    public UserForm toForm(User user) {
        return UserForm.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .active(user.isActive())
            .build();
    }
}
```

This complete example demonstrates all the key patterns: listing with pagination, create/edit forms with validation, detail view, flash messages, security integration, and proper i18n usage.
