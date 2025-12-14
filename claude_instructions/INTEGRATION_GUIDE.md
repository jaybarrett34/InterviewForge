# Claude Integration Guide for Developers

## Quick Start

This guide shows you how to integrate the Claude instruction system into InterviewForge.

## Prerequisites

- Claude API access (Anthropic API key)
- Node.js backend set up
- File system access for storing problems/tests
- Metadata persistence (JSON files or database)

## Integration Steps

### Step 1: Load Instructions

**Create a context loader:**

```typescript
// services/claudeContext.ts
import fs from 'fs';
import path from 'path';

export class ClaudeContextLoader {
  private instructionsPath = path.join(__dirname, '../claude_instructions');
  private soulDocsPath = path.join(__dirname, '../soul_docs');

  loadMasterInstructions(): string {
    return fs.readFileSync(
      path.join(this.instructionsPath, 'CLAUDE.md'),
      'utf-8'
    );
  }

  loadInstructionFile(name: string): string {
    return fs.readFileSync(
      path.join(this.instructionsPath, `${name}.md`),
      'utf-8'
    );
  }

  loadSoulDocs(company: string): {
    patterns: string;
    evalCriteria: string;
    examples: string;
  } {
    const companyPath = path.join(this.soulDocsPath, company);

    return {
      patterns: fs.readFileSync(path.join(companyPath, 'PATTERNS.md'), 'utf-8'),
      evalCriteria: fs.readFileSync(path.join(companyPath, 'EVAL_CRITERIA.md'), 'utf-8'),
      examples: fs.readFileSync(path.join(companyPath, 'EXAMPLE_PROBLEMS.md'), 'utf-8'),
    };
  }

  buildSystemPrompt(activeCompany: string = 'leetcode'): string {
    const masterInstructions = this.loadMasterInstructions();
    const soulDocs = this.loadSoulDocs(activeCompany);

    return `${masterInstructions}

## Active Company Context: ${activeCompany}

${soulDocs.patterns}

You have access to the following instruction files:
- PROBLEM_GENERATION.md - Reference for /new command
- TEST_GENERATION.md - Reference for test creation
- REVIEW_PROTOCOL.md - Reference for /review and /submit
- COMMANDS.md - Reference for all slash commands

Company soul_docs loaded:
- PATTERNS.md (question patterns for ${activeCompany})
- EVAL_CRITERIA.md (evaluation standards)
- EXAMPLE_PROBLEMS.md (example problems)

Follow all behavioral rules strictly, especially:
1. NEVER read solution.py without permission
2. NEVER reveal test_solution.py contents
3. Guide users, don't solve for them
`;
  }
}
```

### Step 2: Initialize Claude Client

```typescript
// services/claudeClient.ts
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeContextLoader } from './claudeContext';

export class ClaudeClient {
  private client: Anthropic;
  private contextLoader: ClaudeContextLoader;
  private conversationHistory: Anthropic.MessageParam[] = [];

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.contextLoader = new ClaudeContextLoader();
  }

  async chat(
    userMessage: string,
    activeCompany: string = 'leetcode',
    sessionContext?: SessionContext
  ): Promise<string> {
    // Build system prompt with instructions
    const systemPrompt = this.contextLoader.buildSystemPrompt(activeCompany);

    // Add session context if available
    let contextualPrompt = systemPrompt;
    if (sessionContext) {
      contextualPrompt += `\n\n## Current Session Context:\n${JSON.stringify(sessionContext, null, 2)}`;
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Call Claude API
    const response = await this.client.messages.create({
      model: 'claude-opus-4-5-20251101', // or claude-sonnet-4-5
      max_tokens: 8000,
      system: contextualPrompt,
      messages: this.conversationHistory,
    });

    const assistantMessage = response.content[0].text;

    // Add response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });

    return assistantMessage;
  }

  resetConversation(): void {
    this.conversationHistory = [];
  }
}

interface SessionContext {
  currentProblem?: string;
  hintsUsed?: number;
  reviewCount?: number;
  metadata?: any;
}
```

### Step 3: Implement Command Router

```typescript
// services/commandRouter.ts
import { ClaudeClient } from './claudeClient';
import { MetadataManager } from './metadataManager';
import { ProblemGenerator } from './problemGenerator';
import { TestRunner } from './testRunner';

export class CommandRouter {
  constructor(
    private claude: ClaudeClient,
    private metadata: MetadataManager,
    private problemGen: ProblemGenerator,
    private testRunner: TestRunner
  ) {}

