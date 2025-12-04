# Skills

Production-tested skills for Claude Code that auto-activate based on context.

---

## What Are Skills?

Skills are modular knowledge bases that Claude loads when needed. They provide:
- Domain-specific guidelines
- Best practices
- Code examples
- Anti-patterns to avoid

**Problem:** Skills don't activate automatically by default.

**Solution:** This showcase includes the hooks + configuration to make them activate.

---

## Available Skills

### skill-developer (Meta-Skill)
**Purpose:** Creating and managing Claude Code skills

**Files:** 7 resource files

**Use when:**
- Creating new skills
- Understanding skill structure
- Working with skill-rules.json
- Debugging skill activation

**Customization:** None - copy as-is

**[View Skill](skill-developer/)**

---

### livekit-testing-guidelines
**Purpose:** LiveKit testing framework patterns with TestContainers, Selenium, and Cucumber

**Files:** 10 resource files

**Covers:**
- Container orchestration (LiveKit, Redis, MinIO, Egress)
- Page Object pattern for WebRTC automation
- State manager patterns for lifecycle coordination
- Selenium WebDriver configuration
- Cucumber/Gherkin BDD testing
- Token and permission management
- VNC recording and CI/CD patterns

**Use when:**
- Creating/modifying container classes
- Building page objects for WebRTC
- Implementing state managers
- Configuring Selenium automation
- Writing BDD scenarios

**Customization:** Update `pathPatterns` in skill-rules.json to match your Java directories

**Example pathPatterns:**
```json
{
  "pathPatterns": [
    "src/main/java/**/container/**/*.java",
    "src/main/java/**/page/**/*.java",
    "src/main/java/**/state/**/*.java",
    "src/test/resources/features/**/*.feature"
  ]
}
```

**[View Skill](livekit-testing-guidelines/)**

---

### bdd-tester
**Purpose:** Cucumber/Gherkin BDD testing patterns

**Files:** 1 main file

**Covers:**
- Feature file structure
- Step definitions
- Scenario Outlines with data tables
- Cucumber hooks (@Before/@After)
- State sharing between steps
- Tag-based test execution

**Use when:**
- Writing feature files
- Creating step definitions
- Setting up BDD test infrastructure
- Debugging scenario failures

**Customization:** Update paths for your feature files and step definitions

**[View Skill](bdd-tester/)**

---

### error-tracking
**Purpose:** Logging and debugging patterns for test frameworks

**Files:** 1 main file

**Covers:**
- SLF4J/Logback logging
- Container debugging
- WebDriver troubleshooting
- Cucumber scenario debugging
- Screenshot capture on failure
- Logback configuration

**Use when:**
- Adding logging to tests
- Debugging container issues
- Troubleshooting Selenium failures
- Investigating BDD scenario failures

**Customization:** Update `pathPatterns` for your project

**[View Skill](error-tracking/)**

---

## How to Add a Skill to Your Project

### Quick Integration

**For Claude Code:**
```
User: "Add the livekit-testing-guidelines skill to my project"

Claude should:
1. Ask about project structure
2. Copy skill directory
3. Update skill-rules.json with their paths
4. Verify integration
```

See [CLAUDE_INTEGRATION_GUIDE.md](../../CLAUDE_INTEGRATION_GUIDE.md) for complete instructions.

### Manual Integration

**Step 1: Copy the skill directory**
```powershell
Copy-Item -Recurse claude-code-infrastructure-showcase/.claude/skills/livekit-testing-guidelines `
      your-project/.claude/skills/
```

**Step 2: Update skill-rules.json**

If you don't have one, create it:
```powershell
Copy-Item claude-code-infrastructure-showcase/.claude/skills/skill-rules.json `
   your-project/.claude/skills/
```

Then customize the `pathPatterns` for your project:
```json
{
  "skills": {
    "livekit-testing-guidelines": {
      "fileTriggers": {
        "pathPatterns": [
          "src/main/java/**/*.java",
          "src/test/resources/features/**/*.feature"
        ]
      }
    }
  }
}
```

**Step 3: Test**
- Edit a Java file in your source directory
- The skill should activate automatically

---

## skill-rules.json Configuration

### What It Does

Defines when skills should activate based on:
- **Keywords** in user prompts ("container", "page object", "cucumber")
- **Intent patterns** (regex matching user intent)
- **File path patterns** (editing Java files, feature files)
- **Content patterns** (code contains GenericContainer, @Given)

### Configuration Format

```json
{
  "skill-name": {
    "type": "domain" | "guardrail",
    "enforcement": "suggest" | "block",
    "priority": "high" | "medium" | "low",
    "promptTriggers": {
      "keywords": ["list", "of", "keywords"],
      "intentPatterns": ["regex patterns"]
    },
    "fileTriggers": {
      "pathPatterns": ["src/main/java/**/*.java"],
      "contentPatterns": ["GenericContainer"]
    }
  }
}
```

### Enforcement Levels

- **suggest**: Skill appears as suggestion, doesn't block
- **block**: Must use skill before proceeding (guardrail)

**Use "block" for:**
- Preventing breaking changes
- Critical container operations
- Security-sensitive code

**Use "suggest" for:**
- General best practices
- Domain guidance
- Code organization

---

## Creating Your Own Skills

See the **skill-developer** skill for complete guide on:
- Skill YAML frontmatter structure
- Resource file organization
- Trigger pattern design
- Testing skill activation

**Quick template:**
```markdown
---
name: my-skill
description: What this skill does
---

# My Skill Title

## Purpose
[Why this skill exists]

## When to Use This Skill
[Auto-activation scenarios]

## Quick Reference
[Key patterns and examples]

## Resource Files
- [topic-1.md](resources/topic-1.md)
- [topic-2.md](resources/topic-2.md)
```

---

## Troubleshooting

### Skill isn't activating

**Check:**
1. Is skill directory in `.claude/skills/`?
2. Is skill listed in `skill-rules.json`?
3. Do `pathPatterns` match your files?
4. Are hooks installed and working?
5. Is settings.json configured correctly?

**Debug:**
```powershell
# Check skill exists
Get-ChildItem .claude/skills/

# Validate skill-rules.json
Get-Content .claude/skills/skill-rules.json | ConvertFrom-Json

# Check hooks exist
Get-ChildItem .claude/hooks/*.ts
```

### Skill activates too often

Update skill-rules.json:
- Make keywords more specific
- Narrow `pathPatterns`
- Increase specificity of `intentPatterns`

### Skill never activates

Update skill-rules.json:
- Add more keywords
- Broaden `pathPatterns`
- Add more `intentPatterns`

---

## For Claude Code

**When integrating a skill for a user:**

1. **Read [CLAUDE_INTEGRATION_GUIDE.md](../../CLAUDE_INTEGRATION_GUIDE.md)** first
2. Ask about their project structure
3. Customize `pathPatterns` in skill-rules.json
4. Verify the skill file has no hardcoded paths
5. Test activation after integration

**Common mistakes:**
- Keeping example paths
- Not asking about project structure
- Copying skill-rules.json without customization

---

## Next Steps

1. **Start simple:** Add one skill that matches your work
2. **Verify activation:** Edit a relevant file, skill should suggest
3. **Add more:** Once first skill works, add others
4. **Customize:** Adjust triggers based on your workflow

**Questions?** See [CLAUDE_INTEGRATION_GUIDE.md](../../CLAUDE_INTEGRATION_GUIDE.md) for comprehensive integration instructions.
