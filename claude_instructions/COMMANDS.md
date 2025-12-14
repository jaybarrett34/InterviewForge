# Slash Command Implementation Guide

## Overview

InterviewForge uses slash commands to provide a clean, intuitive interface. Each command has specific behavior and requirements. This document details how to implement each command.

## Command Format

Commands follow this pattern:
```
/command [required_arg] {optional_arg}
```

Always acknowledge the command and execute it immediately.

---

## /new [category]

**Purpose:** Generate a new interview problem

**Syntax:**
- `/new` - Generate problem in any category
- `/new arrays` - Generate array problem
- `/new {category}` - Generate problem in specific category

**Implementation Steps:**

1. **Parse Category (if provided)**
   ```
   If category specified:
     - Validate it exists in soul_docs/{company}/PATTERNS.md
     - Use that category
   Else:
     - Select category intelligently based on:
       - User's practice history (avoid repeating)
       - User's weak areas (lower success rate)
       - Company's common categories
   ```

2. **Check Company Context**
   ```
   company = get_active_company_from_metadata()

   If company has no soul_docs:
     - Offer to run /newcompany
     - Or use "leetcode" as default
   ```

3. **Web Search for Unknown Company** (if needed)
   ```
   If company != "leetcode" AND no soul_docs exist:
     - Search: "{company} technical interview questions 2025"
     - Search: "{company} coding interview patterns"
     - Analyze results for:
       - Common categories
       - Difficulty distribution
       - Interview style
     - Ask: "Should I create soul_docs for {company}? (run /newcompany {company})"
   ```

4. **Generate Problem**
   - Follow PROBLEM_GENERATION.md guidelines
   - Create/update `working/problem.md` (problem description)
   - Update `working/solution.py` (solve method signature)
   - Update `working/test_cases.py` (test cases)

5. **Update Metadata**
   ```json
   {
     "current_problem": "problem_name",
     "problem_history": [..., {
       "name": "problem_name",
       "category": "arrays",
       "difficulty": "medium",
       "generated_at": "timestamp",
       "status": "in_progress"
     }]
   }
   ```

6. **Present to User**
   ```markdown
   # New Problem Generated!

   **Category:** Arrays
   **Difficulty:** Medium
   **Company Style:** Google

   [Display problem.md content]

   ---

   Your solution template is ready in `solution.py`.

   **Available commands:**
   - `/hint` - Get a hint
   - `/review` - Review your solution
   - `/explain {concept}` - Explain a concept
   ```

**Error Handling:**
- Invalid category: "Category '{category}' not found. Use `/patterns` to see available categories."
- No company set: Use default "leetcode"
- Generation failure: "Failed to generate problem. Please try again."

---

## /hint

**Purpose:** Provide progressive hints for the current problem

**Syntax:** `/hint`

**Implementation Steps:**

1. **Check Current Problem**
   ```
   If no current problem:
     Return: "No active problem. Use `/new` to generate one."
   ```

2. **Load Hint State**
   ```
   hint_count = metadata["current_problem"]["hints_used"]
   ```

3. **Retrieve Next Hint**
   ```
   Load problem.md
   Extract hints from ## Hints section
   next_hint_number = hint_count + 1

   If next_hint_number <= total_hints_in_problem:
     hint = hints[next_hint_number - 1]
   Else:
     # Generate additional progressive hint
     hint = generate_progressive_hint(hint_count)
   ```

4. **Progressive Hint Strategy**

   **Hint 1 (Clarification):**
   - Ask guiding questions
   - Highlight specific aspect to consider
   - Very high level

   Example: "What data structure allows you to quickly check if you've seen a value before?"

   **Hint 2 (Approach):**
   - Suggest algorithm category
   - Mention technique or pattern
   - Still doesn't give implementation

   Example: "This is a good use case for the two-pointer technique. Think about starting from both ends."

   **Hint 3 (Strategy):**
   - More specific approach
   - May include pseudocode structure
   - Still requires user to implement

   Example: "Keep a hash map of {value: index}. As you iterate, check if (target - current_value) exists in the map."

   **Hint 4 (Detailed):**
   - Walk through algorithm step-by-step
   - May show code structure
   - Stop short of full solution

   Example:
   ```
   Algorithm:
   1. Create empty hash map
   2. For each number at index i:
      a. Calculate complement = target - number
      b. If complement in map, return [map[complement], i]
      c. Otherwise, add number to map: map[number] = i
   ```

   **Hint 5+ (Near Solution):**
   - Very detailed guidance
   - Consider asking if they want the solution

   Example: "You're on hint 5. Would you like me to show you the solution, or would you prefer one more detailed hint?"