  async handleCommand(
    command: string,
    args: string[],
    sessionPath: string
  ): Promise<CommandResult> {
    switch (command) {
      case 'new':
        return this.handleNew(args[0], sessionPath);

      case 'hint':
        return this.handleHint(sessionPath);

      case 'review':
        return this.handleReview(sessionPath);

      case 'submit':
        return this.handleSubmit(sessionPath);

      case 'explain':
        return this.handleExplain(args.join(' '), sessionPath);

      case 'stats':
        return this.handleStats(args[0], sessionPath);

      case 'switch':
        return this.handleSwitch(args[0], sessionPath);

      case 'patterns':
        return this.handlePatterns(sessionPath);

      case 'flush':
        return this.handleFlush(sessionPath);

      case 'newcompany':
        return this.handleNewCompany(args[0], sessionPath);

      default:
        return {
          success: false,
          message: `Unknown command: /${command}`,
        };
    }
  }

  private async handleNew(category: string | undefined, sessionPath: string) {
    // Load problem generation instructions
    const instructions = this.claude.contextLoader.loadInstructionFile('PROBLEM_GENERATION');

    // Get current metadata
    const meta = this.metadata.load(sessionPath);

    // Build request to Claude
    const prompt = `User requested: /new ${category || ''}

Current context:
- Active company: ${meta.activeCompany}
- Problems attempted: ${meta.stats.problemsAttempted}
- Success rate: ${meta.stats.successRate}%
- Recently practiced categories: ${meta.recentCategories}

Please generate a new problem following PROBLEM_GENERATION.md guidelines.
${category ? `Category requested: ${category}` : 'Choose appropriate category based on user history.'}
`;

    const response = await this.claude.chat(prompt, meta.activeCompany, meta);

    // Parse response and create problem files
    // (Implementation depends on how Claude formats the response)

    return {
      success: true,
      message: response,
      files: {
        'problem.md': extractProblemMd(response),
        'solution.py': extractSolutionTemplate(response),
        'test_solution.py': extractTestSuite(response),
      },
    };
  }

  private async handleReview(sessionPath: string) {
    // Load review protocol
    const instructions = this.claude.contextLoader.loadInstructionFile('REVIEW_PROTOCOL');

    // Read solution.py
    const solution = fs.readFileSync(path.join(sessionPath, 'solution.py'), 'utf-8');

    // Run tests
    const testResults = await this.testRunner.runTests(sessionPath);

    // Request review from Claude
    const prompt = `User requested: /review

Here is their solution.py:
\`\`\`python
${solution}
\`\`\`

Test results:
${JSON.stringify(testResults, null, 2)}

Please provide a comprehensive review following REVIEW_PROTOCOL.md.
`;

    const response = await this.claude.chat(prompt);

    // Update metadata
    this.metadata.incrementReviewCount(sessionPath);

    return {
      success: true,
      message: response,
      testResults,
    };
  }

  // ... implement other command handlers
}

interface CommandResult {
  success: boolean;
  message: string;
  files?: Record<string, string>;
  testResults?: any;
}
```

### Step 4: Create Metadata Manager

```typescript
// services/metadataManager.ts
import fs from 'fs';
import path from 'path';

export class MetadataManager {
  load(sessionPath: string): Metadata {
    const metaPath = path.join(sessionPath, 'metadata.json');
    if (fs.existsSync(metaPath)) {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }
    return this.createDefault();
  }

