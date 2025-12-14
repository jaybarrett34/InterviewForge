# Solution Review Protocol

## Overview

When a user requests a review (via `/review` or `/submit`), you must provide comprehensive, constructive feedback on their solution. This is one of the most critical interactions in InterviewForge - done well, it accelerates learning; done poorly, it discourages users.

## When to Review

### Explicit Review Triggers

**You MAY read solution.py and provide review when:**

1. User runs `/review` command
2. User runs `/submit` command
3. User explicitly shares their code in the chat
4. User asks "Can you review my solution?"
5. User asks "Is this correct?"

**You MUST NOT read solution.py or review when:**

1. User hasn't explicitly requested it
2. User is still working on the problem
3. User asks for hints (use `/hint` protocol instead)
4. User asks clarifying questions about the problem

## Review Process Flow

### Step 1: Read the Solution

```python
# You now have permission to read solution.py
solution_code = read_file("solution.py")
```

Analyze:
- What approach did they take?
- Is the logic sound?
- Are there obvious bugs?
- What's the time/space complexity?

### Step 2: Run Tests

```bash
cd [problem_directory]
pytest test_solution.py -v
```

Capture:
- Which tests passed
- Which tests failed
- Any errors or exceptions
- Performance metrics (if available)

### Step 3: Analyze Results

Categorize the solution state:

**Perfect (All tests pass):**
- Correct logic
- Handles all edge cases
- Good code quality
- Focus review on optimization and style

**Partially Working (Some tests pass):**
- Core logic might be sound
- Missing edge case handling
- Focus on what's failing and why

**Not Working (Most/all tests fail):**
- Fundamental logic error
- Misunderstood problem
- Focus on understanding before implementation

**Won't Run (Syntax/runtime errors):**
- Code has errors before tests even run
- Focus on debugging basics first

### Step 4: Structure Your Review

Provide review in this order:

1. **Test Results Summary**
2. **What Works Well** (always start positive)
3. **Issues Found** (be specific and constructive)
4. **Code Quality Observations**
5. **Complexity Analysis**
6. **Suggestions for Improvement**
7. **Next Steps**

## Review Template

```markdown
## Solution Review

### Test Results
- ✅ Visible Tests: X/Y passed
- ✅ Hidden Tests: X/Y passed
- **Overall: X/Y tests passed**

[If any tests failed]
Failed tests:
- test_edge_case_empty: Expected None, got []
- test_boundary_maximum: Solution too slow (2.3s)

---

### What Works Well

[Always start with positives - what did they do right?]

- ✅ Core algorithm is correct
- ✅ Code is readable and well-structured
- ✅ Variable names are clear
- ✅ Handles the basic cases from examples

---

### Issues Found

[Be specific - point to exact lines and explain WHY it's an issue]

#### 1. [Issue Category - e.g., Edge Case Handling]

**Problem:** [Description]

**Example:**
```python
# Line 15: This fails when array is empty
max_val = arr[0]  # IndexError if arr is empty
```

**Why it matters:** [Explanation]

**How to fix:** [Guidance without full solution]

#### 2. [Next Issue]

[Continue for each issue...]

---

### Code Quality Observations

[Comment on style, readability, maintainability]

**Strengths:**
- [Good practices they followed]

**Areas for Improvement:**
- [Suggestions for better code]

---

### Complexity Analysis

**Time Complexity:** O([your analysis])
- [Explain why]

**Space Complexity:** O([your analysis])
- [Explain why]

[If not optimal]
**Note:** This problem can be solved in O([better complexity]). [Hint toward better approach without giving it away]

---

### Suggestions for Improvement

1. **[Suggestion 1]**: [Specific, actionable advice]
2. **[Suggestion 2]**: [Specific, actionable advice]
3. **[Suggestion 3]**: [Specific, actionable advice]

---

### Next Steps

[Based on results, suggest what to do next]

[If passed all tests]
- ✅ Great job! Your solution is correct.
- Consider: [Optional optimization or alternative approach]
- Ready to try another problem? Use `/new` to generate one.

[If failed some tests]
- Focus on: [Specific area to work on]
- Try: [Specific debugging approach]
- When ready, run `/review` again to check your fixes.

[If failed most tests]
- Recommendation: [Revisit approach, try different algorithm, etc.]
- Consider: [Hint or resource]
- Don't hesitate to use `/hint` if you're stuck.
```

