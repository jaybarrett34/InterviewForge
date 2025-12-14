# LeetCode-Style Example Problems

## Overview

This document provides representative examples of common problem patterns. These illustrate the types of problems you'll encounter and the thinking process needed to solve them.

**Note:** These are patterns to learn, not specific problems to memorize. Real interviews will have novel problems that require applying these patterns in new ways.

---

## Pattern 1: Two Pointers (Arrays)

### Pattern Description

**Common in:** 20% of array problems
**Difficulty:** Easy to Medium
**Key concepts tested:**
- Array traversal optimization
- In-place manipulation
- Pointer coordination

**Why they ask it:**
Tests your ability to optimize from O(n²) to O(n) using clever traversal techniques.

### Example Problem: Container With Most Water

**Description:**
You are given an array of positive integers `height` where `height[i]` represents the height of a vertical line at position `i`. Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water the container can store.

Note: You cannot tilt the container. The width between lines at positions `i` and `j` is `|i - j|`, and the height of the container is `min(height[i], height[j])`.

**Example 1:**
```
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
Explanation: Lines at indices 1 (height=8) and 8 (height=7) form a container.
Width = 8 - 1 = 7, Height = min(8, 7) = 7, Area = 7 * 7 = 49
```

**Example 2:**
```
Input: height = [1, 1]
Output: 1
Explanation: Only two lines available, area = 1 * 1 = 1
```

**Constraints:**
- 2 <= height.length <= 10^5
- 0 <= height[i] <= 10^4

**Expected Approach:**
- Two pointers starting at opposite ends
- Move the pointer with smaller height inward
- Track maximum area seen
- Time Complexity: O(n)
- Space Complexity: O(1)

