# Claude Integration Guide

**FOR CLAUDE CODE:** When a user asks you to integrate components from this showcase repository into their project, follow these instructions carefully.

---

## Overview

This repository is a **reference library** of Claude Code infrastructure components for LiveKit Testing Framework development. Users will ask you to help integrate specific pieces into their projects. Your role is to:

1. **Ask clarifying questions** about their project structure
2. **Copy the appropriate files**
3. **Customize configurations** for their setup
4. **Verify the integration** works correctly

**Key Principle:** ALWAYS ask before assuming project structure. What works for one project won't work for another.

---

## Tech Stack Compatibility Check

**CRITICAL:** Before integrating a skill, verify the user's tech stack matches the skill requirements.

### LiveKit Testing Skills

**livekit-testing-guidelines requires:**
- Java 21+
- Gradle
- TestContainers 1.20.x
- Lombok
- JUnit 5

**Before integrating, ask:**
"Do you use Java 21+ with Gradle and TestContainers?"

**If NO:**
```
The livekit-testing-guidelines skill is designed for Java 21+ with TestContainers. I can:
1. Help you create similar guidelines adapted for [their stack] using this as a template
2. Extract the architecture patterns (container orchestration works for any containerized testing)
3. Skip this skill

Which would you prefer?
```

### BDD Testing Skills

**bdd-tester requires:**
- Cucumber 7.x
- JUnit 5
- Gherkin feature files
- Step definitions

**Before integrating, ask:**
"Do you use Cucumber/Gherkin for BDD testing?"

**If NO:**
```
The bdd-tester skill is designed for Cucumber BDD testing. I can:
1. Adapt it for your test framework (TestNG, plain JUnit, etc.)
2. Extract BDD concepts without Cucumber specifics
3. Skip this skill

Which would you prefer?
```

### Skills That Are Tech-Agnostic

These work for ANY tech stack:
- **skill-developer** - Meta-skill, no tech requirements
- **error-tracking** - Logging patterns (concepts transfer across frameworks)

---

## General Integration Pattern

When user says: **"Add [component] to my project"**

1. Identify component type (skill/hook/agent/command)
2. **CHECK TECH STACK COMPATIBILITY**
3. Ask about their project structure
4. Copy files OR adapt for their stack
5. Customize for their setup
6. Verify integration
7. Provide next steps

---

## Integrating Skills

### Step-by-Step Process

**When user requests a skill** (e.g., "add livekit-testing-guidelines"):

#### 1. Understand Their Project

**ASK THESE QUESTIONS:**
- "What's your project structure? Standard Gradle or multi-module?"
- "Where is your Java source code located?"
- "Do you use TestContainers for container orchestration?"
- "Do you use Cucumber for BDD testing?"

#### 2. Copy the Skill

```powershell
Copy-Item -Recurse showcase/.claude/skills/[skill-name] .claude/skills/
```

#### 3. Handle skill-rules.json

**Check if it exists:**
```powershell
Test-Path .claude/skills/skill-rules.json
```