5. **Update Metadata**
   ```json
   {
     "current_problem": {
       "hints_used": hint_count + 1,
       "last_hint": "timestamp"
     },
     "stats": {
       "total_hints_used": previous_total + 1
     }
   }
   ```

6. **Present Hint**
   ```markdown
   ## Hint #[number]

   [Hint content]

   ---

   Hints used: [number] | Still stuck? Use `/hint` again or `/explain {concept}` for background.
   ```

**Error Handling:**
- No active problem: Guide to `/new`
- Already solved: "You've completed this problem. Use `/new` for another."

---

## /review

**Purpose:** Review the current solution without finalizing

**Syntax:** `/review`

**Implementation Steps:**

1. **Check Prerequisites**
   ```
   If no current problem:
     Return: "No active problem. Use `/new` to generate one."

   If solution.py doesn't exist or is empty:
     Return: "No solution found. Write your solution in solution.py first."
   ```

2. **Read Solution**
   ```python
   solution_code = read_file("solution.py")
   ```

3. **Run Tests**
   ```bash
   cd working
   python3 solution.py
   ```

4. **Analyze Results**
   - Parse test output
   - Count passed/failed
   - Identify which tests failed
   - Capture error messages

5. **Provide Review**
   - Follow REVIEW_PROTOCOL.md
   - Structure: Results → Positives → Issues → Suggestions → Next Steps
   - Be constructive and specific

6. **Update Metadata**
   ```json
   {
     "current_problem": {
       "review_count": previous_count + 1,
       "last_review": {
         "timestamp": "ISO-8601",
         "tests_passed": 8,
         "tests_total": 12
       }
     }
   }
   ```

7. **Present Review**
   - Use review template from REVIEW_PROTOCOL.md
   - Encourage iteration: "Make changes and run `/review` again to check!"

**Error Handling:**
- Syntax errors in solution: Show error, help debug
- Import errors: Check solution.py function names match test imports
- Test file issues: Regenerate tests if corrupted

---

## /explain {concept}

**Purpose:** Explain a concept without revealing the solution

**Syntax:**
- `/explain two pointers`
- `/explain dynamic programming`
- `/explain hash maps`

**Implementation Steps:**

1. **Parse Concept**
   ```
   concept = extract_from_command("/explain {concept}")

   If concept is empty:
     Return: "What would you like me to explain? Example: `/explain two pointers`"
   ```

2. **Check Context**
   ```
   If concept is related to current problem:
     - Be careful not to reveal the solution
     - Explain the concept generally, then note "This technique may or may not apply to your current problem"
   ```

3. **Provide Explanation**

   **Structure:**
   - What is it? (Definition)
   - When to use it (Use cases)
   - How it works (General approach)
   - Example (Generic, not current problem)
   - Complexity (Time/Space)
   - Common variations

   **Example Response:**
   ```markdown
   ## Two Pointers Technique

   **What it is:**
   A technique where you maintain two pointers (indices) that traverse an array, often from different positions.

   **When to use it:**
   - Sorted arrays
   - Finding pairs with certain properties
   - Reversing or rearranging arrays
   - Sliding window problems

   **How it works:**
   Common patterns:
   1. **Opposite ends:** Start one pointer at beginning, one at end, move inward
   2. **Same direction:** Both pointers move forward, but at different speeds
   3. **Sliding window:** Two pointers define a window that expands/contracts

   **Example (Two Sum in sorted array):**
   ```python
   def two_sum_sorted(arr, target):
       left, right = 0, len(arr) - 1
       while left < right:
           current_sum = arr[left] + arr[right]
           if current_sum == target:
               return [left, right]
           elif current_sum < target:
               left += 1
           else:
               right -= 1
       return None
   ```

   **Complexity:**
   - Time: O(n) - single pass through array
   - Space: O(1) - only two pointers

   **Common variations:**
   - Three pointers (for three-sum problems)
   - Fast and slow pointers (for cycle detection)

   **Note:** This is a general explanation. Consider whether this technique applies to your current problem!
   ```

4. **Track Interaction**
   ```json
   {
     "current_problem": {
       "concepts_explained": ["two pointers", "hash maps"]
     }
   }
   ```