## Detailed Review Components

### 1. Test Results Summary

**Be Clear and Concise:**

Good:
```
### Test Results
- ✅ Visible Tests: 3/3 passed
- ⚠️  Hidden Tests: 5/9 passed
- **Overall: 8/12 tests passed (67%)**

Failed tests:
- test_edge_case_empty: IndexError on line 15
- test_boundary_maximum: Solution timeout (>5s)
- test_all_duplicates: Expected [1], got []
- test_complex_scenario_2: Wrong result
```

Bad:
```
Some tests failed. Your code has problems.
```

**For Failed Tests:**
- Show the test name (descriptive)
- Show the error type OR brief description
- Do NOT show the actual test inputs/outputs (for hidden tests)
- Do provide hints about what category of issue (edge case, boundary, performance, etc.)

### 2. What Works Well

**Always start positive.** Even failed solutions have something good:

Examples:
- "Your choice to use a hash map is perfect for this problem"
- "The code is very readable with clear variable names"
- "You correctly identified that [approach] would work"
- "The main logic for handling [scenario] is sound"
- "Good use of helper functions to keep code organized"
- "I like how you handled [specific case]"

**Why this matters:**
- Builds confidence
- Reinforces correct thinking
- Makes criticism easier to receive
- Identifies what to preserve during refactoring

### 3. Issues Found

**Be Specific and Educational:**

For each issue, provide:

1. **Category**: Edge Case, Logic Error, Performance, etc.
2. **Location**: Line numbers
3. **Description**: What's wrong
4. **Why it matters**: Impact of the issue
5. **How to fix**: Guidance (not full solution)

**Example - Edge Case:**

```markdown
#### Edge Case: Empty Input

**Problem:** Your solution doesn't handle empty arrays.

**Location:**
```python
# Line 15
max_val = arr[0]  # ❌ IndexError when arr is empty
```

**Why it matters:** Empty inputs are common edge cases in interviews. Your solution crashes instead of returning a sensible default.

**How to fix:** Add a check at the beginning:
- What should an empty array return? (Check problem description)
- Add an if statement before accessing arr[0]
```

**Example - Logic Error:**

```markdown
#### Logic Error: Off-by-One in Loop

**Problem:** Your loop doesn't check the last element.

**Location:**
```python
# Line 23
for i in range(len(arr) - 1):  # ❌ Misses last element
    if arr[i] > max_val:
        max_val = arr[i]
```

**Why it matters:** This causes incorrect results when the maximum is at the last position.

**How to fix:**
- `range(len(arr) - 1)` goes from 0 to len-2
- Should be `range(len(arr))` to include all elements
```

**Example - Performance:**

```markdown
#### Performance: Inefficient Nested Loop

**Problem:** Your solution has O(n²) time complexity, but O(n) is achievable.

**Location:**
```python
# Lines 18-21
for i in range(len(arr)):
    for j in range(len(arr)):  # ❌ Nested loop not necessary
        if arr[i] + arr[j] == target:
            return [i, j]
```

**Why it matters:** This times out on large inputs (test_boundary_maximum failed due to timeout).

**How to fix:**
- Can you check if a complement exists without checking every other element?
- Consider using a hash map to store values you've seen
- This would reduce the inner loop to O(1) lookup
```

### 4. Code Quality Observations

**Assess Readability and Maintainability:**

**Good Examples:**
- "Variable names like `left_pointer` and `right_pointer` are much clearer than `l` and `r`"
- "Good use of comments to explain the algorithm"
- "Breaking out the helper function makes the code easier to test"
- "Consistent indentation and formatting"

**Areas for Improvement:**
- "Consider more descriptive variable names (e.g., `count` instead of `c`)"
- "This 30-line function could be broken into smaller, focused functions"
- "Adding type hints would make the function signature clearer"
- "Some comments would help explain the non-obvious logic"

**Code Smells to Point Out:**
- Magic numbers (suggest named constants)
- Repeated code (suggest extracting to function)
- Unclear variable names
- Too much nesting (suggest early returns)
- Missing error handling

### 5. Complexity Analysis

**Provide Clear Analysis:**

Template:
```markdown
### Complexity Analysis

**Time Complexity:** O(n)
- Single pass through the array: O(n)
- Hash map lookups are O(1)
- Overall: O(n)

**Space Complexity:** O(n)
- Hash map can store up to n elements
- No other significant space usage
- Overall: O(n)
```