**If NO (doesn't exist):**
- Copy the template from showcase
- Remove skills user doesn't want
- Customize for their project

**If YES (exists):**
- Read their current skill-rules.json
- Add the new skill entry
- Merge carefully to avoid breaking existing skills

#### 4. Customize Path Patterns

**CRITICAL:** Update `pathPatterns` in skill-rules.json to match THEIR structure:

**Example - LiveKit testing framework structure:**
```json
{
  "livekit-testing-guidelines": {
    "fileTriggers": {
      "pathPatterns": [
        "src/main/java/**/container/**/*.java",
        "src/main/java/**/page/**/*.java",
        "src/main/java/**/state/**/*.java",
        "src/main/java/**/config/**/*.java"
      ]
    }
  }
}
```

**Example - BDD test files:**
```json
{
  "bdd-tester": {
    "fileTriggers": {
      "pathPatterns": [
        "src/test/resources/features/**/*.feature",
        "src/test/java/**/bdd/**/*.java",
        "src/test/java/**/steps/**/*.java"
      ]
    }
  }
}
```

**Safe Generic Patterns** (when unsure):
```json
{
  "pathPatterns": [
    "**/*.java",
    "src/main/java/**/*.java",
    "src/test/java/**/*.java"
  ]
}
```

#### 5. Verify Integration

```powershell
# Check skill was copied
Get-Item .claude/skills/[skill-name]

# Validate skill-rules.json syntax
Get-Content .claude/skills/skill-rules.json | ConvertFrom-Json
```

**Tell user:** "Try editing a Java file in [their-source-path] and the skill should activate."

---

### Skill-Specific Notes

#### livekit-testing-guidelines
- **Tech Requirements:** Java 21+, Gradle, TestContainers, Lombok
- **Ask:** "Do you use TestContainers?" "Where's your container code?"
- **If different stack:** Offer to adapt using this as template
- **Customize:** pathPatterns for container, page, state, config directories
- **Example paths:** `src/main/java/**/container/`, `src/main/java/**/page/`

#### bdd-tester
- **Tech Requirements:** Cucumber 7.x, JUnit 5
- **Ask:** "Do you use Cucumber for BDD testing?"
- **If NO:** "This skill is designed for Cucumber BDD. Want me to adapt it or skip it?"
- **Customize:** Feature file and step definition paths
- **Works with:** Gherkin, Step Definitions, Scenario Outlines

#### error-tracking
- **Tech Requirements:** SLF4J/Logback (works with any Java project)
- **Ask:** "Do you use SLF4J for logging?" "Where's your Java source code?"
- **Customize:** pathPatterns
- **Adaptation tip:** Logging philosophy transfers to other frameworks

#### skill-developer
- **Tech Requirements:** None!
- **Copy as-is** - meta-skill, fully generic, teaches skill creation for ANY tech stack

---

## Adapting Skills for Different Tech Stacks

When user's tech stack differs from skill requirements, you have options:

### Option 1: Adapt Existing Skill (Recommended)

**When to use:** User wants similar guidelines but for different tech

**Process:**
1. **Copy the skill as a starting point:**
   ```powershell
   Copy-Item -Recurse showcase/.claude/skills/livekit-testing-guidelines `
         .claude/skills/playwright-testing-guidelines
   ```

2. **Identify what needs changing:**
   - Framework-specific code examples (Selenium -> Playwright)
   - Container patterns (TestContainers -> Docker Compose)
   - Build tool patterns (Gradle -> Maven)

3. **Keep what transfers:**
   - Page Object patterns
   - State management principles
   - Container orchestration concepts
   - Test organization strategies

### Option 2: Extract Framework-Agnostic Patterns

**When to use:** Stacks are very different, but core principles apply

**What Usually Transfers Across Tech Stacks:**

**Architecture & Organization:**
- Page Object pattern for browser automation
- State management patterns
- Container orchestration concepts
- Test data management

**Development Practices:**
- BDD/Gherkin test specification
- Logging best practices
- Test isolation strategies
- CI/CD integration patterns

**Framework-Specific Code:**
- Selenium WebDriver -> Different browser automation
- TestContainers -> Different container orchestration
- Cucumber annotations -> Different BDD framework

---

## Integrating Hooks

### Prerequisites

**Node.js is required** for hooks to work. Hooks are written in TypeScript and run via `npx tsx`, which works identically on Windows, Linux, and Mac.

**Check Node.js Installation:**
```powershell
node --version
npm --version
```

**Install Node.js:**

| Platform | Command |
|----------|---------|
| **Windows** | `winget install OpenJS.NodeJS.LTS` |
| **Linux (Ubuntu/Debian)** | `curl -fsSL https://deb.nodesource.com/setup_lts.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **Mac** | `brew install node` |

---

### Essential Hooks (Always Safe to Copy)

#### skill-activation-prompt (UserPromptSubmit)

**Purpose:** Auto-suggests skills based on user prompts

**Integration (NO customization needed):**

```powershell
# Copy TypeScript files and dependencies
Copy-Item showcase/.claude/hooks/skill-activation-prompt.ts .claude/hooks/
Copy-Item showcase/.claude/hooks/package.json .claude/hooks/
Copy-Item showcase/.claude/hooks/tsconfig.json .claude/hooks/

# Install dependencies
Set-Location .claude/hooks
npm install
```

**Add to settings.json (works on ALL platforms):**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/skill-activation-prompt.ts"
          }
        ]
      }
    ]
  }
}
```

**This hook is FULLY GENERIC** - works on Windows, Linux, and Mac with no changes!

#### error-handling-reminder (Stop)

**Purpose:** Reminds about best practices when Java files are edited

**Checks for:**
- Containers without proper cleanup
- Missing @Slf4j logging
- Test methods without proper assertions
- Missing state cleanup

**Integration:**

```powershell
Copy-Item showcase/.claude/hooks/error-handling-reminder.ts .claude/hooks/
```

**Add to settings.json:**
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/error-handling-reminder.ts"
          }
        ]
      }
    ]
  }
}
```