**Error Handling:**
- Unknown concept: "I'm not familiar with that specific concept. Could you clarify, or try a different term?"
- Too vague: "Could you be more specific? For example, 'binary search' or 'recursion'?"

**Common Concepts to Support:**
- Data Structures: arrays, linked lists, stacks, queues, hash maps, trees, graphs, heaps
- Algorithms: binary search, sorting, DFS, BFS, dynamic programming, greedy, backtracking
- Techniques: two pointers, sliding window, divide and conquer, memoization
- Complexity: Big O notation, time vs space tradeoffs

---

## /submit

**Purpose:** Finalize solution, run all tests, generate comprehensive review

**Syntax:** `/submit`

**Implementation Steps:**

1. **Check Prerequisites**
   ```
   If no current problem:
     Return: "No active problem. Use `/new` to generate one."

   If solution.py empty:
     Return: "Write your solution first!"
   ```

2. **Confirmation** (optional but recommended)
   ```markdown
   Are you ready to submit? This will:
   - Run all tests (visible and hidden)
   - Generate a final review
   - Mark the problem as completed

   Type 'yes' to confirm, or continue working on your solution.
   ```

3. **Run All Tests**
   ```bash
   cd working
   python3 solution.py
   ```

4. **Generate Comprehensive Review**
   - Full review per REVIEW_PROTOCOL.md
   - Include all test results
   - Detailed complexity analysis
   - Complete feedback

5. **Update Metadata**
   ```json
   {
     "current_problem": {
       "status": "completed",
       "submitted_at": "timestamp",
       "final_score": {
         "tests_passed": 12,
         "tests_total": 12,
         "hints_used": 2,
         "time_spent_minutes": 45
       }
     },
     "stats": {
       "problems_attempted": previous + 1,
       "problems_solved": previous + (1 if all_tests_passed else 0),
       "total_tests_passed": previous + tests_passed,
       "total_tests_run": previous + tests_total,
       "category_stats": {
         "arrays": {
           "attempted": 5,
           "solved": 4,
           "avg_hints": 2.2
         }
       }
     }
   }
   ```

6. **Present Results**
   ```markdown
   # Submission Results

   ## Final Score: [X/Y tests passed]

   [Full review following REVIEW_PROTOCOL.md]

   ---

   ## Session Summary
   - Time spent: 45 minutes
   - Hints used: 2
   - Reviews before submit: 3

   ## What's Next?
   - Try another problem: `/new`
   - See your stats: `/stats`
   - Archive this session: `/flush`
   ```

7. **Offer Next Actions**
   - If passed: Congratulate, offer harder problem or different category
   - If failed: Encourage, offer to see solution or try again
   - Always show stats option

---

## /stats

**Purpose:** Show user's performance statistics

**Syntax:** `/stats [category]`
- `/stats` - Overall stats
- `/stats arrays` - Category-specific stats

**Implementation Steps:**

1. **Load Metadata**
   ```
   stats = metadata["stats"]
   history = metadata["problem_history"]
   ```

2. **Calculate Metrics**
   ```python
   success_rate = problems_solved / problems_attempted * 100
   avg_hints = total_hints / problems_attempted
   test_pass_rate = total_tests_passed / total_tests_run * 100
   ```

