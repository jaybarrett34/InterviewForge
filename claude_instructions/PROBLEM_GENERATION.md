# Problem Generation Guidelines

## Overview

When generating a new problem (via `/new [category]`), you must create an authentic, challenging interview problem that matches the target company's style while being completely original.

## Pre-Generation Steps

### 1. Determine Company Context

- Check which company is active in metadata.json
- Load soul_docs/{company}/PATTERNS.md to understand their question styles
- Review soul_docs/{company}/EXAMPLE_PROBLEMS.md for reference
- Note any category-specific preferences

### 2. Select or Use Category

If user specified category (e.g., `/new arrays`):
- Use that category
- Ensure it's available in the company's PATTERNS.md

If no category specified:
- Intelligently select based on:
  - What user hasn't practiced recently (check metadata.json)
  - What they struggle with (check success rates by category)
  - Company's most common categories
  - Good variety in their practice

### 3. Determine Difficulty

Base difficulty on:
- User's overall success rate
- User's success rate in this specific category
- Company's typical difficulty distribution
- User's explicit difficulty preference (if set in metadata)

Default distribution:
- 30% Easy
- 50% Medium
- 20% Hard

## Problem Structure

Create a problem.md file with this exact structure:

```markdown
# [Problem Title]

**Difficulty:** [Easy|Medium|Hard]
**Category:** [Category Name]
**Company:** [Company Name]

## Description

[2-4 paragraphs describing the problem clearly and completely]

[Include any relevant context, definitions, or background needed]

## Examples

### Example 1
**Input:** [clear input format]
**Output:** [expected output]
**Explanation:** [why this is the output]

### Example 2
**Input:** [different case]
**Output:** [expected output]
**Explanation:** [why this is the output]

### Example 3 (Optional)
**Input:** [edge case or complex case]
**Output:** [expected output]
**Explanation:** [why this is the output]

## Constraints

- [Constraint 1: usually size limits]
- [Constraint 2: value ranges]
- [Constraint 3: time complexity requirements if applicable]
- [Constraint 4: any special rules]
- [Additional constraints as needed]

## Hints

<details>
<summary>Hint 1</summary>

[First hint - high level, just redirects thinking]

</details>

<details>
<summary>Hint 2</summary>

[Second hint - suggests an approach or technique]

</details>

<details>
<summary>Hint 3</summary>

[Third hint - more specific guidance or pseudocode idea]

</details>

## Notes

[Any additional context, follow-up questions, or variations to consider]
```

## Problem Quality Guidelines

### Must Be Original

**NEVER copy known LeetCode problems or problems from other sources.** Instead:

1. Take inspiration from common patterns but create unique scenarios
2. Combine multiple concepts in novel ways
3. Use different contexts (e.g., instead of "array of integers," use "list of timestamps," "sequence of API calls," etc.)
4. Create your own examples and test cases

**Bad (copying):**
> "Given an array of integers, find two numbers that add up to a target."

**Good (original):**
> "You're building a music playlist feature. Given a list of song durations in seconds and a target total time, find two songs that together exactly match the target duration. Return the indices of these songs."

### Match Company Style

Use soul_docs to match style:

**For Google:**
- Emphasize scalability and system design considerations
- Often involves real-world scenarios
- May have multiple parts or follow-ups

**For Meta:**
- Focus on practical applications (social networks, feeds, messaging)
- Optimization is key
- Often graph or tree problems in social network contexts

**For Amazon:**
- Emphasize practical business logic
- Often involves arrays, strings, or simple data structures
- Leadership principles reflected (e.g., customer obsession)

**For Startup/Generic:**
- Practical, immediately applicable
- Less emphasis on optimal complexity
- More emphasis on clean code and maintainability

### Difficulty Calibration

**Easy Problems:**
- Single data structure (array, string, hash map)
- One clear algorithm or technique
- 2-3 edge cases maximum
- Should be solvable in 15-20 minutes
- Example: Simple string manipulation, basic array operations, straightforward hash map usage

**Medium Problems:**
- Multiple data structures or concepts combined
- Requires algorithmic thinking (two pointers, sliding window, BFS/DFS, etc.)
- 4-6 edge cases
- Should be solvable in 30-40 minutes
- Example: Two pointers on arrays, graph traversal, dynamic programming introduction

**Hard Problems:**
- Complex algorithm required (advanced DP, complex graph algorithms, etc.)
- Multiple approaches possible with different tradeoffs
- Optimization is non-trivial
- 7+ edge cases
- Should be solvable in 45-60 minutes
- Example: Advanced dynamic programming, complex graph problems, optimization problems

### Description Quality

