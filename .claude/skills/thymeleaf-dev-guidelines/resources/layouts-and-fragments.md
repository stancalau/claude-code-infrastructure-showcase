# Layouts and Fragments

## Layout Pattern

Thymeleaf layouts enable consistent page structure with replaceable content areas.

### Base Layout Template

```html
<!-- layout/base.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:fragment="layout(title, content)"
      th:lang="${#locale.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title th:replace="${title}">Default Title</title>
    <th:block th:replace="~{fragments/head :: styles}"></th:block>
</head>
<body>
    <header th:replace="~{fragments/navigation :: navbar}"></header>

    <main class="container py-4">
        <th:block th:replace="~{fragments/alerts :: messages}"></th:block>
        <th:block th:replace="${content}">Page content</th:block>
    </main>

    <footer th:replace="~{fragments/footer :: footer}"></footer>

    <th:block th:replace="~{fragments/head :: scripts}"></th:block>
</body>
</html>
```

### Using the Layout

```html
<!-- pages/home.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:replace="~{layout/base :: layout(~{::title}, ~{::main})}">
<head>
    <title th:text="#{page.home.title}">Home</title>
</head>
<body>
<main>
    <div class="row">
        <div class="col-12">
            <h1 th:text="#{page.home.heading}">Welcome</h1>
            <p th:text="#{page.home.intro}">Introduction text</p>
        </div>
    </div>
</main>
</body>
</html>
```

---

## Fragment Definition

### Basic Fragment

```html
<!-- fragments/navigation.html -->
<nav th:fragment="navbar" class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <a class="navbar-brand" th:href="@{/}" th:text="#{app.name}">App</a>

        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#navbarMain">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarMain">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/}"
                       th:classappend="${#httpServletRequest.requestURI == '/'} ? 'active'">
                        <span th:text="#{nav.home}">Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/about}"
                       th:classappend="${#httpServletRequest.requestURI == '/about'} ? 'active'">
                        <span th:text="#{nav.about}">About</span>
                    </a>
                </li>
            </ul>

            <ul class="navbar-nav">
                <th:block sec:authorize="!isAuthenticated()">
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/login}" th:text="#{nav.login}">Login</a>
                    </li>
                </th:block>
                <th:block sec:authorize="isAuthenticated()">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#"
                           data-bs-toggle="dropdown"
                           th:text="${#authentication.name}">User</a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" th:href="@{/profile}"
                                   th:text="#{nav.profile}">Profile</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form th:action="@{/logout}" method="post">
                                    <button type="submit" class="dropdown-item"
                                            th:text="#{nav.logout}">Logout</button>
                                </form>
                            </li>
                        </ul>
                    </li>
                </th:block>
            </ul>
        </div>
    </div>
</nav>
```

### Fragment with Parameters

```html
<!-- fragments/pagination.html -->
<nav th:fragment="pagination(page, baseUrl)" aria-label="Page navigation">
    <ul class="pagination justify-content-center">
        <li class="page-item" th:classappend="${page.first} ? 'disabled'">
            <a class="page-link" th:href="@{${baseUrl}(page=${page.number - 1})}">
                <span th:text="#{pagination.previous}">Previous</span>
            </a>
        </li>

        <li th:each="pageNum : ${#numbers.sequence(0, page.totalPages - 1)}"
            class="page-item"
            th:classappend="${pageNum == page.number} ? 'active'">
            <a class="page-link"
               th:href="@{${baseUrl}(page=${pageNum})}"
               th:text="${pageNum + 1}">1</a>
        </li>

        <li class="page-item" th:classappend="${page.last} ? 'disabled'">
            <a class="page-link" th:href="@{${baseUrl}(page=${page.number + 1})}">
                <span th:text="#{pagination.next}">Next</span>
            </a>
        </li>
    </ul>
</nav>
```

### Using Parameterized Fragment

```html
<div th:replace="~{fragments/pagination :: pagination(${users}, '/admin/users')}"></div>
```

---

## Fragment Inclusion

### th:replace vs th:insert

```html
<!-- th:replace - Replaces host tag with fragment -->
<div th:replace="~{fragments/footer :: footer}">This div disappears</div>

<!-- th:insert - Inserts fragment inside host tag -->
<div th:insert="~{fragments/footer :: footer}">
    <!-- Fragment content appears here, div remains -->
</div>

<!-- th:include (deprecated) - Inserts fragment content only -->
<div th:include="~{fragments/footer :: footer}">Content only</div>
```

### Fragment Selectors

```html
<!-- By fragment name -->
<div th:replace="~{fragments/nav :: navbar}"></div>

<!-- By DOM selector -->
<div th:replace="~{fragments/nav :: #main-nav}"></div>
<div th:replace="~{fragments/nav :: .nav-class}"></div>

<!-- Entire template -->
<div th:replace="~{fragments/modal}"></div>
```

---

## Head and Scripts Fragments

```html
<!-- fragments/head.html -->
<th:block th:fragment="styles">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet">
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link th:href="@{/css/styles.css}" rel="stylesheet">
</th:block>

<th:block th:fragment="scripts">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script th:src="@{/js/app.js}"></script>
</th:block>

<th:block th:fragment="admin-scripts">
    <script th:src="@{/js/admin.js}"></script>
</th:block>
```

---

## Alert Messages Fragment

```html
<!-- fragments/alerts.html -->
<th:block th:fragment="messages">
    <div th:if="${successMessage}" class="alert alert-success alert-dismissible fade show">
        <i class="bi bi-check-circle me-2"></i>
        <span th:text="${successMessage}">Success</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>

    <div th:if="${errorMessage}" class="alert alert-danger alert-dismissible fade show">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <span th:text="${errorMessage}">Error</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>

    <div th:if="${warningMessage}" class="alert alert-warning alert-dismissible fade show">
        <i class="bi bi-exclamation-circle me-2"></i>
        <span th:text="${warningMessage}">Warning</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>

    <div th:if="${infoMessage}" class="alert alert-info alert-dismissible fade show">
        <i class="bi bi-info-circle me-2"></i>
        <span th:text="${infoMessage}">Info</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
</th:block>
```

---

## Admin Layout

```html
<!-- layout/admin-base.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:fragment="layout(title, content)"
      th:lang="${#locale.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title th:replace="${title}">Admin</title>
    <th:block th:replace="~{fragments/head :: styles}"></th:block>
    <link th:href="@{/css/admin.css}" rel="stylesheet">
</head>
<body class="admin-body">
    <div class="d-flex">
        <aside th:replace="~{fragments/sidebar :: admin-sidebar}"></aside>

        <div class="flex-grow-1">
            <header th:replace="~{fragments/navigation :: admin-navbar}"></header>

            <main class="container-fluid py-4">
                <th:block th:replace="~{fragments/alerts :: messages}"></th:block>
                <th:block th:replace="${content}">Content</th:block>
            </main>
        </div>
    </div>

    <th:block th:replace="~{fragments/head :: scripts}"></th:block>
    <th:block th:replace="~{fragments/head :: admin-scripts}"></th:block>
</body>
</html>
```

---

## Best Practices

### DO

- Use `th:replace` for complete component replacement
- Keep fragments small and focused (single responsibility)
- Use parameters for configurable fragments
- Define fragments at the top of fragment files
- Use consistent naming: `fragment-name.html` + `fragmentName` inside

### DON'T

- Create circular fragment dependencies
- Put page-specific logic in shared fragments
- Use `th:include` (deprecated)
- Nest layouts deeply (max 2 levels)
- Duplicate fragment definitions
