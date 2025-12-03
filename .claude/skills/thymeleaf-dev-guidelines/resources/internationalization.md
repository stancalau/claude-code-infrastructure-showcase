# Internationalization (i18n)

## Message Properties Setup

### File Structure

```
src/main/resources/
├── messages.properties          # Default (English)
├── messages_de.properties       # German
├── messages_fr.properties       # French
├── messages_es.properties       # Spanish
└── ValidationMessages.properties # Bean Validation messages
```

### Example Messages (English)

```properties
# messages.properties

# Application
app.name=My Application
app.tagline=Welcome to our platform

# Navigation
nav.home=Home
nav.about=About
nav.contact=Contact
nav.login=Login
nav.logout=Logout
nav.profile=Profile
nav.dashboard=Dashboard
nav.admin=Admin Panel

# Buttons
button.save=Save
button.cancel=Cancel
button.delete=Delete
button.edit=Edit
button.create=Create
button.update=Update
button.search=Search
button.submit=Submit
button.back=Back

# Pages
page.home.title=Home - {0}
page.home.heading=Welcome
page.home.intro=Welcome to our application

page.about.title=About Us
page.about.heading=About Our Company

# User management
user.list.title=Users
user.list.heading=User Management
user.name=Name
user.email=Email
user.role=Role
user.status=Status
user.createdAt=Created At
user.actions=Actions

# Forms
form.required=Required field
select.placeholder=-- Select an option --

# Login
login.title=Sign In
login.heading=Sign In to Your Account
login.username=Username
login.password=Password
login.rememberMe=Remember me
login.submit=Sign In
login.forgotPassword=Forgot your password?
login.error.invalid=Invalid username or password
login.logout.success=You have been logged out successfully

# Validation
validation.name.required=Name is required
validation.name.size=Name must be between {min} and {max} characters
validation.email.required=Email is required
validation.email.invalid=Please enter a valid email address
validation.password.required=Password is required
validation.password.minLength=Password must be at least {min} characters

# Messages
message.success.created={0} created successfully
message.success.updated={0} updated successfully
message.success.deleted={0} deleted successfully
message.error.notFound={0} not found
message.error.duplicate={0} already exists

# Pagination
pagination.previous=Previous
pagination.next=Next
pagination.showing=Showing {0} to {1} of {2} entries

# Confirmation
confirm.delete=Are you sure you want to delete this {0}?
confirm.unsaved=You have unsaved changes. Are you sure you want to leave?

# Errors
error.404.title=Page Not Found
error.404.message=The page you are looking for does not exist.
error.500.title=Server Error
error.500.message=An unexpected error occurred. Please try again later.
error.403.title=Access Denied
error.403.message=You do not have permission to access this page.
```

### German Translation

```properties
# messages_de.properties

app.name=Meine Anwendung
app.tagline=Willkommen auf unserer Plattform

nav.home=Startseite
nav.about=Über uns
nav.contact=Kontakt
nav.login=Anmelden
nav.logout=Abmelden
nav.profile=Profil

button.save=Speichern
button.cancel=Abbrechen
button.delete=Löschen
button.edit=Bearbeiten

login.title=Anmelden
login.heading=Bei Ihrem Konto anmelden
login.username=Benutzername
login.password=Passwort
login.rememberMe=Angemeldet bleiben
login.submit=Anmelden
```

---

## Using Messages in Templates

### Basic Message

```html
<h1 th:text="#{page.home.heading}">Welcome</h1>
<p th:text="#{page.home.intro}">Introduction</p>
```

### Messages with Parameters

```html
<!-- Single parameter -->
<title th:text="#{page.home.title(${appName})}">Home - App</title>

<!-- Multiple parameters -->
<p th:text="#{pagination.showing(${start}, ${end}, ${total})}">
    Showing 1 to 10 of 100 entries
</p>

<!-- Dynamic entity name -->
<div class="alert alert-success"
     th:text="#{message.success.created(#{user.entity})}">
    User created successfully
</div>
```

### Inline Messages

```html
<button type="submit">[[#{button.save}]]</button>

<span>[[#{nav.home}]]</span>
```

### Message in Attributes

```html
<input type="text" th:placeholder="#{form.search.placeholder}">
<button th:title="#{button.delete.tooltip}">X</button>
<img th:alt="#{image.logo.alt}" th:src="@{/images/logo.png}">
```

