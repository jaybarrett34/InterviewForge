# LeetCode-Style Evaluation Criteria

## Overview

This document outlines standard evaluation criteria for technical coding interviews across the tech industry. These are general best practices that apply to most companies.

## Core Evaluation Dimensions

### 1. Problem Solving (30%)

**What it measures:** Your ability to break down and approach unfamiliar problems

**Strong Performance:**
- Asks clarifying questions before jumping to code
- Identifies and discusses edge cases upfront
- Considers multiple approaches and their tradeoffs
- Breaks complex problems into manageable sub-problems
- Recognizes common patterns and applies them correctly

**Adequate Performance:**
- Understands the problem after some discussion
- Identifies main approach with some guidance
- Handles obvious cases but may miss edge cases initially
- Can work through solution step-by-step

**Weak Performance:**
- Struggles to understand problem requirements
- Jumps to coding without planning
- Can't identify appropriate approach even with hints
- Misses obvious edge cases
- Gets stuck and can't progress

### 2. Technical Competence (30%)

**What it measures:** Your knowledge of data structures, algorithms, and coding ability

**Strong Performance:**
- Chooses optimal data structures immediately
- Implements algorithms correctly with minimal bugs
- Writes syntactically correct code in chosen language
- Uses language features appropriately
- Demonstrates deep understanding of time/space complexity

**Adequate Performance:**
- Knows standard data structures and when to use them
- Implements working solution with minor bugs
- Generally correct syntax with some errors
- Can explain complexity when asked
- Understands their language's standard library

**Weak Performance:**
- Unfamiliar with basic data structures (arrays, hash maps, trees)
- Significant algorithmic errors
- Struggles with language syntax
- Can't explain or analyze complexity
- No awareness of standard library functions

### 3. Code Quality (15%)

**What it measures:** Readability, maintainability, and software engineering practices

**Strong Performance:**
- Clean, well-organized code
- Meaningful variable and function names
- Appropriate comments for complex logic
- Consistent formatting and style
- Modular design with helper functions
- Handles errors appropriately

**Adequate Performance:**
- Generally readable code
- Acceptable naming (could be improved)
- Basic organization
- Some inconsistencies in style
- Mostly follows conventions

**Weak Performance:**
- Hard to read or follow
- Poor naming (single letters, unclear abbreviations)
- No structure or organization
- Ignores language conventions
- Monolithic code without separation of concerns

### 4. Communication (15%)

**What it measures:** How well you explain your thinking and collaborate

**Strong Performance:**
- Clearly explains approach before coding
- Thinks aloud while implementing
- Asks good questions when stuck
- Actively listens to hints/feedback
- Explains tradeoffs articulately
- Easy to work with and collaborate

**Adequate Performance:**
- Can explain approach when asked
- Communicates main ideas
- Responds to questions adequately
- Generally collaborative
- May need prompting to explain thinking

**Weak Performance:**
- Silent coding with no explanation
- Can't articulate approach clearly
- Doesn't ask questions or listen to hints
- Defensive or dismissive of feedback
- Difficult to collaborate with

### 5. Optimization & Analysis (10%)

**What it measures:** Understanding of complexity and ability to optimize

**Strong Performance:**
- Correctly analyzes time/space complexity
- Identifies optimization opportunities independently
- Discusses multiple solutions with tradeoffs
- Can optimize from brute force to optimal
- Understands when solution is optimal

**Adequate Performance:**
- Can analyze complexity when prompted
- Finds working solution (may not be optimal)
- Can optimize with hints
- Understands basic tradeoffs
- Recognizes when solution could be better

**Weak Performance:**
- No understanding of Big-O notation
- Can't identify inefficiencies
- Doesn't recognize optimization opportunities
- Stuck on brute force approach
- Claims suboptimal solution is optimal

## Complexity Analysis Standards

### Time Complexity Expectations

**Easy Problems:**
- Expected: O(n) or better
- Acceptable: O(n log n)
- Red Flag: O(n²) when O(n) is straightforward

**Medium Problems:**
- Expected: O(n), O(n log n), or O(n²) depending on problem
- Acceptable: One step from optimal (e.g., O(n²) when O(n log n) exists)
- Red Flag: Exponential time when polynomial exists

**Hard Problems:**
- Expected: Optimal solution (varies by problem)
- Acceptable: Correct solution with suboptimal complexity
- Red Flag: Can't achieve correct solution at all

### Space Complexity Considerations

- **Bonus points:** For O(1) extra space solutions when O(n) is obvious
- **Expected:** Understanding recursion stack space
- **Important:** Knowing when to trade space for time

## Testing & Debugging (Bonus Credit)

**What separates good from great:**