3. **Present Stats**

   **Overall Stats:**
   ```markdown
   # Your InterviewForge Stats

   ## Overall Performance
   - **Problems Attempted:** 15
   - **Problems Solved:** 12 (80%)
   - **Test Pass Rate:** 85%
   - **Average Hints Used:** 2.3 per problem

   ## By Difficulty
   - **Easy:** 5/5 solved (100%)
   - **Medium:** 6/8 solved (75%)
   - **Hard:** 1/2 solved (50%)

   ## By Category
   | Category | Attempted | Solved | Success Rate |
   |----------|-----------|--------|--------------|
   | Arrays | 5 | 4 | 80% |
   | Strings | 3 | 3 | 100% |
   | Trees | 4 | 3 | 75% |
   | Graphs | 2 | 1 | 50% |
   | DP | 1 | 1 | 100% |

   ## Recent Problems
   1. ✅ Two Sum Variation (Arrays, Medium) - 12/12 tests
   2. ✅ Valid Parentheses (Stacks, Easy) - 10/10 tests
   3. ❌ Binary Tree Paths (Trees, Medium) - 7/10 tests

   ## Recommendations
   - 🎯 You're strongest in Strings (100% success)
   - 📈 Try more Graph problems to improve (50% success)
   - 💪 Ready for more Hard problems (currently 50%)

   ---

   Keep up the great work! Use `/new` to practice more.
   ```

   **Category-Specific Stats:**
   ```markdown
   # Arrays - Detailed Stats

   **Success Rate:** 80% (4/5 solved)
   **Average Hints:** 1.8
   **Average Time:** 32 minutes

   ## Problems
   1. ✅ Two Sum Variation (Medium) - 12/12 tests, 2 hints, 45 min
   2. ✅ Product Except Self (Medium) - 10/10 tests, 1 hint, 28 min
   3. ✅ Longest Increasing Subsequence (Hard) - 12/12 tests, 3 hints, 67 min
   4. ❌ Container With Most Water (Medium) - 6/10 tests, 1 hint, 20 min
   5. ✅ Best Time to Buy Stock (Easy) - 8/8 tests, 0 hints, 15 min

   ## Common Issues
   - Edge cases: 2 problems failed edge case tests
   - Performance: 1 problem had timeout issues

   ## Suggestions
   - Review edge case handling (empty arrays, single elements)
   - Practice more with two-pointer technique
   ```

4. **Track Stats View**
   ```json
   {
     "stats_views": previous + 1,
     "last_stats_view": "timestamp"
   }
   ```

---

## /switch {company}

**Purpose:** Change target company for problem generation

**Syntax:**
- `/switch google`
- `/switch meta`
- `/switch leetcode`

**Implementation Steps:**

1. **Parse Company Name**
   ```
   company = extract_from_command("/switch {company}")

   If company is empty:
     Return: "Specify a company: `/switch google`"
   ```

2. **Normalize Name**
   ```
   company = company.lower().strip()
   ```

3. **Check for soul_docs**
   ```
   soul_docs_path = f"soul_docs/{company}/"

   If soul_docs exist:
     - Load them
     - Update active company
   Else:
     - Offer to create soul_docs
     - Trigger web search for company info
   ```

4. **Web Search for Unknown Company**
   ```
   Search queries:
   - "{company} software engineer interview questions 2025"
   - "{company} coding interview patterns"
   - "{company} technical interview process"

   Analyze:
   - Common question types
   - Difficulty levels
   - Interview format
   - Evaluation criteria
   ```

5. **Update Metadata**
   ```json
   {
     "active_company": "google",
     "company_history": ["leetcode", "google"],
     "company_stats": {
       "google": {
         "problems_attempted": 0,
         "problems_solved": 0
       }
     }
   }
   ```

6. **Present Confirmation**
   ```markdown
   ✅ Switched to: **Google**

   ## Google Interview Style
   - Focus: Scalability, system design integration
   - Common categories: Arrays, Trees, Graphs, Dynamic Programming
   - Difficulty: Mostly Medium-Hard
   - Time: Usually 45 minutes per problem

   Problems will now be generated in Google's interview style.

   **Ready to start?**
   - `/new` - Generate a Google-style problem
   - `/patterns` - See Google's common patterns
   ```

7. **If No soul_docs Found**
   ```markdown
   ℹ️ I don't have specific interview data for {company} yet.

   **Options:**
   1. `/newcompany {company}` - Create custom soul_docs (I'll research their interview style)
   2. Continue with generic LeetCode-style problems

   What would you like to do?
   ```

---

## /flush

**Purpose:** Archive current session and start fresh

**Syntax:** `/flush`

**Implementation Steps:**

1. **Confirmation**
   ```markdown
   This will archive your current session and start fresh.

   **Current session:**
   - Problem: [problem_name]
   - Status: [in_progress/completed]
   - Progress: [X/Y tests passing]

   Your stats will be saved. Continue? (yes/no)
   ```

2. **Archive Session**
   ```
   Create archive directory:
   archives/[timestamp]_[problem_name]/

   Move files:
   - problem.md
   - solution.py
   - test_cases.py
   - session_metadata.json
   ```

3. **Update Metadata**
   ```json
   {
     "current_problem": null,
     "last_flush": "timestamp",
     "session_count": previous + 1,
     "archived_sessions": [
       ...previous,
       {
         "timestamp": "ISO-8601",
         "problem": "problem_name",
         "final_status": "in_progress",
         "tests_passed": 8,
         "tests_total": 12
       }
     ]
   }
   ```