---

## Locale Configuration

### Application Properties

```yaml
spring:
  messages:
    basename: messages
    encoding: UTF-8
    cache-duration: 3600
    fallback-to-system-locale: false
```

### Locale Resolver Configuration

```java
@Configuration
public class LocaleConfig implements WebMvcConfigurer {

    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }
}
```

### Cookie-Based Locale (Alternative)

```java
@Bean
public LocaleResolver localeResolver() {
    CookieLocaleResolver resolver = new CookieLocaleResolver("app-locale");
    resolver.setDefaultLocale(Locale.ENGLISH);
    resolver.setCookieMaxAge(Duration.ofDays(365));
    return resolver;
}
```

---

## Language Switcher

### Template

```html
<!-- fragments/language-switcher.html -->
<div th:fragment="switcher" class="dropdown">
    <button class="btn btn-sm btn-outline-secondary dropdown-toggle"
            data-bs-toggle="dropdown">
        <span th:switch="${#locale.language}">
            <span th:case="'en'">English</span>
            <span th:case="'de'">Deutsch</span>
            <span th:case="'fr'">Français</span>
            <span th:case="*">[[${#locale.displayLanguage}]]</span>
        </span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        <li>
            <a class="dropdown-item"
               th:href="@{''(lang='en')}"
               th:classappend="${#locale.language == 'en'} ? 'active'">
                English
            </a>
        </li>
        <li>
            <a class="dropdown-item"
               th:href="@{''(lang='de')}"
               th:classappend="${#locale.language == 'de'} ? 'active'">
                Deutsch
            </a>
        </li>
        <li>
            <a class="dropdown-item"
               th:href="@{''(lang='fr')}"
               th:classappend="${#locale.language == 'fr'} ? 'active'">
                Français
            </a>
        </li>
    </ul>
</div>
```

### Include in Navigation

```html
<nav class="navbar">
    <!-- ... other nav items ... -->
    <div th:replace="~{fragments/language-switcher :: switcher}"></div>
</nav>
```

---

## Date and Number Formatting

### Date Formatting

```html
<span th:text="${#temporals.format(user.createdAt, 'dd MMMM yyyy')}">
    01 January 2024
</span>

<!-- With locale-specific pattern -->
<span th:text="${#temporals.format(user.createdAt, #messages.msg('date.format'))}">
    01/01/2024
</span>
```

### Number Formatting

```html
<span th:text="${#numbers.formatDecimal(price, 1, 2)}">99.99</span>

<span th:text="${#numbers.formatCurrency(price)}">$99.99</span>

<span th:text="${#numbers.formatPercent(0.25)}">25%</span>
```

### Locale-Aware Formatting

```properties
# messages.properties
date.format=MMM dd, yyyy
date.format.long=MMMM dd, yyyy

# messages_de.properties
date.format=dd.MM.yyyy
date.format.long=dd. MMMM yyyy
```

---

## Validation Messages

### ValidationMessages.properties

```properties
# ValidationMessages.properties
jakarta.validation.constraints.NotBlank.message=This field is required
jakarta.validation.constraints.NotNull.message=This field is required
jakarta.validation.constraints.Email.message=Please enter a valid email
jakarta.validation.constraints.Size.message=Must be between {min} and {max} characters
jakarta.validation.constraints.Min.message=Must be at least {value}
jakarta.validation.constraints.Max.message=Must be at most {value}
jakarta.validation.constraints.Pattern.message=Invalid format

# Custom validators
password.mismatch=Passwords do not match
username.taken=This username is already taken
```

### Using in DTO

```java
public record UserForm(
    @NotBlank(message = "{validation.name.required}")
    @Size(min = 2, max = 100, message = "{validation.name.size}")
    String name,

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    String email
) {}
```

---

## HTML Lang Attribute

```html
<html th:lang="${#locale.language}"
      xmlns:th="http://www.thymeleaf.org">
```

---

## Best Practices

### DO

- Use message keys for ALL user-visible text
- Provide meaningful default text in templates
- Use parameters for dynamic content
- Organize messages by feature/page
- Include locale in HTML lang attribute
- Test with different locales

### DON'T

- Hardcode text in templates
- Use generic message keys
- Mix languages in templates
- Forget to handle missing translations
- Use string concatenation for messages
