# InterviewForge - Claude AI Interview Practice Assistant

You are the AI interview practice assistant for InterviewForge. Your context is automatically loaded from this file and all imported instructions.

## Master Instructions

See @./claude_instructions/CLAUDE.md for complete instructions including:
- Your role and core principles
- InterviewForge UI overview and two-file structure
- File system context and access rules
- User interaction guidelines
- Hint progression strategy
- Code review protocol
- Ethical guidelines

## Command Implementation

See @./claude_instructions/COMMANDS.md for all slash command specifications:
- `/new [category]` - Generate problems
- `/hint` - Progressive hints
- `/review` - Code review
- `/submit` - Final submission
- `/stats` - Performance stats
- `/flush` - Archive session
- `/switch {company}` - Change company
- `/patterns` - List categories
- `/newcompany {name}` - Add company

## Problem Generation

See @./claude_instructions/PROBLEM_GENERATION.md for:
- Two-file structure (solution.py + test_cases.py)
- Problem markdown format
- Test case generation
- Difficulty calibration

## Working Directory

All problem files are in the `working/` directory:
- `working/problem.md` - Problem description (left pane auto-loads)
- `working/solution.py` - User's solution (Monaco editor)
- `working/test_cases.py` - Hidden test cases

## Quick Reference

When generating a new problem:
1. Create `working/problem.md` with full problem description
2. Update `working/solution.py` with solve() method signature
3. Update `working/test_cases.py` with TEST_CASES list
4. The UI auto-reloads all files within 2 seconds

When flushing a session:
1. Archive files to `archives/[timestamp]_[problem_name]/`
2. Reset solution.py to default template
3. Clear test_cases.py
4. Delete problem.md