4. **Clean Current Session**
   ```
   - Clear current_problem
   - Keep stats and history
   - Reset hints_used counter
   ```

5. **Present Confirmation**
   ```markdown
   ✅ Session archived!

   **Archived to:** `archives/2025-01-15_two_sum_variation/`

   ## Ready for a Fresh Start
   - Total problems practiced: 15
   - Success rate: 80%
   - Active company: Google

   **What's next?**
   - `/new` - Generate a new problem
   - `/stats` - Review your progress
   - `/switch {company}` - Change company
   ```

---

## /patterns

**Purpose:** List available problem categories

**Syntax:** `/patterns`

**Implementation Steps:**

1. **Load Company Context**
   ```
   company = get_active_company()
   patterns = load_file(f"soul_docs/{company}/PATTERNS.md")
   ```

2. **Parse Categories**
   ```
   Extract categories from PATTERNS.md
   Group by type (Data Structures, Algorithms, etc.)
   ```

3. **Present Categories**
   ```markdown
   # Problem Categories - [Company]

   ## Data Structures
   - **Arrays** - Manipulation, searching, sorting
   - **Strings** - Pattern matching, manipulation
   - **Linked Lists** - Traversal, reversal, cycle detection
   - **Stacks & Queues** - LIFO/FIFO operations
   - **Hash Tables** - Fast lookups, counting
   - **Trees** - Binary trees, BST, traversals
   - **Graphs** - DFS, BFS, shortest paths
   - **Heaps** - Priority queues, top K elements

   ## Algorithms
   - **Two Pointers** - Efficient array traversal
   - **Sliding Window** - Subarray problems
   - **Binary Search** - Sorted array searching
   - **Sorting** - Custom sorting, comparisons
   - **Recursion** - Divide and conquer
   - **Backtracking** - Combinatorial problems
   - **Dynamic Programming** - Optimization problems
   - **Greedy** - Local optimal choices
   - **Bit Manipulation** - Bitwise operations

   ## Specialized
   - **Math & Geometry** - Mathematical problems
   - **Design** - Data structure design

   ---

   Use `/new {category}` to practice a specific category.
   Example: `/new arrays`
   ```

4. **Add Company-Specific Notes**
   ```markdown
   ## [Company]-Specific Patterns

   **Most Common:**
   - Arrays (35% of problems)
   - Trees (25% of problems)
   - Graphs (20% of problems)

   **Difficulty Distribution:**
   - Easy: 20%
   - Medium: 60%
   - Hard: 20%
   ```

---

## /newcompany {name}

**Purpose:** Create soul_docs for a new company

**Syntax:** `/newcompany stripe`

**Implementation Steps:**

1. **Parse Company Name**
   ```
   company_name = extract_from_command("/newcompany {name}")

   If empty:
     Return: "Specify company name: `/newcompany stripe`"
   ```

2. **Check if Already Exists**
   ```
   If soul_docs/{company}/ exists:
     Return: "Soul docs for {company} already exist. Use `/switch {company}` to activate."
   ```

3. **Web Search for Company Interview Info**
   ```
   Searches (multiple queries):
   1. "{company} software engineer technical interview 2025"
   2. "{company} coding interview questions patterns"
   3. "{company} interview process format"
   4. "{company} what to expect technical screen"

   Extract:
   - Common question categories
   - Difficulty level preference
   - Interview format (time, structure)
   - Evaluation criteria (what they value)
   - Example problems mentioned
   - Company culture/values that influence questions
   ```

4. **Create Directory Structure**
   ```
   mkdir soul_docs/{company}/
   ```

5. **Generate PATTERNS.md**
   ```markdown
   # [Company] Interview Patterns

   *Generated from research on [date]*

   ## Overview
   [Summary of company's interview style based on research]

   ## Common Categories
   [List categories with percentages if found]

   ## Difficulty Distribution
   [Easy/Medium/Hard breakdown]

   ## Interview Format
   [Time limits, number of rounds, format details]

   ## Notes
   [Any specific quirks or patterns noticed]
   ```

6. **Generate EVAL_CRITERIA.md**
   ```markdown
   # [Company] Evaluation Criteria

   ## What They Value
   [Based on research - e.g., code quality, communication, optimization]

   ## Interview Focus Areas
   - **Technical Skills:** [specifics]
   - **Problem Solving:** [approach]
   - **Code Quality:** [standards]
   - **Communication:** [expectations]

   ## Red Flags
   [Things to avoid based on company culture]

   ## Success Tips
   [Advice for this specific company]
   ```