**This hook is FULLY GENERIC** - cross-platform, no customization needed!

---

### Optional Hooks (Require Heavy Customization)

#### Build-related hooks

**WARNING:** Stop hooks are configured for specific project structures.

**For SIMPLE projects (single module):**
- **RECOMMEND SKIPPING** these hooks
- They're overkill for single-module projects
- User can run `./gradlew compileJava` manually instead

**For COMPLEX projects (multi-module):**
1. Copy the files
2. **MUST EDIT** to match your project structure
3. Test manually before adding to settings.json

---

## Integrating Agents

**Agents are STANDALONE** - easiest to integrate!

### Standard Agent Integration

```powershell
# Copy the agent file
Copy-Item showcase/.claude/agents/[agent-name].md .claude/agents/
```

**That's it!** Agents work immediately, no configuration needed.

### Agent-Specific Notes

**bdd-scenario-tester / container-debugger:**
- Work with Cucumber and TestContainers respectively
- Ask: "Do you use Cucumber for BDD?" "Do you use TestContainers?"
- If NO: "These agents are specialized. Skip them or want me to adapt?"

**auto-error-resolver:**
- Works with Maven or Gradle
- May need build command updates (`./gradlew` vs `mvn`)

**All other agents:**
- Copy as-is, they're fully generic

---

## Integrating Slash Commands

```powershell
# Copy command file
Copy-Item showcase/.claude/commands/[command].md .claude/commands/
```

### Customize Paths

Commands may reference dev docs paths. **Check and update:**

**dev-docs and dev-docs-update:**
- Look for `dev/active/` path references
- Ask: "Where do you want dev documentation stored?"
- Update paths in the command files

---

## Common Patterns & Best Practices

### Pattern: Asking About Project Structure

**DON'T assume:**
- "I'll add this for your container module"
- "Configuring for your src/main/java directory"

**DO ask:**
- "What's your project structure? Standard Gradle or multi-module?"
- "Where is your Java source code located?"
- "Do you use Gradle or Maven?"

### Pattern: Customizing skill-rules.json

**User has standard LiveKit testing structure:**
```json
{
  "pathPatterns": [
    "src/main/java/**/container/**/*.java",
    "src/main/java/**/page/**/*.java",
    "src/main/java/**/state/**/*.java",
    "src/test/java/**/bdd/**/*.java",
    "src/test/resources/features/**/*.feature"
  ]
}
```

**User has simple structure:**
```json
{
  "pathPatterns": [
    "src/main/java/**/*.java",
    "src/test/java/**/*.java"
  ]
}
```

### Pattern: settings.json Integration

**NEVER copy the showcase settings.json directly!**

Instead, **extract and merge** the sections they need:

1. Read their existing settings.json
2. Add the hook configurations they want
3. Preserve their existing config

---

## Verification Checklist

After integration, **verify these items:**

```powershell
# 1. skill-rules.json is valid JSON
Get-Content .claude/skills/skill-rules.json | ConvertFrom-Json

# 2. Hook dependencies installed
Get-ChildItem .claude/hooks/node_modules/

# 3. Settings.json is valid JSON
Get-Content .claude/settings.json | ConvertFrom-Json

# 4. Node.js is available (required for hooks)
node --version
```

**Then ask user to test:**
- "Try editing a Java file in [relevant-path] - the skill should activate"
- "Try asking me a question about [topic] - I should suggest the skill"