**Excellent Testing:**
- Tests with edge cases proactively
- Walks through code with examples
- Catches own bugs before running
- Systematic debugging when issues arise
- Verifies correctness thoroughly

**Basic Testing:**
- Tests with provided examples
- Can debug with guidance
- Catches major bugs eventually

**Poor Testing:**
- Doesn't test code
- Assumes code works
- Can't debug effectively
- Misses obvious errors

## Common Edge Cases to Consider

**Arrays/Strings:**
- Empty input
- Single element
- All same elements
- All unique elements
- Minimum/maximum size from constraints
- Sorted vs unsorted

**Trees:**
- Empty tree (null root)
- Single node
- Skewed tree (all left or all right)
- Balanced tree
- Duplicate values

**Graphs:**
- Disconnected graph
- Single node
- Cycles
- Self-loops
- Directed vs undirected

**Linked Lists:**
- Empty list
- Single node
- Cycles
- Even vs odd length

**Numbers:**
- Zero
- Negative numbers
- Integer overflow
- Minimum/maximum values

## Scoring Framework

### Overall Assessment

**Strong Hire (Top 10%)**
- Solves problem correctly with optimal solution
- Clean, production-quality code
- Excellent communication throughout
- Identifies and handles all edge cases
- Minimal or no hints needed
- **Decision:** Definitely proceed

**Hire (Top 25%)**
- Solves problem correctly
- May need minor hints for optimization
- Good code quality
- Solid communication
- Handles most edge cases
- **Decision:** Proceed to next round

**Borderline (Top 50%)**
- Solves problem with significant hints
- Working solution but suboptimal
- Adequate code quality
- Basic communication
- Misses some edge cases
- **Decision:** Additional assessment needed

**No Hire (Below 50%)**
- Can't solve problem even with hints
- Major bugs or incomplete solution
- Poor code quality
- Weak communication
- Doesn't consider edge cases
- **Decision:** Do not proceed

## Red Flags

**Immediate Concerns:**
- Cannot solve Easy problem
- Doesn't know basic data structures
- Can't write syntactically correct code
- Completely silent or unable to explain thinking
- Gives up when stuck

**Warning Signs:**
- Solves only with significant help
- Makes same mistake repeatedly
- Doesn't learn from hints
- Ignores interviewer feedback
- Poor time management (spends 40 min on approach discussion)

## What Separates Candidates

**Top Performers:**
- Multiple approaches considered
- Optimal solution found quickly
- Clean, bug-free implementation
- Proactive edge case handling
- Clear, engaging communication
- Tests and debugs systematically

**Average Performers:**
- One approach, usually works
- Correct solution (maybe not optimal)
- Functional code with minor issues
- Handles main cases
- Adequate communication
- Tests when prompted

**Below Bar:**
- Struggles to find approach
- Incorrect or incomplete solution
- Buggy code
- Misses basic cases
- Poor communication
- Doesn't test

## Interview Tips

**Before You Start:**
1. Ask clarifying questions
2. Confirm input/output format
3. Discuss edge cases
4. Outline your approach
5. Get interviewer buy-in before coding

**While Coding:**
1. Think aloud
2. Use meaningful names
3. Start with brute force if optimal isn't obvious
4. Write clean, organized code
5. Handle edge cases as you go

**After Coding:**
1. Walk through your code with examples
2. Test edge cases
3. Analyze complexity
4. Discuss optimizations
5. Ask if interviewer wants to see anything else

**General Advice:**
- Communicate constantly
- Don't be afraid to ask questions
- It's okay to start with brute force
- Bug-free Medium beats buggy Hard
- Time management is crucial

## Time Allocation Guidelines

**For 45-minute interview:**
- Understanding & Clarification: 5 min
- Approach Discussion: 5-10 min
- Implementation: 20-25 min
- Testing & Debugging: 5-10 min
- Optimization Discussion: 5 min

**Red Flags in Timing:**
- Still discussing approach at 20 minutes
- Haven't started coding at 15 minutes
- Code isn't working at 40 minutes
- No time for testing

## Practice Recommendations

**To Score Well:**

1. **Solve 150+ problems** across all categories
2. **Master patterns** - recognize them quickly
3. **Practice communication** - explain while solving
4. **Time yourself** - simulate real conditions
5. **Review solutions** - learn multiple approaches
6. **Focus on weak areas** - improve systematically
7. **Mock interviews** - practice the full experience

**Study Priority:**
1. Arrays & Strings (most common)
2. Trees & Graphs (high value)
3. Dynamic Programming (differentiator)
4. Hash Tables (frequently useful)
5. Everything else (breadth)

**Quality over Quantity:**
- Understand WHY solutions work
- Learn patterns, not specific problems
- Practice explaining your thinking
- Build intuition through variety

---

*These are general industry standards. Specific companies may weight criteria differently.*