**Key Insights:**
- Brute force (try all pairs) is O(n²), too slow
- Moving the shorter line inward is always the right choice (moving taller can't improve)
- Greedy approach works here

**Variations You Might See:**
- Trapping rain water (similar but different calculation)
- Maximum rectangle in histogram
- Stock buy/sell with cooldown

---

## Pattern 2: Sliding Window (Strings)

### Pattern Description

**Common in:** 15% of string/array problems
**Difficulty:** Medium
**Key concepts tested:**
- Dynamic window size management
- Hash map for character tracking
- Optimization of brute force

**Why they ask it:**
Tests ability to maintain state efficiently while processing subarrays/substrings.

### Example Problem: Longest Substring Without Repeating Characters

**Description:**
Given a string `s`, find the length of the longest substring without repeating characters. A substring is a contiguous sequence of characters within the string.

**Example 1:**
```
Input: s = "abcabcbb"
Output: 3
Explanation: The longest substring is "abc" with length 3.
```

**Example 2:**
```
Input: s = "bbbbb"
Output: 1
Explanation: The longest substring is "b" with length 1.
```

**Example 3:**
```
Input: s = "pwwkew"
Output: 3
Explanation: The longest substring is "wke" with length 3.
Note that "pwke" is a subsequence, not a substring.
```

**Constraints:**
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols, and spaces

**Expected Approach:**
- Sliding window with hash set/map
- Expand window while no duplicates
- Contract window when duplicate found
- Time Complexity: O(n)
- Space Complexity: O(min(m, n)) where m is charset size

**Key Insights:**
- Hash set tracks characters in current window
- When duplicate found, remove from left until duplicate gone
- Keep track of maximum window size seen

**Variations You Might See:**
- Longest substring with at most K distinct characters
- Minimum window substring
- Substring with concatenation of all words

---

## Pattern 3: Hash Map Lookup Optimization

### Pattern Description

**Common in:** 25% of array problems
**Difficulty:** Easy to Medium
**Key concepts tested:**
- Space-time tradeoff
- Hash map design
- Complement finding

**Why they ask it:**
Classic pattern for optimizing from O(n²) to O(n) using extra space.

### Example Problem: Two Sum with Unique Pairs

**Description:**
Given an array of integers `nums` and an integer `target`, return the indices of two numbers that add up to `target`. You may assume each input has exactly one solution, and you cannot use the same element twice. Return the answer in any order.

**Example 1:**
```
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
```

**Example 2:**
```
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
Explanation: nums[1] + nums[2] = 2 + 4 = 6
```

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Exactly one solution exists

**Expected Approach:**
- Hash map storing {value: index}
- For each number, check if (target - number) exists in map
- If yes, return indices; if no, add current number to map
- Time Complexity: O(n)
- Space Complexity: O(n)

**Key Insights:**
- Trading O(n) space to avoid O(n²) nested loop
- One pass is sufficient
- Order matters for the indices

**Variations You Might See:**
- Three sum
- Four sum
- Two sum in BST
- Two sum with sorted array (can use two pointers instead)

---

## Pattern 4: Tree DFS (Recursion)

### Pattern Description

**Common in:** 30% of tree problems
**Difficulty:** Easy to Medium
**Key concepts tested:**
- Recursion
- Tree traversal
- Base cases
- Combining results from subtrees

**Why they ask it:**
Tests recursive thinking and tree manipulation fundamentals.

### Example Problem: Path Sum Exists

**Description:**
Given the root of a binary tree and an integer `targetSum`, return `true` if the tree has a root-to-leaf path such that adding up all the values along the path equals `targetSum`. A leaf is a node with no children.

**Example 1:**
```
Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
Output: true
Explanation: The path 5 -> 4 -> 11 -> 2 sums to 22
```

**Example 2:**
```
Input: root = [1,2,3], targetSum = 5
Output: false
Explanation: No root-to-leaf path sums to 5
```

**Example 3:**
```
Input: root = [], targetSum = 0
Output: false
Explanation: Empty tree has no paths
```

**Constraints:**
- Number of nodes: 0 to 5000
- -1000 <= Node.val <= 1000
- -1000 <= targetSum <= 1000

**Expected Approach:**
- Recursive DFS
- At each node, check if it's a leaf and remaining sum equals node value
- Otherwise, recursively check left and right subtrees with updated sum
- Time Complexity: O(n)
- Space Complexity: O(h) where h is tree height

**Key Insights:**
- Base case: null node returns false
- Leaf node: check if value equals remaining target
- Internal node: try both children (OR logic)
- Pass remaining sum down the recursion

**Variations You Might See:**
- Path sum II (return all paths)
- Path sum III (paths can start anywhere)
- Maximum path sum
- Binary tree paths

---

## Pattern 5: Graph BFS (Shortest Path)

### Pattern Description

**Common in:** 20% of graph problems
**Difficulty:** Medium
**Key concepts tested:**
- BFS traversal
- Queue usage
- Level tracking
- Visited set

**Why they ask it:**
BFS is fundamental for shortest path in unweighted graphs.

### Example Problem: Word Ladder Length

**Description:**
Given two words `beginWord` and `endWord`, and a dictionary `wordList`, find the length of the shortest transformation sequence from `beginWord` to `endWord` following these rules:

1. Only one letter can be changed at a time
2. Each transformed word must exist in `wordList`

Return 0 if no such sequence exists.

**Example 1:**
```
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
Explanation: "hit" -> "hot" -> "dot" -> "dog" -> "cog" (5 words)
```

**Example 2:**
```
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]
Output: 0
Explanation: "cog" is not in wordList, no transformation possible
```

**Constraints:**
- 1 <= beginWord.length <= 10
- endWord.length == beginWord.length
- 1 <= wordList.length <= 5000
- All words have the same length
- All words contain only lowercase letters

**Expected Approach:**
- BFS with queue starting from beginWord
- For each word, try changing each character
- Check if transformed word is in wordList
- Track visited words to avoid cycles
- Return level when endWord is found
- Time Complexity: O(n * m * 26) where n is wordList size, m is word length
- Space Complexity: O(n)

**Key Insights:**
- BFS guarantees shortest path
- Need visited set to avoid cycles
- Can optimize with bidirectional BFS
- Pattern matching with wildcards speeds up neighbor finding

**Variations You Might See:**
- Word ladder II (return all shortest paths)
- Minimum genetic mutation
- Open the lock
- Sliding puzzle

---

## Pattern 6: Dynamic Programming (1D)

### Pattern Description

**Common in:** 15% of DP problems
**Difficulty:** Medium
**Key concepts tested:**
- Overlapping subproblems
- Optimal substructure
- State definition
- Recurrence relation

**Why they ask it:**
DP is a critical skill for optimization problems.

### Example Problem: House Robber

**Description:**
You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have connected security systems that will alert police if two adjacent houses are broken into on the same night.

Given an integer array `nums` representing the amount of money in each house, return the maximum amount you can rob without alerting the police.

**Example 1:**
```
Input: nums = [1, 2, 3, 1]
Output: 4
Explanation: Rob house 1 (money = 1) and house 3 (money = 3), total = 4
```

**Example 2:**
```
Input: nums = [2, 7, 9, 3, 1]
Output: 12
Explanation: Rob house 1 (2), house 3 (9), and house 5 (1), total = 12
```

**Constraints:**
- 1 <= nums.length <= 100
- 0 <= nums[i] <= 400

**Expected Approach:**
- DP array where dp[i] = max money from houses 0 to i
- Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
- Either skip current house or rob it (can't rob previous)
- Time Complexity: O(n)
- Space Complexity: O(1) with optimization (only need last 2 values)

**Key Insights:**
- At each house, you have two choices: rob it or skip it
- If rob current, can't rob previous
- If skip current, take best up to previous
- Can optimize space to O(1) by only tracking last two results

**Variations You Might See:**
- House robber II (houses in a circle)
- House robber III (binary tree)
- Delete and earn
- Maximum sum with no adjacents

---

## Pattern 7: Backtracking (Combinatorial)

### Pattern Description

**Common in:** 10% of problems
**Difficulty:** Medium to Hard
**Key concepts tested:**
- Recursive exploration
- State management
- Pruning
- Choice/explore/unchoose pattern

**Why they ask it:**
Tests ability to explore solution space systematically.

### Example Problem: Generate All Subsets

**Description:**
Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.

**Example 1:**
```
Input: nums = [1, 2, 3]
Output: [[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]]
```

**Example 2:**
```
Input: nums = [0]
Output: [[], [0]]
```

**Constraints:**
- 1 <= nums.length <= 10
- -10 <= nums[i] <= 10
- All numbers are unique

**Expected Approach:**
- Backtracking to build subsets incrementally
- For each element, choose to include it or not
- Build all 2^n subsets
- Time Complexity: O(2^n * n)
- Space Complexity: O(2^n * n) for output

**Key Insights:**
- Each element has binary choice: include or exclude
- Can build iteratively or recursively
- Maintain a current subset and grow it
- Backtrack by removing last added element

**Variations You Might See:**
- Subsets II (with duplicates)
- Combinations
- Permutations
- Combination sum

---

## Common Problem Categories by Difficulty

### Easy Problems (15-20 min solve time)

**Characteristics:**
- Single concept
- Straightforward implementation
- Few edge cases
- Clear optimal approach

**Example Categories:**
1. **Array Manipulation**: Reverse array, rotate, remove duplicates
2. **String Operations**: Palindrome check, string reversal, anagram detection
3. **Simple Math**: Factorial, Fibonacci, prime checking
4. **Basic Trees**: Tree traversal, height, node counting
5. **Hash Map Usage**: Two sum, frequency counting, contains duplicate

### Medium Problems (30-40 min solve time)

**Characteristics:**
- Multiple concepts combined
- Requires algorithmic insight
- Several edge cases
- Optimization thinking needed

**Example Categories:**
1. **Advanced Arrays**: Subarray problems, two pointers, sliding window
2. **Tree Problems**: Path finding, level order, construction
3. **Graph BFS/DFS**: Shortest path, connected components
4. **1D DP**: Subsequence, optimization with linear state
5. **Design**: LRU cache, implement data structures

### Hard Problems (45-60 min solve time)

**Characteristics:**
- Complex algorithms
- Multiple solution approaches
- Many edge cases
- Optimization crucial

**Example Categories:**
1. **Advanced DP**: 2D DP, state machine, optimization
2. **Complex Graphs**: Union-find, topological sort, minimum spanning tree
3. **String Algorithms**: KMP, trie-based solutions
4. **Advanced Trees**: Segment trees, tree DP
5. **Math/Geometry**: Complex formulas, coordinate geometry

---

## Practice Recommendations

### Week 1-2: Foundation
- **Focus:** Easy problems across all categories
- **Goal:** Pattern recognition
- **Problems:** 30-40 easy

**Recommended:**
- Arrays: 10 problems
- Strings: 8 problems
- Hash Maps: 5 problems
- Easy Trees: 5 problems
- Easy Linked Lists: 5 problems

### Week 3-4: Core Skills
- **Focus:** Medium problems in common categories
- **Goal:** Problem-solving fluency
- **Problems:** 40-50 medium

**Recommended:**
- Two Pointers: 8 problems
- Sliding Window: 6 problems
- Tree DFS/BFS: 10 problems
- Graph BFS/DFS: 8 problems
- Basic DP: 8 problems

### Week 5-6: Advanced
- **Focus:** Hard problems and gaps
- **Goal:** Mastery
- **Problems:** 30-40 mixed

**Recommended:**
- Advanced DP: 10 problems
- Complex Graphs: 8 problems
- Backtracking: 6 problems
- Hard arrays: 6 problems

---

## Tips for Learning Patterns

1. **Group by pattern, not by problem**: Study all two-pointer problems together
2. **Understand why, not just how**: Know why a pattern works
3. **Practice variations**: Don't just solve one subset problem
4. **Time yourself**: Build speed progressively
5. **Review solutions**: Learn multiple approaches
6. **Explain aloud**: Practice communication while solving
7. **Track progress**: Note which patterns you struggle with

---

*These examples represent common patterns. Real interviews will require applying these patterns to novel problems.*