  save(sessionPath: string, metadata: Metadata): void {
    const metaPath = path.join(sessionPath, 'metadata.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  }

  incrementHintCount(sessionPath: string): void {
    const meta = this.load(sessionPath);
    meta.currentProblem.hintsUsed++;
    meta.stats.totalHintsUsed++;
    this.save(sessionPath, meta);
  }

  incrementReviewCount(sessionPath: string): void {
    const meta = this.load(sessionPath);
    meta.currentProblem.reviewCount++;
    this.save(sessionPath, meta);
  }

  markComplete(sessionPath: string, passed: boolean): void {
    const meta = this.load(sessionPath);
    meta.currentProblem.status = 'completed';
    meta.stats.problemsAttempted++;
    if (passed) {
      meta.stats.problemsSolved++;
    }
    this.save(sessionPath, meta);
  }

  private createDefault(): Metadata {
    return {
      activeCompany: 'leetcode',
      currentProblem: null,
      stats: {
        problemsAttempted: 0,
        problemsSolved: 0,
        totalHintsUsed: 0,
        testPassRate: 0,
        categoryStats: {},
      },
      problemHistory: [],
      sessionCount: 0,
    };
  }
}

interface Metadata {
  activeCompany: string;
  currentProblem: CurrentProblem | null;
  stats: Stats;
  problemHistory: ProblemRecord[];
  sessionCount: number;
}

interface CurrentProblem {
  name: string;
  category: string;
  difficulty: string;
  hintsUsed: number;
  reviewCount: number;
  status: 'in_progress' | 'completed';
  generatedAt: string;
}

interface Stats {
  problemsAttempted: number;
  problemsSolved: number;
  totalHintsUsed: number;
  testPassRate: number;
  categoryStats: Record<string, CategoryStats>;
}

interface CategoryStats {
  attempted: number;
  solved: number;
  avgHints: number;
}

interface ProblemRecord {
  name: string;
  category: string;
  difficulty: string;
  completedAt: string;
  testsPassed: number;
  testsTotal: number;
  hintsUsed: number;
}
```

### Step 5: Implement Test Runner

```typescript
// services/testRunner.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class TestRunner {
  async runTests(sessionPath: string): Promise<TestResults> {
    try {
      const { stdout, stderr } = await execAsync(
        `cd "${sessionPath}" && pytest test_solution.py -v --tb=short --json-report`,
        { timeout: 30000 }
      );

      return this.parseTestOutput(stdout);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        testsPassed: 0,
        testsTotal: 0,
        failures: [],
      };
    }
  }

  private parseTestOutput(output: string): TestResults {
    // Parse pytest output
    // This is simplified - actual implementation depends on pytest output format
    const lines = output.split('\n');
    const results = {
      success: output.includes('passed'),
      testsPassed: 0,
      testsTotal: 0,
      failures: [] as TestFailure[],
    };

    // Parse test results
    for (const line of lines) {
      if (line.includes('PASSED')) results.testsPassed++;
      if (line.includes('FAILED')) {
        results.failures.push({
          name: extractTestName(line),
          error: extractError(line),
        });
      }
    }

    results.testsTotal = results.testsPassed + results.failures.length;
    return results;
  }
}

interface TestResults {
  success: boolean;
  testsPassed: number;
  testsTotal: number;
  failures: TestFailure[];
  error?: string;
}

interface TestFailure {
  name: string;
  error: string;
}
```

### Step 6: Create API Endpoints

```typescript
// routes/claude.ts
import express from 'express';
import { ClaudeClient } from '../services/claudeClient';
import { CommandRouter } from '../services/commandRouter';
import { MetadataManager } from '../services/metadataManager';

const router = express.Router();
const claude = new ClaudeClient(process.env.ANTHROPIC_API_KEY);
const metadata = new MetadataManager();
const commandRouter = new CommandRouter(claude, metadata, /* ... */);

