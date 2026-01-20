# AI-Assisted Development Bootcamp
This bootcamp will showcase the tooling needed for all type of roles. How you choose to utilise these tools might differ but the underlaying tooling is the same. 

## Table of Contents
#### General
- [Getting Started](#1-getting-started)
- [Working with AI Agents](#2-working-with-ai-agents)
  - [2.1 What Are Agents?](#21-what-are-agents)
  - [2.2 The Importance of Planning](#22-the-importance-of-planning)
  - [2.3 Context Window Management](#23-context-window-management)
- [Model Context Protocol (MCP)](#3-model-context-protocol-mcp)
- [Safety and Guardrails](#4-safety-and-guardrails)
- [Task Orchestration with VibeKanban](#5-task-orchestration-with-vibekanban)

#### Engineering Specific
- [Advanced Planning with Speckit](#6-advanced-planning-with-speckit)
- [QA and Pull Requests](#7-qa-and-pull-requests)
- [Language Server Protocol (LSP)](#8-language-server-protocol-lsp)

#### Product / Design / Business
- [Transforming & Structurering Data](#9-transforming--structurering-data)


## 1. Getting Started

### Prerequisites

You'll need:
- An IDE ([Cursor](https://cursor.com), VSCode, or terminal-only)
- Access to Claude (via Netlight's AWS Bedrock)

### Installing Claude Code

Claude Code is Anthropic's official CLI for working with Claude as a coding agent.

**Setup:** https://docs.chat.netlight.com/guide/codepilot/tools/claude-code

### Exercise: Run the TODO App ⭐

**Goal**: Get the TODO app running locally to verify your setup works

**Steps**:

1. Clone and navigate to the repository
   ```bash
   git clone https://github.com/RBirkeland/vibe-code-demo
   cd vibe-code-demo
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open the app at the URL shown (typically `http://localhost:5173`)

5. Test: add a todo, mark it complete, delete it, try the filter buttons

**Success**: App loads without errors and all basic features (add, complete, delete, filter) work

---

## 2. Working with AI Agents

### 2.1 What Are Agents?

Think of an agent as a junior developer who can read code, make changes across files, run tests, and fix issues—all autonomously.

| Chat | Agent |
|------|-------|
| Answers questions | Takes action |
| Single turn | Multi-step reasoning |
| Gives suggestions | Makes changes |

**Key Capabilities:**
- Read and understand code across multiple files
- Make changes autonomously
- Run tests and fix issues
- Reason through multi-step problems
- Validate and iterate

**Limitations:**
- Agents make mistakes—always validate
- No memory between sessions
- Limited context window
- Work best with clear, specific instructions

### 2.2 The Importance of Planning

The biggest mistake: jumping straight into coding without a plan.

> Spend 80% planning, 20% executing

A good plan → one-shot solution. A bad plan → debugging loops and wasted tokens.

**If you can't one-shot it, fix the plan—not the code.**

**Why Planning Matters:**
- **Scope clarity** - Know what success looks like before starting
- **Risk identification** - Catch edge cases and gotchas early
- **Token efficiency** - One good plan saves hundreds of wasted tokens in debugging
- **One-shot execution** - Most common cause of failure is re-planning mid-execution

**Using Plan Mode:**

```
/plan Add user authentication with OAuth2
```

When you use `/plan`, Claude will:
1. Explore the codebase
2. Create a step-by-step plan
3. Wait for your approval before implementing

Always review the plan—add constraints, correct misunderstandings, clarify edge cases.

**Best Practices:**

1. **Be specific** - "Add a button" vs "Add a 'Save Draft' button in the header that auto-saves every 30 seconds"

2. **Give context** - Explain background, constraints, and what success looks like

3. **Break problems down** - Sequential, focused tasks beat asking for everything at once

4. **Ask "why"** - When an agent suggests something, ask it to explain. You'll catch errors.

### 2.3 Context Window Management

**The Problem:**
Models have lower performance when context becomes "noisy"—too much irrelevant information degrades reasoning. For Claude models, performance degrades significantly around **50% of context window (100k tokens)**—the "dumb zone" where the model struggles.

**Why It Happens:**
- Too much information increases noise-to-signal ratio
- Model attention gets diluted across irrelevant context
- Reasoning becomes less precise

**The Solution:**
Keep one context window focused on one task:

- **Use `/clear`** - Start fresh when switching tasks to prevent information bleed
- **Use sub-agents** - Process and compress large amounts of information before passing to main agent
  - Example: Agent A extracts key concepts from 50 documentation pages
  - Agent A returns concise summary
  - Main agent gets only what's needed, stays focused and performant
- **Selective context** - Only load files/docs relevant to current task
- **Separate concerns** - Documentation research, implementation, and testing in separate contexts

**Example Workflow:**
```
Task: Implement date picker with date-fns

❌ Bad:  Load all date-fns docs + entire codebase + tests → implement
✅ Good: Sub-agent searches date-fns docs → returns key API summary
         Main agent implements with focused context
```

### Exercise: Add localStorage Persistence ⭐⭐

**Goal**: Use Claude to add persistence so todos survive page refreshes

**Steps**:

1. Open Claude Code
   ```bash
   claude
   ```

2. Give Claude this prompt:
   ```
   Add localStorage persistence to the TODO app. When todos are added,
   completed, or deleted, save them to localStorage. When the app loads,
   restore todos from localStorage. Handle the case when localStorage is
   empty (first visit).
   ```

3. Review Claude's approach and let it implement

4. Test: Add todos, mark some complete, refresh the page

5. Verify todos persist with correct completed/incomplete states

6. Edge case test: Clear localStorage (DevTools → Application → Storage), refresh, verify empty list

**Success**: Todos persist across page refreshes with correct states, no errors in console

**Alternative** (if too easy): Add a "Clear Completed" button or todo count statistics

---

## 3. Model Context Protocol (MCP)

### What is MCP?

**MCP is an API standard for AIs.** A universal adapter between AI models and tools.

```
Before: 3 models × 5 tools = 15 custom integrations
After:  3 models + 5 tools = 8 implementations
```

Build a database server once, any MCP-compatible model can use it.

### How It Works

An MCP server announces its capabilities. The AI asks what's available, then uses those tools. **The server controls the boundaries**—it validates inputs, checks permissions, enforces rate limits.

**Tools** - Functions the agent can call (`query_database`, `send_email`)

**Resources** - Data the agent can read (docs, schemas, logs)

**Safety** - Agents only get the specific capabilities they need. Everything is logged.

### Exercise: Add a Date Library with Context7 MCP ⭐⭐⭐

**Goal**: Use Context7 MCP to fetch documentation and implement a feature

**Steps**:

1. Ensure Context7 MCP is installed
   ```bash
   claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
   ```
   (Get your API key from [context7.com](https://context7.com))

2. Restart Claude Code to load the MCP

3. Ask Claude to use Context7:
   ```
   Using Context7, show me how to use date-fns to format dates
   ```

4. Review the documentation Claude retrieves from Context7

5. Ask Claude to add due date functionality:
   ```
   Add due dates to todos using date-fns. Each todo should have an optional
   due date that's formatted nicely. Allow sorting by due date.
   ```

6. Test: Add todos with and without due dates, verify formatting and sorting

**Success**:
- Todos have optional due dates
- Dates are formatted nicely
- Can sort by due date
- date-fns library is properly integrated

**Alternative**: Use Context7 to research and implement Chart.js for todo statistics visualization

---


## 4. Safety and Guardrails

### Why Guardrails Matter

In autonomous mode (YOLO), agents execute commands without asking. Without guardrails, they could delete files, force push to main, or run destructive database commands.

### Sandboxing (Minimal)

```
/sandbox
```

Limits file access and restricts commands to a safe subset. Doesn't cover remote calls. See [Sandbox docs](https://docs.anthropic.com/en/docs/claude-code/sandbox).

### SafetyNet (Recommended)

SafetyNet uses **semantic command analysis** to block destructive operations. Unlike pattern-based deny rules, it understands command structure—can't be bypassed by flag reordering or shell wrappers.

**Blocks:**
- `git reset --hard`, `git push --force`, `git checkout --`
- `rm -rf` outside temp/cwd
- Destructive commands hidden in `bash -c`, `python -c`, etc.

**Installation:**
```bash
/plugin marketplace add kenryu42/cc-marketplace
/plugin install safety-net@cc-marketplace
```
Then restart Claude Code.

**Verify:**
```bash
npx cc-safety-net doctor
```

**When blocked:**
```
BLOCKED by Safety Net

Reason: git checkout -- discards uncommitted changes permanently.
        Use 'git stash' first.

Command: git checkout -- src/main.py
```

For advanced modes and full docs: [Safety Net repository](https://github.com/kenryu42/claude-code-safety-net)

### Custom Rules

Add project-specific rules with `/set-custom-rules` or create `.safety-net.json`:

```json
{
  "version": 1,
  "rules": [
    {
      "name": "block-git-add-all",
      "command": "git",
      "subcommand": "add",
      "block_args": ["-A", "--all", "."],
      "reason": "Use 'git add <specific-files>' instead."
    }
  ]
}
```

For complex validation logic, use [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks).

### Exercise: Test SafetyNet Protection ⭐⭐⭐

**Goal**: Test safety mechanisms and understand their importance

**Steps**:

1. Ensure SafetyNet is installed
   ```bash
   /plugin install safety-net@cc-marketplace
   ```

2. Restart Claude Code

3. Intentionally trigger SafetyNet:
   ```
   Create a backup branch, then reset the main branch to 3 commits ago
   ```

4. Observe SafetyNet blocking the dangerous `git reset --hard`

5. Ask Claude to implement a safer approach

6. Create a custom rule to block `git add .`:
   ```bash
   /set-custom-rules
   ```

7. Add a rule requiring specific files instead of blanket adds

8. Test the custom rule by asking Claude to add all files

**Success**: SafetyNet blocks dangerous operations, custom rule works

**Bonus**: Add "Edit Todo" functionality (click to edit text)

---

## 5. Task Orchestration with VibeKanban

### Setting Up VibeKanban

VibeKanban is a Kanban board for multi-agent task execution. See [full docs](https://www.vibekanban.com/docs/agents/claude-code).

```bash
npx vibe-kanban                                    # Start board
claude mcp add vibe-kanban -- npx vibe-kanban-mcp  # Add MCP
```

Restart Claude Code to load the MCP.

### Creating Tickets from Plans

After creating a plan, ask Claude:
```
Write detailed tickets for all tasks and add them to VibeKanban
```

### Running Multiple Agents in Parallel

Each agent picks up a ticket, creates a feature branch, and opens a PR when done.

```
Start working on all parallelizable tasks marked with [P]
```

⚠️ **Before parallel execution:**
- Configure SafetyNet (agents run in YOLO mode)
- Dependencies are respected automatically—serial tasks wait

### Exercise: Implement 3 Features in Parallel ⭐⭐⭐⭐⭐

**Goal**: Run multiple agents in parallel, handle merge conflicts

**Choose 3 features:**
1. Search/Filter by Text
2. Dark Mode Toggle
3. Bulk Operations (Select All, Delete Completed, Mark All Complete)
4. Drag-and-Drop Reordering
5. Export/Import JSON
6. Keyboard Shortcuts
7. Todo Details/Notes
8. Undo/Redo

**Steps:**
1. `/plan Implement these 3 features: [your choices]`
2. Create VibeKanban tickets from the plan
3. Start parallel execution
4. Handle merge conflicts when PRs overlap
5. Test features individually, then together

**Success**: 3 features working together, at least 1 merge conflict resolved

---

## 6. Advanced Planning with Speckit

SpecKit is a toolkit for **Spec-Driven Development**—specs become executable artifacts that generate working code.

#### When to Use Speckit

| Use Case | Tool |
|----------|------|
| Simple tasks | `/plan` |
| Complex features, multi-file changes | SpecKit |
| New projects | SpecKit full workflow |
| Existing codebases | SpecKit with context analysis |

#### Core Commands

**Workflow:**
1. `/speckit.constitution` - Project principles
2. `/speckit.specify` - Define requirements (what/why)
3. `/speckit.plan` - Technical plan (how)
4. `/speckit.tasks` - Generate task breakdown
5. `/speckit.implement` - Execute tasks

**Optional:**
- `/speckit.clarify` - Fill spec gaps with targeted questions
- `/speckit.analyze` - Cross-check consistency before implementing

#### Example: New Project

```
/speckit.constitution Create principles for code quality and testing
/speckit.specify Build auth system with OAuth2 and password reset
/speckit.plan Use Express.js, PostgreSQL, JWT
/speckit.tasks
/speckit.implement
```

#### Example: Existing Codebase

```
/speckit.specify Add dark mode toggle with persistence
/speckit.plan Follow existing Redux patterns, integrate with ThemeContext
/speckit.tasks
/speckit.implement
```

SpecKit analyzes your codebase and respects existing patterns.

#### Exercise: Add Priority System ⭐⭐⭐⭐

```
/plan Add priority system (High/Medium/Low) with visual indicators and sorting
```

1. Review the plan—check files, approach, edge cases
2. Approve or request changes
3. Test: priorities display correctly, filtering works, sorting works

**Alternatives**: Edit functionality, categories/tags with colors

---

## 7. QA and Pull Requests

Agents create PRs automatically: branch → changes → commit → push → PR.

#### AI-Assisted Code Review

Use AI code review on AI-generated code—different model catches different errors.

**Tools:** [Greptile](https://greptile.com) (recommended), CodeRabbit

Setup: Connect your GitHub repo, PRs are reviewed automatically.

#### Exercise: Review with AI Assistance ⭐⭐⭐

1. Set up Greptile on your repository
2. Review automated comments on your PRs
3. Fix issues flagged by the review

---

## 8. Language Server Protocol (LSP)

### What is LSP?

**LSP is a standard for editors to understand code semantically.** Instead of every editor reimplementing language features for each language, one language server works with all editors.

```
Before: 10 editors × 5 languages = 50 implementations
After:  10 editors + 5 languages = 15 implementations
```

### Why It Matters for Agents

Without LSP, agents treat code as text—pattern matching and guessing. With LSP, agents get **semantic understanding**:

**Code intelligence:**
- Type information and function signatures
- Definitions and references across files
- Real-time error detection
- Safe refactoring (knows exactly what will change)

**The combination:**
- MCP gives agents access to tools and data
- LSP gives agents understanding of code

### How Agents Use LSP

| Without LSP | With LSP |
|-------------|----------|
| Parse code manually | Ask language server |
| Guess types and structure | Get accurate semantic info |
| Text-based search | Find all references |
| Risk breaking changes | Know impact before changing |

**Example:** An agent renaming a function. Without LSP, it does a text search-and-replace (might miss things, break code). With LSP, it uses "rename symbol" and updates every reference correctly across all files.

### Exercise: Explore Code with LSP ⭐⭐⭐

**Goal**: See how language servers provide semantic understanding

**Steps**:

1. Install TypeScript Language Server
   ```bash
   npm install -g typescript-language-server typescript
   ```

2. Configure in Claude Code settings:
   ```json
   {
     "lsp": {
       "typescript": {
         "command": "typescript-language-server",
         "args": ["--stdio"]
       }
     }
   }
   ```

3. Restart Claude Code

4. Try these commands with Claude:
   ```
   Show me all functions and their signatures in src/App.tsx

   Find all places where [function_name] is called

   What type errors does the language server report?

   What are the inferred types for variables in this file?
   ```

5. Ask Claude to refactor something and observe how it uses LSP to ensure safety

**Success**: Claude provides accurate type information, finds all references correctly, and suggests safe refactorings

**Bonus**: Ask Claude to trace a variable's type through multiple function calls

---

## 9. Transforming & Structurering Data

### Exercise: Transform Unstructured Feedback into CSV ⭐⭐

**Goal**: Generate qualitative feedback, then convert it to structured data

**Your Task:**

1. Ask Claude to generate 3 user interview transcripts about the TODO app (different use cases)

2. Ask Claude to generate 3 bug reports (varying severity)

3. Ask Claude to read all 6 documents and create a CSV file with these columns:
   - Source (Interview/Bug)
   - Category (Feature Request, Usability, Bug, etc.)
   - Priority (High/Medium/Low)
   - Summary (one sentence)
   - Theme (a tag like "Collaboration", "Mobile", etc.)

**Success**: CSV with 6 categorized items
