# Claude Code Infrastructure Showcase

**A curated reference library of production-tested Claude Code infrastructure for LiveKit Testing Framework development.**

Born from real-world use managing complex testing frameworks, this showcase provides the patterns and systems that solved the "skills don't activate automatically" problem and scaled Claude Code for Java test automation development.

> **This is NOT a working application** - it's a reference library. Copy what you need into your own projects.

---

## What's Inside

**Production-tested infrastructure for:**
- Auto-activating skills via hooks
- Modular skill pattern (500-line rule with progressive disclosure)
- Specialized agents for complex tasks
- Dev docs system that survives context resets
- Comprehensive examples using LiveKit testing patterns

**Target Project:** [LiveKit Testing Framework](https://github.com/Stancalau-ro/livekit-testing)

---

## Tech Stack Reference

This showcase is designed for projects using:

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21+ | Core language |
| **Gradle** | Latest | Build tool |
| **JUnit 5** | 5.x | Unit testing |
| **Cucumber** | 7.18.0 | BDD testing framework |
| **Selenium WebDriver** | 4.27.0 | Browser automation |
| **TestContainers** | 1.20.4 | Docker container orchestration |
| **LiveKit Server SDK** | 0.8.5 | WebRTC server integration |
| **MinIO** | S3-compatible | Storage testing |
| **Redis** | Container | Caching/state |
| **Lombok** | Latest | Boilerplate reduction |
| **AWS SDK** | 2.20.68 | S3 client utilities |

---

## Quick Start - Pick Your Path

### Using Claude Code to Integrate?

**Claude:** Read [`CLAUDE_INTEGRATION_GUIDE.md`](CLAUDE_INTEGRATION_GUIDE.md) for step-by-step integration instructions tailored for AI-assisted setup.

### I want skill auto-activation

**The breakthrough feature:** Skills that actually activate when you need them.

**What you need:**
1. The skill-activation hook (1 essential file)
2. A skill or two relevant to your work
3. 15 minutes

**[Setup Guide: .claude/hooks/README.md](.claude/hooks/README.md)**

### I want to add ONE skill

Browse the [skills catalog](.claude/skills/) and copy what you need.

**Available:**
- **livekit-testing-guidelines** - Container orchestration, page objects, state management
- **skill-developer** - Meta-skill for creating skills
- **bdd-tester** - Cucumber/Gherkin BDD testing patterns
- **error-tracking** - Logging and test debugging patterns

**[Skills Guide: .claude/skills/README.md](.claude/skills/README.md)**

### I want specialized agents

9 production-tested agents for complex tasks:
- Code architecture review
- Refactoring assistance
- Documentation generation
- BDD scenario testing
- Container debugging
- And more...

**[Agents Guide: .claude/agents/README.md](.claude/agents/README.md)**

---

## What Makes This Different?

### The Auto-Activation Breakthrough

**Problem:** Claude Code skills just sit there. You have to remember to use them.

**Solution:** UserPromptSubmit hook that:
- Analyzes your prompts
- Checks file context
- Automatically suggests relevant skills
- Works via `skill-rules.json` configuration

**Result:** Skills activate when you need them, not when you remember them.

### Production-Tested Patterns

These aren't theoretical examples - they're extracted from:
- LiveKit WebRTC testing in production
- BDD/Cucumber integration testing
- TestContainers Docker orchestration
- Selenium browser automation
- Real-world test framework development

The patterns work because they solved real problems.

### Modular Skills (500-Line Rule)

Large skills hit context limits. The solution:

```
skill-name/
  SKILL.md                  # <500 lines, high-level guide
  resources/
    topic-1.md              # <500 lines each
    topic-2.md
    topic-3.md
```

**Progressive disclosure:** Claude loads main skill first, loads resources only when needed.

---

## Repository Structure

```
.claude/
├── skills/                 # 4 production skills
│   ├── livekit-testing-guidelines/  (resource files)
│   ├── skill-developer/         (7 resource files)
│   ├── bdd-tester/
│   ├── error-tracking/
│   └── skill-rules.json    # Skill activation configuration
├── hooks/                  # 2 TypeScript hooks (cross-platform)
│   ├── skill-activation-prompt.ts   (ESSENTIAL)
│   └── error-handling-reminder.ts   (optional)
├── agents/                 # 9 specialized agents
│   ├── code-architecture-reviewer.md
│   ├── refactor-planner.md
│   ├── bdd-scenario-tester.md
│   └── ... more
└── commands/               # 3 slash commands
    ├── dev-docs.md
    └── ...

dev/
└── active/                 # Dev docs pattern examples
    └── public-infrastructure-repo/
```

---

## Component Catalog

### Skills (4)

| Skill | Lines | Purpose | Best For |
|-------|-------|---------|----------|
| [**skill-developer**](.claude/skills/skill-developer/) | ~400 | Creating and managing skills | Meta-development |
| [**livekit-testing-guidelines**](.claude/skills/livekit-testing-guidelines/) | ~500 | TestContainers/Page Objects/State management | Test framework development |
| [**bdd-tester**](.claude/skills/bdd-tester/) | ~300 | Cucumber/Gherkin BDD patterns | BDD test creation |
| [**error-tracking**](.claude/skills/error-tracking/) | ~250 | Logging and test debugging | Test troubleshooting |

**All skills follow the modular pattern** - main file + resource files for progressive disclosure.

**[How to integrate skills](.claude/skills/README.md)**

### Hooks (2)

| Hook | Type | Essential? | Customization |
|------|------|-----------|---------------|
| skill-activation-prompt | UserPromptSubmit | YES | None needed |
| error-handling-reminder | Stop | Optional | Moderate |

**Start with the essential hook** - skill-activation-prompt enables auto-activation and works out of the box.

**[Hook setup guide](.claude/hooks/README.md)**

### Agents (9)

**Standalone - just copy and use!**

| Agent | Purpose |
|-------|---------|
| code-architecture-reviewer | Review code for architectural consistency |
| code-refactor-master | Plan and execute refactoring |
| documentation-architect | Generate comprehensive documentation |
| plan-reviewer | Review development plans |
| refactor-planner | Create refactoring strategies |
| web-research-specialist | Research technical issues online |
| bdd-scenario-tester | Test Cucumber BDD scenarios |
| container-debugger | Debug TestContainers/Docker issues |
| auto-error-resolver | Auto-fix Java compilation errors |

**[How agents work](.claude/agents/README.md)**

### Slash Commands (3)

| Command | Purpose |
|---------|---------|
| /dev-docs | Create structured dev documentation |
| /dev-docs-update | Update docs before context reset |
| /route-research-for-testing | Research test patterns |

---

## Key Concepts

### Hooks + skill-rules.json = Auto-Activation

**The system:**
1. **skill-activation-prompt hook** runs on every user prompt
2. Checks **skill-rules.json** for trigger patterns
3. Suggests relevant skills automatically
4. Skills load only when needed

**This solves the #1 problem** with Claude Code skills: they don't activate on their own.

### Progressive Disclosure (500-Line Rule)

**Problem:** Large skills hit context limits

**Solution:** Modular structure
- Main SKILL.md <500 lines (overview + navigation)
- Resource files <500 lines each (deep dives)
- Claude loads incrementally as needed

**Example:** livekit-testing-guidelines has resource files covering containers, page objects, state management, WebRTC automation, and more.

### Dev Docs Pattern

**Problem:** Context resets lose project context

**Solution:** Three-file structure
- `[task]-plan.md` - Strategic plan
- `[task]-context.md` - Key decisions and files
- `[task]-tasks.md` - Checklist format

**Works with:** `/dev-docs` slash command to generate these automatically

---

## Important: What Won't Work As-Is

### settings.json
The included `settings.json` is an **example only**:
- Stop hooks reference specific project structure
- Service names are examples
- MCP servers may not exist in your setup

**To use it:**
1. Extract ONLY UserPromptSubmit and PostToolUse hooks
2. Customize or skip Stop hooks
3. Update MCP server list for your setup

### Example Patterns
Skills use generic testing examples:
- These are **teaching examples**, not requirements
- Patterns work for any domain testing
- Adapt the patterns to your specific test scenarios

---

## Integration Workflow

**Recommended approach:**

### Phase 1: Skill Activation (10 min)
1. Copy skill-activation-prompt.ts hook
2. Update settings.json with hook configuration
3. Run `npm install` in .claude/hooks directory

### Phase 2: Add First Skill (10 min)
1. Pick ONE relevant skill
2. Copy skill directory
3. Create/update skill-rules.json
4. Customize path patterns

### Phase 3: Test & Iterate (5 min)
1. Edit a file - skill should activate
2. Ask a question - skill should be suggested
3. Add more skills as needed

### Phase 4: Optional Enhancements
- Add agents you find useful
- Add slash commands
- Customize Stop hooks (advanced)

---

## LiveKit Testing Framework Context

### Project Structure (Target)

```
src/main/java/ro/stancalau/test/framework/
├── container/              # Docker container management
│   ├── LiveKitContainer.java
│   ├── EgressContainer.java
│   ├── MinIOContainer.java
│   └── RedisContainer.java
├── page/                   # Page Objects for WebRTC
│   ├── LiveKitMeet.java
│   ├── WebrtcPublish.java
│   └── WebrtcPlayback.java
├── state/                  # State management
│   ├── ContainerStateManager.java
│   ├── RoomClientStateManager.java
│   └── WebDriverStateManager.java
├── config/                 # Configuration
│   └── SeleniumConfig.java
└── util/                   # Utilities
    ├── StringParsingUtils.java
    ├── S3ClientUtils.java
    ├── DateUtils.java
    └── FileUtils.java

src/test/java/ro/stancalau/test/
├── framework/              # Unit tests
└── bdd/                    # BDD step definitions
    └── steps/

src/test/resources/
└── features/               # Cucumber feature files
    └── *.feature
```

### Key Features

- **Container Orchestration:** Automated LiveKit, Redis, MinIO, and Egress container management
- **WebRTC Automation:** Real browser testing with video/audio via Selenium
- **BDD Testing:** Cucumber/Gherkin for readable test scenarios
- **VNC Recording:** Configurable test recording (skip/failed/all)
- **Token Management:** Comprehensive LiveKit permission handling (17 permission types)
- **CI/CD Ready:** Headless execution support

---

## Getting Help

### For Users
**Issues with integration?**
1. Check [CLAUDE_INTEGRATION_GUIDE.md](CLAUDE_INTEGRATION_GUIDE.md)
2. Ask Claude: "Why isn't [skill] activating?"
3. Open an issue with your project structure

### For Claude Code
When helping users integrate:
1. **Read CLAUDE_INTEGRATION_GUIDE.md FIRST**
2. Ask about their project structure
3. Customize, don't blindly copy
4. Verify after integration

---

## What This Solves

### Before This Infrastructure

- Skills don't activate automatically
- Have to remember which skill to use
- Large skills hit context limits
- Context resets lose project knowledge
- No consistency across development
- Manual agent invocation every time

### After This Infrastructure

- Skills suggest themselves based on context
- Hooks trigger skills at the right time
- Modular skills stay under context limits
- Dev docs preserve knowledge across resets
- Consistent patterns via guardrails
- Agents streamline complex tasks

---

## Community

**Found this useful?**

- Star this repo
- Report issues or suggest improvements
- Share your own skills/hooks/agents
- Contribute examples from your domain

**Background:**
This infrastructure was detailed in a post I made to Reddit ["Claude Code is a Beast - Tips from 6 Months of Hardcore Use"](https://www.reddit.com/r/ClaudeAI/comments/1oivjvm/claude_code_is_a_beast_tips_from_6_months_of/). After hundreds of requests, this showcase was created to help the community implement these patterns.

---

## License

MIT License - Use freely in your projects, commercial or personal.

---

## Quick Links

- [Claude Integration Guide](CLAUDE_INTEGRATION_GUIDE.md) - For AI-assisted setup
- [Skills Documentation](.claude/skills/README.md)
- [Hooks Setup](.claude/hooks/README.md)
- [Agents Guide](.claude/agents/README.md)
- [Dev Docs Pattern](dev/README.md)

**Start here:** Copy the essential hook, add one skill, and see the auto-activation magic happen.