**If Not Optimal:**
```markdown
**Current Complexity:** O(n²) time, O(1) space
**Optimal Complexity:** O(n) time, O(n) space

**Analysis:** Your nested loop approach works but is inefficient. There's a classic space-time tradeoff here - by using O(n) extra space (a hash map), you can reduce time complexity from O(n²) to O(n).

**Hint:** Think about what you're looking for in the inner loop. Can you store that information as you go?
```

**For Common Patterns:**
- Single loop: O(n)
- Nested loops: O(n²)
- Binary search: O(log n)
- Sorting: O(n log n)
- Hash map operations: O(1) average
- Recursion: Often O(2^n) or O(n) depending on memoization

### 6. Suggestions for Improvement

**Be Actionable and Prioritized:**

Good:
```markdown
### Suggestions for Improvement

1. **Handle edge cases first**: Add checks for empty input and single element at the start of your function

2. **Optimize the search**: Replace the nested loop with a hash map approach to improve from O(n²) to O(n)

3. **Add input validation**: Consider what should happen with invalid inputs (negative numbers, None, etc.)

4. **Improve variable names**: `temp` → `current_sum`, `x` → `index`
```

Bad:
```markdown
### Suggestions

- Make it faster
- Fix the bugs
- Write better code
```

**Prioritize:**
1. Correctness issues (must fix)
2. Edge cases (must fix)
3. Performance issues (should fix)
4. Code quality (nice to have)

### 7. Next Steps

**Guide User Based on Results:**

**If All Tests Pass:**
```markdown
### Next Steps

Excellent work! Your solution is correct and handles all test cases. 🎉

**Optional Challenges:**
- Can you solve this with O(1) extra space instead of O(n)?
- Try solving it iteratively instead of recursively (or vice versa)
- Consider: What if the input was streamed instead of all at once?

**Ready for more?**
- Use `/new` to generate another problem
- Use `/stats` to see your progress
- Try a different category with `/new [category]`
```

**If Some Tests Pass:**
```markdown
### Next Steps

You're on the right track! The core logic works but needs edge case handling.

**Focus Areas:**
1. First, fix the empty array issue (test_edge_case_empty)
2. Then, handle the duplicate values case (test_all_duplicates)
3. Finally, optimize for large inputs (test_boundary_maximum)

**Approach:**
- Fix one failing test at a time
- Run `/review` after each fix to verify
- Use `/hint` if you get stuck

Keep going! You're close to a complete solution.
```

**If Most Tests Fail:**
```markdown
### Next Steps

Let's take a step back and reconsider the approach.

**Recommendations:**
1. Re-read the problem description carefully
2. Work through the examples by hand to understand the pattern
3. Consider using `/hint` to get a nudge in the right direction
4. Try a different algorithm approach

**Debugging Tips:**
- Print your intermediate values to see where logic breaks
- Test with simple cases first (e.g., [1, 2] with target 3)
- Draw out what should happen step by step

Don't get discouraged - debugging is a critical skill, and you're learning!
```

## Review Principles

### 1. Be Constructive, Not Critical

**Good:**
> "Your nested loop approach works but times out on large inputs. Consider using a hash map to track seen values - this would reduce the inner loop to a single O(1) lookup."

**Bad:**
> "This is too slow. You should know that nested loops are bad. Use a hash map."

### 2. Explain the Why

**Good:**
> "Checking `if len(arr) == 0:` prevents an IndexError when accessing `arr[0]`. Empty inputs are a common edge case in interviews and real code."

**Bad:**
> "Add a check for empty array."

### 3. Guide, Don't Solve

**Good:**
> "Think about what data structure allows O(1) lookups. As you iterate through the array, what if you stored each value you've seen?"

**Bad:**
> "Here's the solution: Create a dict, iterate through arr, check if target-num is in dict, return indices."

### 4. Point to Specifics

**Good:**
> "Line 23: `for i in range(len(arr) - 1):` only goes to the second-to-last element. This means if the answer involves the last element, you'll miss it."

**Bad:**
> "Your loop is wrong."

### 5. Acknowledge Partial Credit

**Good:**
> "Your solution correctly handles the happy path and shows you understand the core algorithm. The main issue is edge case handling, which is a separate skill."