7. **Generate EXAMPLE_PROBLEMS.md**
   ```markdown
   # [Company] Example Problems

   *Common problem types asked at [Company]*

   ## Problem Type 1: [Category]
   **Example:** [Generic problem description]
   **Why they ask it:** [Reasoning]
   **Key concepts tested:** [List]

   [Repeat for major categories found]
   ```

8. **Generate BEHAVIORAL.md**
   ```markdown
   # [Company] Behavioral Interview Prep

   ## Company Values
   [Research-based values]

   ## Common Behavioral Questions
   [If found in research]

   ## Leadership Principles / Values
   [Company-specific frameworks]
   ```

9. **Update Metadata**
   ```json
   {
     "companies": ["leetcode", "google", "new_company"],
     "custom_companies": ["new_company"],
     "company_created_dates": {
       "new_company": "timestamp"
     }
   }
   ```

10. **Present Results**
    ```markdown
    ✅ Soul docs created for **[Company]**!

    ## Research Summary
    Based on my research, [Company]'s technical interviews typically:
    - Focus on: [key areas]
    - Difficulty: Mostly [Easy/Medium/Hard]
    - Common categories: [list]
    - Interview length: [time] per problem

    ## Files Created
    - `soul_docs/{company}/PATTERNS.md` - Question patterns
    - `soul_docs/{company}/EVAL_CRITERIA.md` - Evaluation criteria
    - `soul_docs/{company}/EXAMPLE_PROBLEMS.md` - Example problems
    - `soul_docs/{company}/BEHAVIORAL.md` - Behavioral prep

    ## Next Steps
    - Review the generated docs (you can customize them!)
    - `/switch {company}` - Activate this company
    - `/new` - Generate a {company}-style problem

    **Note:** These docs are generated from research and may not be 100% accurate.
    Feel free to edit them in `soul_docs/{company}/` based on your own experience!
    ```

11. **Error Handling**
    - Web search fails: "Couldn't find enough info. Create generic soul_docs?"
    - Invalid company name: "Please provide a valid company name"
    - Permission errors: "Couldn't create directory. Check permissions."

---

## Command Error Handling

### General Error Patterns

**Unknown Command:**
```markdown
Unknown command: `/xyz`

**Available commands:**
- `/new [category]` - Generate new problem
- `/hint` - Get a hint
- `/review` - Review solution
- `/explain {concept}` - Explain concept
- `/submit` - Submit solution
- `/stats [category]` - View stats
- `/switch {company}` - Change company
- `/flush` - Archive session
- `/patterns` - List categories
- `/newcompany {name}` - Add company

Type the command to learn more!
```

**Missing Required Argument:**
```markdown
The `/switch` command requires a company name.

**Usage:** `/switch {company}`
**Example:** `/switch google`

**Available companies:**
- leetcode (default)
- google
- meta
- amazon
- [custom companies]

Or create new: `/newcompany {name}`
```

**Invalid State:**
```markdown
You need an active problem to use `/review`.

**Start practicing:**
- `/new` - Generate a new problem
- `/new arrays` - Generate an arrays problem
```

---

## Command Aliases (Optional)

Consider supporting short aliases:
- `/n` → `/new`
- `/h` → `/hint`
- `/r` → `/review`
- `/s` → `/stats`

---

## Implementation Checklist

For each command, ensure:
- [ ] Command parsing handles variations (case, spaces)
- [ ] Required arguments are validated
- [ ] State prerequisites are checked
- [ ] Metadata is updated
- [ ] User receives clear confirmation
- [ ] Errors provide helpful guidance
- [ ] Next steps are suggested
- [ ] Command is documented in help

---

## Best Practices

1. **Always Acknowledge**: Confirm what command was received
2. **Be Immediate**: Execute commands right away, don't ask unnecessary confirmations
3. **Be Helpful**: If command fails, tell user exactly how to fix it
4. **Update State**: Keep metadata in sync
5. **Guide Next Steps**: Always suggest what user can do next
6. **Handle Edge Cases**: Empty inputs, invalid states, etc.
7. **Be Consistent**: Use same format/tone for all commands
8. **Track Analytics**: Log command usage in metadata for insights

Remember: Commands should feel natural and intuitive. Users shouldn't have to think about syntax - the system should understand their intent and guide them when needed.