---

## Common Mistakes to Avoid

### DON'T: Copy settings.json as-is
**Why:** The Stop hooks reference non-existent services
**DO:** Extract only UserPromptSubmit and PostToolUse sections

### DON'T: Keep example module names
**Why:** User doesn't have container, page, state, etc. directories
**DO:** Ask about their actual structure and update

### DON'T: Assume Gradle structure
**Why:** User might use Maven or different directory layout
**DO:** Ask first, then customize

### DON'T: Add all skills at once
**Why:** Overwhelming and may not all be relevant
**DO:** Ask which skills are relevant to their work

---

## Example Integration Conversations

### Example 1: Adding LiveKit Testing Skill

**User:** "Add the livekit-testing-guidelines skill to my project"

**Claude should respond:**
```
I'll add the livekit-testing-guidelines skill. First, I need to understand
your project structure:

1. Is this a standard Gradle or multi-module project?
2. Where is your Java source code located?
3. Do you use TestContainers for container orchestration?
4. Do you have container, page object, and state management classes?
```

**User:** "Standard Gradle, code is in src/main/java/, yes I use TestContainers"

**Claude should:**
1. Copy the skill directory
2. Update skill-rules.json with appropriate pathPatterns
3. Verify it's copied correctly
4. Respond:
```
Added livekit-testing-guidelines skill!

Configuration:
- Skill triggers when editing files in src/main/java/
- Activated by keywords like "container", "page object", "TestContainers", "WebDriver"

Try it: Edit a Java file and you should see the skill suggestion.
```

### Example 2: Tech Stack Mismatch

**User:** "Add the bdd-tester skill to my TestNG project"

**Claude should:**
```
I see you're using TestNG. The bdd-tester skill is specifically
designed for Cucumber/Gherkin BDD testing. I have a few options:

Option 1 (Recommended): I can create a testng-testing skill using the
BDD skill as a template. I'll adapt:
- Test annotations for TestNG (@Test, @BeforeMethod, etc.)
- Data providers instead of Scenario Outlines
- TestNG assertions and reporting
- Keep: Test organization, logging, state management patterns

Option 2: Extract only the framework-agnostic patterns (test organization,
page objects, logging) without Cucumber-specific code.

Option 3: Skip it and help you create TestNG guidelines from scratch.

Which would you prefer?
```

---

## Quick Reference Tables

### What Needs Customization?

| Component | Tech Requirements | Customization | What to Ask |
|-----------|------------------|--------------|-------------|
| **skill-developer** | None | None | Copy as-is |
| **livekit-testing-guidelines** | Java 21+/TestContainers | Paths + tech check | "Use TestContainers?" "Where's container code?" |
| **bdd-tester** | Cucumber 7.x | Test paths | "Use Cucumber/Gherkin?" |
| **error-tracking** | SLF4J | Paths | "Where's Java source?" |
| **skill-activation-prompt** | Node.js | None | Copy as-is, run `npm install` |
| **error-handling-reminder** | Node.js | None | Copy as-is, run `npm install` |
| **All agents** | Minimal | Check paths | Container/BDD for specialized |
| **All commands** | Paths | Ask about dev docs location |

### When to Recommend Skipping

| Component | Skip If... |
|-----------|-----------|
| **Build hooks** | Single-module project or different build setup |
| **bdd-tester** | Not using Cucumber/Gherkin patterns |
| **container agents** | Not using TestContainers |

---

## Final Tips for Claude

**When user says "add everything":**
- Start with essentials: skill-activation hooks + 1-2 relevant skills
- Don't overwhelm them with all skills + agents
- Ask what they actually need

**When something doesn't work:**
- Check verification checklist
- Verify paths match their structure
- Test hooks manually
- Check for JSON syntax errors

**When user is unsure:**
- Recommend starting with just skill-activation hooks
- Add livekit-testing-guidelines if they use TestContainers
- Add more later as needed

**Always explain what you're doing:**
- Show the commands you're running
- Explain why you're asking questions
- Provide clear next steps after integration

---

**Remember:** This is a reference library, not a working application. Your job is to help users cherry-pick and adapt components for THEIR specific project structure.