**Bad:**
> "This fails 4 tests so it's not good."

### 6. Provide Resources

When appropriate:
> "If you're unfamiliar with the two-pointer technique, it's a common pattern for array problems. Use `/explain two pointers` to learn more."

## Special Review Scenarios

### Scenario: Multiple Valid Approaches

If their approach works but isn't optimal:

```markdown
Your solution is **correct** and passes all tests!

**Note on Approach:**
You used a sorting approach (O(n log n)), which works well. There's also an O(n) approach using a hash map that would be faster for very large inputs, but for most practical purposes, your solution is excellent.

In an interview, you might mention: "This is O(n log n) due to sorting. There's an O(n) approach, but this is cleaner and fast enough for the constraints."
```

### Scenario: Solution is Correct but Unreadable

```markdown
### Test Results
✅ All tests pass! Your solution is functionally correct.

### Code Quality Feedback

While your solution works, let's talk about readability:

**Current:**
```python
def f(a,t):
    d={}
    for i,n in enumerate(a):
        if t-n in d:return[d[t-n],i]
        d[n]=i
```

**Suggestions:**
1. Use descriptive function and variable names
2. Add whitespace around operators
3. Consider multiple lines for clarity
4. Add a docstring

In interviews, readable code shows professionalism and makes it easier for interviewers to follow your thinking.
```

### Scenario: Completely Wrong Approach

```markdown
### Understanding Check

I think there might be a misunderstanding of the problem. Let me help clarify:

**The Problem Asks:** [Restate clearly]

**Your Solution Does:** [What they actually implemented]

**The Gap:** [Explain the difference]

**Suggestion:**
- Re-read the problem description
- Work through Example 1 step-by-step on paper
- Think about what data structure naturally fits this problem
- Use `/hint` to get pointed in the right direction

Would you like me to provide a hint, or would you prefer to re-approach it yourself first?
```

### Scenario: Solution Has a Subtle Bug

```markdown
### Close, but...

Your solution passes 11/12 tests! There's one subtle edge case:

**The Bug:**
Line 27: `if left < right:` should be `if left <= right:`

**Why it Matters:**
When the array has odd length, the middle element never gets checked with `<`.

**Example That Fails:**
- Input: [1, 2, 3], target: 2
- Your output: None (doesn't find 2)
- Expected: Index 1

This is a classic off-by-one error in binary search implementations. Easy to make, important to catch!

**Fix:** Change to `<=` and you'll pass all tests.
```

## Updating Metadata After Review

After providing review, update metadata.json:

```json
{
  "last_review": {
    "timestamp": "2025-01-15T10:30:00Z",
    "tests_passed": 8,
    "tests_total": 12,
    "status": "partial_success",
    "hints_used": 2,
    "time_spent_minutes": 45
  },
  "stats": {
    "problems_attempted": 15,
    "problems_solved": 12,
    "total_hints_used": 23,
    "review_count": 3
  }
}
```

Track:
- Test results
- Hints used
- Time spent
- Review iterations
- Category performance

## Common Mistakes to Avoid in Reviews

1. **Being Vague**: "This is wrong" vs "Line 15 causes IndexError on empty input"
2. **Being Harsh**: "This is terrible" vs "This approach works but has optimization opportunities"
3. **Giving Full Solutions**: Resist the urge - guide instead
4. **Ignoring Positives**: Always acknowledge what works
5. **Too Long**: Be thorough but concise
6. **Too Technical**: Match user's level
7. **Assuming Intent**: Ask if unclear why they did something
8. **Revealing Hidden Tests**: Never show hidden test inputs/outputs
9. **Not Explaining Complexity**: Always analyze time/space
10. **No Next Steps**: Always end with clear guidance

## Quality Checklist

Before sending a review, verify:

- [ ] Test results clearly summarized
- [ ] Started with something positive
- [ ] All failing tests explained (without revealing hidden test details)
- [ ] Specific line numbers cited for issues
- [ ] Explanations include WHY, not just WHAT
- [ ] Suggestions are actionable
- [ ] Complexity analysis provided
- [ ] Next steps are clear
- [ ] Tone is supportive and constructive
- [ ] No full solutions given (unless explicitly requested)
- [ ] Metadata updated

Remember: A great review helps users learn, builds confidence, and motivates continued practice. It's not about showing how much you know - it's about helping them grow.
