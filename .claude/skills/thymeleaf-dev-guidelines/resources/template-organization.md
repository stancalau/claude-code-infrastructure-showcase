# Template Organization

## Directory Structure

### Recommended Layout

```
src/main/resources/
├── templates/
│   ├── layout/                    # Base layouts
│   │   ├── base.html              # Public pages layout
│   │   ├── admin-base.html        # Admin panel layout
│   │   └── auth-base.html         # Login/register layout
│   │
│   ├── fragments/                 # Reusable components
│   │   ├── head.html              # Common <head> content
│   │   ├── navigation.html        # Main nav menu
│   │   ├── sidebar.html           # Sidebar menu
│   │   ├── footer.html            # Page footer
│   │   ├── alerts.html            # Flash messages
│   │   ├── pagination.html        # Pagination controls
│   │   └── modals.html            # Modal dialogs
│   │
│   ├── components/                # UI components
│   │   ├── cards.html             # Card components
│   │   ├── tables.html            # Table components
│   │   └── forms.html             # Form field components
│   │
│   ├── pages/                     # Public pages
│   │   ├── home.html
│   │   ├── about.html
│   │   └── contact.html
│   │
│   ├── auth/                      # Authentication pages
│   │   ├── login.html
│   │   ├── register.html
│   │   └── forgot-password.html
│   │
│   ├── admin/                     # Admin section
│   │   ├── dashboard.html
│   │   ├── users/
│   │   │   ├── list.html
│   │   │   ├── form.html
│   │   │   └── show.html
│   │   └── settings/
│   │       └── index.html
│   │
│   └── error/                     # Error pages
│       ├── 404.html
│       ├── 403.html
│       ├── 500.html
│       └── error.html
│
├── static/
│   ├── css/
│   │   ├── styles.css             # Custom styles
│   │   └── admin.css              # Admin-specific styles
│   ├── js/
│   │   ├── app.js                 # Main JavaScript
│   │   └── admin.js               # Admin JavaScript
│   └── images/
│       ├── logo.png
│       └── favicon.ico
│
└── messages/                      # i18n messages
    ├── messages.properties        # Default (English)
    ├── messages_de.properties     # German
    └── messages_fr.properties     # French
```

---

## Naming Conventions

### Templates

| Type | Convention | Example |
|------|------------|---------|
| Layouts | `{scope}-base.html` | `admin-base.html` |
| Fragments | `{component}.html` | `navigation.html` |
| Pages | `{name}.html` | `home.html` |
| CRUD list | `list.html` | `users/list.html` |
| CRUD form | `form.html` | `users/form.html` |
| CRUD detail | `show.html` | `users/show.html` |

### Static Assets

```
static/
├── css/
│   ├── styles.css         # Main styles
│   ├── {module}.css       # Module-specific
├── js/
│   ├── app.js             # Main script
│   ├── {module}.js        # Module-specific
└── images/
    └── {descriptive-name}.{ext}
```

---

## Template Headers

### Standard HTML5 Template

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:lang="${#locale.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="_csrf" th:content="${_csrf.token}">
    <meta name="_csrf_header" th:content="${_csrf.headerName}">
    <title th:text="#{page.title}">App Name</title>

    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet">
    <link th:href="@{/css/styles.css}" rel="stylesheet">
</head>
<body>
    <!-- Content -->

    <!-- JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script th:src="@{/js/app.js}"></script>
</body>
</html>
```

---

## WebJars Integration

### Maven Dependencies

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>bootstrap</artifactId>
    <version>5.3.2</version>
</dependency>
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>webjars-locator-core</artifactId>
    <version>0.55</version>
</dependency>
```

### Using WebJars in Templates

```html
<link th:href="@{/webjars/bootstrap/css/bootstrap.min.css}" rel="stylesheet">
<script th:src="@{/webjars/bootstrap/js/bootstrap.bundle.min.js}"></script>
```

---

## Asset Versioning

### Configuration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                .resourceChain(true)
                .addResolver(new VersionResourceResolver()
                    .addContentVersionStrategy("/**"));
    }
}
```

### Template Usage

```html
<link th:href="@{/static/css/styles.css}" rel="stylesheet">
```

---

## Template Caching

### Development (disable caching)

```yaml
# application-dev.yml
spring:
  thymeleaf:
    cache: false
    prefix: file:src/main/resources/templates/
  resources:
    static-locations: file:src/main/resources/static/
    cache:
      period: 0
```

### Production (enable caching)

```yaml
# application-prod.yml
spring:
  thymeleaf:
    cache: true
```

---

## Template Resolution

### Custom Template Resolver

```java
@Configuration
public class ThymeleafConfig {

    @Bean
    public SpringResourceTemplateResolver templateResolver() {
        SpringResourceTemplateResolver resolver = new SpringResourceTemplateResolver();
        resolver.setPrefix("classpath:/templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);
        return resolver;
    }
}
```

---

## Best Practices

### DO

- Keep templates under 200 lines - extract fragments
- Use semantic HTML5 elements
- Group related templates in subdirectories
- Use descriptive file names
- Maintain consistent indentation
- Place scripts at end of body
- Use minified CSS/JS in production

### DON'T

- Put business logic in templates
- Create deeply nested directories (max 3 levels)
- Mix layouts with page content
- Hardcode URLs - use `@{...}`
- Use inline styles
- Duplicate common elements - use fragments