// Chat endpoint
router.post('/chat', async (req, res) => {
  const { message, sessionPath } = req.body;

  try {
    // Check if message is a command
    if (message.startsWith('/')) {
      const [command, ...args] = message.slice(1).split(' ');
      const result = await commandRouter.handleCommand(command, args, sessionPath);
      return res.json(result);
    }

    // Regular chat
    const meta = metadata.load(sessionPath);
    const response = await claude.chat(message, meta.activeCompany, meta);

    res.json({
      success: true,
      message: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get instructions (for debugging/transparency)
router.get('/instructions/:file', (req, res) => {
  try {
    const content = claude.contextLoader.loadInstructionFile(req.params.file);
    res.send(content);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
```

### Step 7: Frontend Integration

```typescript
// hooks/useClaude.ts
import { useState } from 'react';
import axios from 'axios';

export function useClaude(sessionPath: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/claude/chat', {
        message,
        sessionPath,
      });

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (command: string, args: string[] = []) => {
    const message = `/${command}${args.length ? ' ' + args.join(' ') : ''}`;
    return sendMessage(message);
  };

  return {
    sendMessage,
    executeCommand,
    loading,
    error,
  };
}

// Usage in component:
function InterviewSession() {
  const { sendMessage, executeCommand, loading } = useClaude('/path/to/session');

  const handleNewProblem = async () => {
    const result = await executeCommand('new', ['arrays']);
    // Handle result
  };

  const handleHint = async () => {
    const result = await executeCommand('hint');
    // Display hint
  };

  return (
    <div>
      <button onClick={handleNewProblem}>New Problem</button>
      <button onClick={handleHint}>Get Hint</button>
      {/* ... */}
    </div>
  );
}
```

## Configuration

### Environment Variables

```env
# .env
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-opus-4-5-20251101  # or claude-sonnet-4-5
MAX_TOKENS=8000
INSTRUCTIONS_PATH=./claude_instructions
SOUL_DOCS_PATH=./soul_docs
```

### File Structure

```
project/
├── claude_instructions/     # This directory (instruction files)
├── soul_docs/              # Company-specific data
├── sessions/               # User session data
│   └── session_id/
│       ├── metadata.json
│       ├── problem.md
│       ├── solution.py
│       └── test_solution.py
├── services/
│   ├── claudeClient.ts
│   ├── claudeContext.ts
│   ├── commandRouter.ts
│   ├── metadataManager.ts
│   └── testRunner.ts
└── routes/
    └── claude.ts
```

## Testing

### Test Command Processing

```typescript
describe('CommandRouter', () => {
  it('should handle /new command', async () => {
    const result = await commandRouter.handleCommand('new', ['arrays'], sessionPath);
    expect(result.success).toBe(true);
    expect(result.files['problem.md']).toBeDefined();
  });

  it('should handle /hint command', async () => {
    const result = await commandRouter.handleCommand('hint', [], sessionPath);
    expect(result.success).toBe(true);
    expect(result.message).toContain('Hint');
  });
});
```

### Test Claude Integration

```typescript
describe('ClaudeClient', () => {
  it('should load instructions correctly', () => {
    const loader = new ClaudeContextLoader();
    const instructions = loader.loadMasterInstructions();
    expect(instructions).toContain('AI interview practice assistant');
  });

  it('should build system prompt with company context', () => {
    const loader = new ClaudeContextLoader();
    const prompt = loader.buildSystemPrompt('google');
    expect(prompt).toContain('google');
  });
});
```

## Monitoring & Debugging

### Log Claude Interactions

```typescript
// Add to ClaudeClient
private logInteraction(userMessage: string, response: string) {
  console.log({
    timestamp: new Date().toISOString(),
    userMessage: userMessage.substring(0, 100),
    responseLength: response.length,
    model: 'claude-opus-4-5',
  });
}
```

### Track Command Usage

```typescript
// Add to CommandRouter
private trackCommand(command: string) {
  // Send to analytics
  analytics.track('command_used', { command });
}
```

## Performance Optimization

### Cache Instructions

```typescript
class ClaudeContextLoader {
  private cache = new Map<string, string>();

  loadInstructionFile(name: string): string {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    const content = fs.readFileSync(/* ... */);
    this.cache.set(name, content);
    return content;
  }
}
```

### Reuse Conversations

```typescript
// Store conversation per session
const conversationCache = new Map<string, ClaudeClient>();

function getClaudeForSession(sessionId: string): ClaudeClient {
  if (!conversationCache.has(sessionId)) {
    conversationCache.set(sessionId, new ClaudeClient(API_KEY));
  }
  return conversationCache.get(sessionId)!;
}
```

## Security Considerations

1. **API Key Protection**: Store in environment variables, never commit
2. **File Access**: Validate all file paths to prevent directory traversal
3. **Test Isolation**: Ensure hidden tests aren't exposed through API
4. **Rate Limiting**: Implement rate limits on Claude API calls
5. **Input Validation**: Sanitize all user inputs before sending to Claude

## Troubleshooting

### Claude Not Following Instructions

**Problem**: Claude doesn't follow behavioral rules
**Solution**: Ensure system prompt is loaded correctly and includes critical rules

### Test Results Not Parsing

**Problem**: Can't parse pytest output
**Solution**: Use `--json-report` flag and parse structured output

### Commands Not Working

**Problem**: Command not recognized
**Solution**: Check command parsing logic and ensure proper routing

## Next Steps

1. Implement basic command routing
2. Test problem generation
3. Implement test running
4. Add review functionality
5. Build frontend command palette
6. Add analytics and monitoring
7. Optimize performance
8. Add more companies to soul_docs

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [pytest Documentation](https://docs.pytest.org)

---

This guide should get you started with integrating the Claude instruction system into InterviewForge. Adjust based on your specific architecture and requirements.
