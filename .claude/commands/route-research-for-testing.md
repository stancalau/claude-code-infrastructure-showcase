---
description: Map edited step definitions & launch BDD tests
argument-hint: "[/extra/path …]"
allowed-tools: Bash(cat:*), Bash(awk:*), Bash(grep:*), Bash(sort:*), Bash(xargs:*), Bash(sed:*)
model: sonnet
---

## Context

Changed step definition files this session (auto-generated):

!cat "$CLAUDE_PROJECT_DIR/.claude/build-cache"/\*/edited-files.log \
 | awk -F: '{print $2}' \
 | grep -E '(Steps|StepDefs)\.java' \
 | sort -u

User-specified additional files: `$ARGUMENTS`

## Your task

Follow the numbered steps **exactly**:

1. Combine the auto list with `$ARGUMENTS`, dedupe, and identify the Cucumber step definitions
   by examining @Given, @When, @Then annotations.
2. For each step definition file, output a JSON record with the step patterns,
   associated feature files, and container/WebDriver dependencies.
3. **Now call the `Task` tool** using:

```json
{
    "tool": "Task",
    "parameters": {
        "description": "BDD scenario tests",
        "prompt": "Run the bdd-scenario-tester sub-agent on the JSON above."
    }
}
```