**Be Clear and Complete:**
- Define all terms (don't assume user knows domain-specific vocabulary)
- Specify input/output formats precisely
- Include edge case behavior in description
- Make it unambiguous

**Be Engaging:**
- Use realistic scenarios when possible
- Make it relatable
- Avoid overly abstract problems unless it's a math/algorithm problem

**Be Concise:**
- 2-4 paragraphs maximum
- Every sentence should add information
- Don't pad with fluff

### Examples Strategy

**Include 2-3 Examples:**

1. **Example 1**: Basic happy path case
2. **Example 2**: Different scenario showing another aspect
3. **Example 3** (optional): Edge case or more complex case

**Each Example Must Include:**
- Clear input format
- Expected output
- Explanation of WHY (helps user understand the logic)

**Example Quality:**

Bad:
```
Input: [1,2,3]
Output: 6
```

Good:
```
Input: nums = [1, 2, 3]
Output: 6
Explanation: The sum of all elements is 1 + 2 + 3 = 6.
```

### Constraints Section

**Always Include:**
1. Size constraints (array length, string length, etc.)
2. Value ranges (integer limits, character types, etc.)
3. Special rules (uniqueness, sorting, nullability, etc.)
4. Performance requirements if relevant (e.g., "Your solution should run in O(n) time")

**Format:**
```markdown
## Constraints

- 1 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- All elements in nums are unique
- You may assume the array is sorted in ascending order
```

### Hints Strategy

**Hint 1 - Gentle Nudge:**
- Asks a clarifying question
- Suggests thinking about a specific aspect
- Very high level

Example: "What data structure would help you quickly check if you've seen a value before?"

**Hint 2 - Approach Suggestion:**
- Suggests a general technique or algorithm
- Doesn't give away implementation
- Still requires user to figure out details

Example: "Consider using a hash map to store values as you iterate through the array."

**Hint 3 - More Specific:**
- May include pseudocode or specific steps
- User still needs to implement
- Helps if truly stuck

Example: "As you iterate, for each number check if (target - number) exists in your hash map. If yes, return those indices. If not, add the current number to the map."

## File Structure for Problems

InterviewForge uses a **two-file structure** to maintain interview integrity by keeping test cases hidden from the user:

1. **`working/solution.py`** - User's solution code (they see and edit this)
2. **`working/test_cases.py`** - Test cases and runner (hidden from user, Claude updates this)

This separation ensures users can't see the expected answers while practicing.

### solution.py Structure

The solution file contains only the Solution class. When generating a new problem, update the `solve()` method signature and docstring:

```python
"""
[Problem Title]
===============

[Brief problem description]
"""

from typing import List, Optional, Dict, Any, Tuple


class Solution:
    """
    [Problem description for docstring]
    """

    def solve(self, [parameters with types]) -> [return_type]:
        """
        [Problem description]

        Args:
            [parameter]: [description]

        Returns:
            [description of return value]
        """
        # TODO: Implement your solution here
        pass


# ============================================
# TEST RUNNER - Click "Run" to execute
# ============================================

if __name__ == "__main__":
    from test_cases import run_tests
    run_tests(Solution())
```

### test_cases.py Structure

The test cases file contains the TEST_CASES list and the run_tests() function. Update this file when generating a new problem:

```python
"""
InterviewForge - Test Cases
===========================

This file contains the test cases for the current problem.
DO NOT MODIFY - This file is automatically updated by Claude when generating problems.
"""

# Test cases for the current problem
TEST_CASES = [
    {"input": (arg1, arg2), "expected": expected_output},
    {"input": (arg1, arg2), "expected": expected_output},
    {"input": (arg1, arg2), "expected": expected_output},
]


def run_tests(solution):
    """Run test cases against the provided solution instance."""
    print("=" * 50)
    print("Running Tests...")
    print("=" * 50)

    passed = 0
    failed = 0

    for i, test in enumerate(TEST_CASES, 1):
        args = test["input"]
        expected = test["expected"]

        try:
            if isinstance(args, tuple):
                result = solution.solve(*args)
            else:
                result = solution.solve(args)

            if result == expected:
                print(f"Test {i}: PASSED")
                passed += 1
            else:
                print(f"Test {i}: FAILED")
                print(f"  Input: {args}")
                print(f"  Expected: {expected}")
                print(f"  Got: {result}")
                failed += 1

        except Exception as e:
            print(f"Test {i}: ERROR - {e}")
            failed += 1

    print("=" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 50)

    return passed, failed
```

### Example: Generating a Two Sum Problem

When user asks for a Two Sum problem, update **both files**:

**solution.py:**
```python
"""
Two Sum
=======

Given an array of integers nums and an integer target,
return indices of the two numbers that add up to target.
"""

from typing import List, Optional, Dict, Any, Tuple


class Solution:
    """
    Find two numbers in an array that add up to a target.
    """

    def solve(self, nums: List[int], target: int) -> List[int]:
        """
        Find indices of two numbers that add up to target.

        Args:
            nums: List of integers
            target: Target sum to find

        Returns:
            List containing the two indices
        """
        # TODO: Implement your solution here
        pass


# ============================================
# TEST RUNNER - Click "Run" to execute
# ============================================

if __name__ == "__main__":
    from test_cases import run_tests
    run_tests(Solution())
```

**test_cases.py:**
```python
"""
InterviewForge - Test Cases
===========================

This file contains the test cases for the current problem.
DO NOT MODIFY - This file is automatically updated by Claude when generating problems.
"""

TEST_CASES = [
    {"input": ([2, 7, 11, 15], 9), "expected": [0, 1]},
    {"input": ([3, 2, 4], 6), "expected": [1, 2]},
    {"input": ([3, 3], 6), "expected": [0, 1]},
    {"input": ([1, 5, 3, 7, 2], 9), "expected": [1, 3]},
    {"input": ([-1, -2, -3, -4], -6), "expected": [1, 3]},
]


def run_tests(solution):
    """Run test cases against the provided solution instance."""
    print("=" * 50)
    print("Running Tests...")
    print("=" * 50)

    passed = 0
    failed = 0

    for i, test in enumerate(TEST_CASES, 1):
        args = test["input"]
        expected = test["expected"]

        try:
            if isinstance(args, tuple):
                result = solution.solve(*args)
            else:
                result = solution.solve(args)

            if result == expected:
                print(f"Test {i}: PASSED")
                passed += 1
            else:
                print(f"Test {i}: FAILED")
                print(f"  Input: {args}")
                print(f"  Expected: {expected}")
                failed += 1

        except Exception as e:
            print(f"Test {i}: ERROR - {e}")
            failed += 1

    print("=" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 50)

    return passed, failed
```

### Key Points When Generating Problems

1. **Update BOTH files** - solution.py for the method signature, test_cases.py for test cases
2. **Keep the import structure** - solution.py imports from test_cases.py
3. **Never include test cases in solution.py** - This maintains interview integrity
4. **Include 5-8 test cases** covering normal cases and edge cases
5. **Use tuples for multiple arguments**: `{"input": (arg1, arg2), "expected": result}`
6. **Use single values for single arguments**: `{"input": [1,2,3], "expected": 6}`
7. **Keep run_tests() generic** - It receives the Solution instance as a parameter

## Web Search Integration

If the target company is unknown or has no soul_docs:

1. **Trigger Web Search:**
   ```
   Search: "{company_name} technical interview questions patterns 2025"
   Search: "{company_name} coding interview style"
   ```

2. **Analyze Results:**
   - Common question categories
   - Difficulty distribution
   - Specific topics emphasized
   - Time limits and expectations

3. **Generate Appropriate Problem:**
   - Match the discovered patterns
   - Use the appropriate difficulty
   - Reflect the company's style

4. **Suggest Creating soul_docs:**
   - Ask user if they want to run `/newcompany {name}` to save this info

## Post-Generation Steps

1. **Save problem.md** to the working directory
2. **Update solution.py** with the new solve() method signature
3. **Update test_cases.py** with the test cases (hidden from user)
4. **Update metadata.json:**
   - Add problem to history
   - Set current_problem
   - Track category
   - Record generation timestamp
5. **Present to User:**
   - Show the problem.md content
   - Mention the solution.py template is ready
   - Encourage them to start coding
   - Remind them of available commands (/hint, /review, etc.)

## Problem Categories Reference

Ensure your problems fit into recognized categories:

**Data Structures:**
- Arrays
- Strings
- Linked Lists
- Stacks & Queues
- Hash Tables
- Trees
- Graphs
- Heaps

**Algorithms:**
- Two Pointers
- Sliding Window
- Binary Search
- Sorting
- Recursion
- Backtracking
- Dynamic Programming
- Greedy
- Divide and Conquer
- Bit Manipulation

**Specialized:**
- Math & Geometry
- System Design (for senior roles)
- Concurrency
- Database Queries

## Quality Checklist

Before finalizing a problem, verify:

- [ ] Problem is original, not a copy
- [ ] Description is clear and unambiguous
- [ ] 2-3 examples with explanations included
- [ ] Constraints are specific and complete
- [ ] 3 progressive hints included
- [ ] Difficulty matches user's level
- [ ] Style matches target company
- [ ] solution.py updated with correct method signature
- [ ] test_cases.py updated with comprehensive test cases
- [ ] All edge cases are considered
- [ ] Problem is actually solvable
- [ ] Estimated solve time is appropriate for difficulty

## Common Pitfalls to Avoid

1. **Ambiguous Input/Output**: Always be crystal clear about formats
2. **Impossible Problems**: Verify there's actually a solution
3. **Too Similar**: Don't generate the same type of problem twice in a row
4. **Misleading Examples**: Examples must accurately represent the problem
5. **Missing Edge Cases**: Always think about empty inputs, single elements, maximum sizes
6. **Unclear Constraints**: Don't leave users guessing about limits
7. **Copy-Paste from LeetCode**: Always create original problems
8. **Overly Artificial**: Try to use realistic scenarios when possible

## Innovation and Variety

To keep practice engaging:

- **Vary contexts**: Use different real-world scenarios
- **Combine patterns**: Mix two techniques (e.g., sliding window + hash map)
- **Add twists**: Take a classic pattern and add a unique constraint
- **Progression**: Make follow-up problems that build on previous ones
- **Multiple solutions**: Create problems with several valid approaches

Remember: The goal is to prepare users for real interviews by exposing them to diverse, challenging, yet fair problems that build fundamental skills.
