# Agents

Specialized agents for complex, multi-step tasks in LiveKit testing framework development.

---

## What Are Agents?

Agents are autonomous Claude instances that handle specific complex tasks. Unlike skills (which provide inline guidance), agents:
- Run as separate sub-tasks
- Work autonomously with minimal supervision
- Have specialized tool access
- Return comprehensive reports when complete

**Key advantage:** Agents are **standalone** - just copy the `.md` file and use immediately!

---

## Available Agents (11)

### code-architecture-reviewer
**Purpose:** Review code for architectural consistency and best practices

**When to use:**
- After implementing a new container or page object
- Before merging significant changes
- When refactoring code
- To validate architectural decisions

**Integration:** Copy as-is

---

### code-refactor-master
**Purpose:** Plan and execute comprehensive refactoring

**When to use:**
- Reorganizing package structures
- Breaking down large classes
- Updating import paths after moves
- Improving code maintainability

**Integration:** Copy as-is

---

### documentation-architect
**Purpose:** Create comprehensive documentation

**When to use:**
- Documenting new containers or page objects
- Creating test framework guides
- Writing developer documentation
- Generating architectural overviews

**Integration:** Copy as-is

---

### plan-reviewer
**Purpose:** Review development plans before implementation

**When to use:**
- Before starting complex features
- Validating architectural plans
- Identifying potential issues early
- Getting second opinion on approach

**Integration:** Copy as-is

---

### product-owner
**Purpose:** Define features, write user stories, create acceptance criteria

**When to use:**
- Defining new test scenarios
- Breaking down large tasks into stories
- Writing acceptance criteria
- Organizing requirements documentation

**Integration:** Copy as-is (works with product-owner skill)

---

### request-analyzer
**Purpose:** Analyze vague requests and generate clarifying questions

**When to use:**
- User request is vague or incomplete
- Multiple interpretations possible
- Critical details are missing
- Scope is unclear

**Integration:** Copy as-is + hook available

---

### refactor-planner
**Purpose:** Create comprehensive refactoring strategies

**When to use:**
- Planning code reorganization
- Modernizing legacy code
- Breaking down large files
- Improving code structure

**Integration:** Copy as-is

---

### web-research-specialist
**Purpose:** Research technical issues online

**When to use:**
- Debugging obscure errors
- Finding solutions to problems
- Researching best practices
- Comparing implementation approaches

**Integration:** Copy as-is

---

### bdd-scenario-tester
**Purpose:** Test Cucumber BDD scenarios

**When to use:**
- Testing new feature files
- Validating step definitions
- Debugging scenario failures
- Verifying BDD test infrastructure

**Integration:** Copy as-is (Cucumber/Gherkin focused)

---

### container-debugger
**Purpose:** Debug TestContainers and Docker issues

**When to use:**
- Container startup failures
- Network connectivity issues
- Port mapping problems
- Health check failures

**Integration:** Copy as-is (TestContainers focused)

---

### auto-error-resolver
**Purpose:** Automatically fix Java compilation errors

**When to use:**
- Build failures with compilation errors
- After refactoring that breaks code
- Systematic error resolution needed

**Integration:** Works with Gradle projects

---

## How to Integrate an Agent

### Standard Integration (Most Agents)

**Step 1: Copy the file**
```powershell
Copy-Item showcase/.claude/agents/agent-name.md `
   your-project/.claude/agents/
```

**Step 2: Use it**
Ask Claude: "Use the [agent-name] agent to [task]"

That's it! Agents work immediately.

---

### Agents Requiring Customization

**bdd-scenario-tester:**
- Requires Cucumber/Gherkin setup
- Update paths for your feature files
- Customize for your step definition patterns

**container-debugger:**
- Requires TestContainers setup
- Update for your container types
- Customize for your Docker configuration

**auto-error-resolver:**
- Works with Gradle (./gradlew)
- Update commands if using Maven

---

## When to Use Agents vs Skills

| Use Agents When... | Use Skills When... |
|-------------------|-------------------|
| Task requires multiple steps | Need inline guidance |
| Complex analysis needed | Checking best practices |
| Autonomous work preferred | Want to maintain control |
| Task has clear end goal | Ongoing development work |
| Example: "Test all BDD scenarios" | Example: "Creating a new container" |

**Both can work together:**
- Skill provides patterns during development
- Agent tests/reviews the result when complete

---

## Agent Quick Reference

| Agent | Complexity | Customization | Focus |
|-------|-----------|---------------|-------|
| code-architecture-reviewer | Medium | None | Code quality |
| code-refactor-master | High | None | Refactoring |
| documentation-architect | Medium | None | Documentation |
| plan-reviewer | Low | None | Planning |
| product-owner | Medium | None | Requirements |
| request-analyzer | Low | None | Clarification |
| refactor-planner | Medium | None | Strategy |
| web-research-specialist | Low | None | Research |
| bdd-scenario-tester | Medium | Paths | Cucumber BDD |
| container-debugger | Medium | Container types | TestContainers |
| auto-error-resolver | Low | Build tool | Compilation |

---

## For Claude Code

**When integrating agents for a user:**

1. **Read [CLAUDE_INTEGRATION_GUIDE.md](../../CLAUDE_INTEGRATION_GUIDE.md)**
2. **Just copy the .md file** - agents are standalone
3. **For BDD agents:** Ask if they use Cucumber first
4. **For container agents:** Ask about their TestContainers setup
5. **For auto-error-resolver:** Confirm Gradle or Maven project

**That's it!** Agents are the easiest components to integrate.

---

## Creating Your Own Agents

Agents are markdown files with optional YAML frontmatter:

```markdown
---
name: agent-name
description: Brief description
tools: Read, Write, Edit, Bash
---

## Purpose
What this agent does

## Instructions
Step-by-step instructions for autonomous execution

## Tools Available
List of tools this agent can use

## Expected Output
What format to return results in
```

**Tips:**
- Be very specific in instructions
- Break complex tasks into numbered steps
- Specify exactly what to return
- Include examples of good output
- List available tools explicitly

---

## Troubleshooting

### Agent not found

**Check:**
```powershell
Get-Item .claude/agents/[agent-name].md
```

### Agent fails with path errors

**Check for hardcoded paths:**
```powershell
Select-String -Path ".claude/agents/[agent-name].md" -Pattern "~/|/root/"
```

---

## Next Steps

1. **Browse agents above** - Find ones useful for your work
2. **Copy what you need** - Just the .md file
3. **Ask Claude to use them** - "Use [agent] to [task]"
4. **Create your own** - Follow the pattern for your specific needs

**Questions?** See [CLAUDE_INTEGRATION_GUIDE.md](../../CLAUDE_INTEGRATION_GUIDE.md)
