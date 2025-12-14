# LeetCode-Style Interview Patterns

## Overview

This is the default, generic interview preparation mode. It covers standard data structures and algorithms questions commonly asked across the tech industry. Use this when practicing general skills or when no specific company context is set.

**Focus:** Fundamental computer science concepts and problem-solving skills
**Difficulty Range:** Easy to Hard, balanced distribution
**Time Allocation:** 30-45 minutes per problem

## Common Problem Categories

### Primary Categories (High Frequency)

**Arrays & Strings** (25%)
- **Description:** Problems involving array/string manipulation, searching, and transformation
- **Difficulty Range:** Easy to Hard
- **Key Patterns:**
  - Two Pointers (opposite ends, same direction)
  - Sliding Window (fixed/variable size)
  - Prefix Sum / Running calculations
  - In-place modification
  - Hash map for tracking/lookup
- **Example Topics:**
  - Subarray sums
  - String manipulation
  - Array rotation
  - Duplicate detection
  - Subsequences and subarrays

**Trees & Binary Search Trees** (15%)
- **Description:** Binary tree traversal, manipulation, and properties
- **Difficulty Range:** Easy to Hard
- **Key Patterns:**
  - DFS (Preorder, Inorder, Postorder)
  - BFS (Level-order traversal)
  - Recursion vs Iteration
  - BST properties exploitation
  - Tree construction
- **Example Topics:**
  - Tree traversals
  - Path problems
  - Lowest common ancestor
  - Tree validation
  - Serialization/Deserialization

**Graphs** (12%)
- **Description:** Graph traversal, connectivity, and shortest paths
- **Difficulty Range:** Medium to Hard
- **Key Patterns:**
  - DFS (cycle detection, component finding)
  - BFS (shortest path, level exploration)
  - Union-Find (connectivity)
  - Topological Sort (dependencies)
  - Dijkstra's/Bellman-Ford (weighted graphs)
- **Example Topics:**
  - Connected components
  - Cycle detection
  - Shortest paths
  - Graph cloning
  - Course scheduling

**Dynamic Programming** (12%)
- **Description:** Optimization problems with overlapping subproblems
- **Difficulty Range:** Medium to Hard
- **Key Patterns:**
  - 1D DP (linear sequences)
  - 2D DP (two sequences, grids)
  - State Machine DP
  - Memoization vs Tabulation
  - Space optimization
- **Example Topics:**
  - Fibonacci variants
  - Longest common subsequence
  - Edit distance
  - Knapsack problems
  - Stock trading

**Hash Tables & Sets** (10%)
- **Description:** Fast lookup, counting, and grouping problems
- **Difficulty Range:** Easy to Medium
- **Key Patterns:**
  - Frequency counting
  - Group anagrams
  - Two-sum variants
  - Seen/visited tracking
  - Complement finding
- **Example Topics:**
  - Anagram problems
  - Duplicate finding
  - Pair/triplet sums
  - Frequency analysis
  - Custom key design

### Secondary Categories (Moderate Frequency)

**Linked Lists** (8%)
- **Description:** Linked list manipulation and traversal
- **Difficulty Range:** Easy to Medium
- **Key Patterns:**
  - Two pointers (fast & slow)
  - Dummy node technique
  - Reversal (iterative & recursive)
  - Cycle detection
  - Merge operations
- **Example Topics:**
  - List reversal
  - Cycle detection
  - Merge sorted lists
  - Remove nth node
  - Intersection finding

**Stacks & Queues** (6%)
- **Description:** LIFO/FIFO operations and monotonic structures
- **Difficulty Range:** Easy to Medium
- **Key Patterns:**
  - Monotonic stack/queue
  - Expression evaluation
  - Next greater/smaller element
  - Min/max stack
  - Queue with stacks
- **Example Topics:**
  - Valid parentheses
  - Next greater element
  - Min stack
  - Evaluate expressions
  - Sliding window maximum

**Binary Search** (5%)
- **Description:** Search in sorted spaces
- **Difficulty Range:** Easy to Hard
- **Key Patterns:**
  - Classic binary search
  - Search rotated array
  - Find boundaries
  - Search answer space
  - Template variations
- **Example Topics:**
  - Search in rotated array
  - Find peak element
  - First/last position
  - Square root
  - Capacity optimization

**Sorting & Searching** (4%)
- **Description:** Custom sorting and linear searching
- **Difficulty Range:** Easy to Medium
- **Key Patterns:**
  - Custom comparators
  - Quick select
  - Merge intervals
  - Bucket sort
  - Counting sort
- **Example Topics:**
  - Merge intervals
  - Top K elements
  - Custom sorting
  - Meeting rooms
  - Sort colors

**Recursion & Backtracking** (3%)
- **Description:** Exploring all possibilities, combinatorial problems
- **Difficulty Range:** Medium to Hard
- **Key Patterns:**
  - DFS with state
  - Pruning
  - Choice/explore/unchoose
  - Memoization for optimization
  - Base cases and constraints
- **Example Topics:**
  - Permutations
  - Combinations
  - Subsets
  - N-Queens
  - Word search

### Specialized Categories (Lower Frequency)

**Heaps / Priority Queues** (3%)
- **Description:** Maintaining ordered data with fast min/max access
- **Key Patterns:** Top K elements, merge K sorted, median finding
- **Difficulty:** Medium to Hard

**Tries (Prefix Trees)** (2%)
- **Description:** Efficient string prefix operations
- **Key Patterns:** Autocomplete, word search, prefix matching
- **Difficulty:** Medium

**Bit Manipulation** (2%)
- **Description:** Bitwise operations and properties
- **Key Patterns:** XOR tricks, counting bits, power of two
- **Difficulty:** Easy to Hard

**Math & Geometry** (2%)
- **Description:** Mathematical computations and geometric algorithms
- **Key Patterns:** GCD/LCM, prime numbers, coordinate geometry
- **Difficulty:** Easy to Hard

**Design** (1%)
- **Description:** Data structure and API design
- **Key Patterns:** LRU Cache, Min Stack, Iterator design
- **Difficulty:** Medium to Hard

## Difficulty Distribution

**Easy: 30%**
- Single concept or data structure
- Straightforward implementation
- 2-3 edge cases
- Solve time: 15-20 minutes
- Focus: Implementation and basic understanding

**Medium: 50%**
- Multiple concepts combined
- Algorithmic thinking required
- 4-6 edge cases
- Solve time: 30-40 minutes
- Focus: Problem-solving and optimization

**Hard: 20%**
- Complex algorithms
- Multiple approaches with tradeoffs
- 7+ edge cases
- Solve time: 45-60 minutes
- Focus: Advanced techniques and optimal solutions

## Problem-Solving Approach

### Step 1: Understand (5 minutes)
- Read problem carefully
- Identify inputs, outputs, constraints
- Ask clarifying questions
- Work through examples manually
- Identify edge cases

### Step 2: Plan (5-10 minutes)
- Identify pattern/category
- Consider multiple approaches
- Analyze time/space complexity
- Choose best approach
- Outline algorithm

### Step 3: Implement (15-25 minutes)
- Write clean, readable code
- Use meaningful variable names
- Handle edge cases
- Add comments for complex logic
- Follow language conventions

### Step 4: Test (5-10 minutes)
- Test with given examples
- Test edge cases
- Trace through code
- Look for bugs
- Verify complexity

### Step 5: Optimize (5 minutes)
- Identify inefficiencies
- Discuss time/space tradeoffs
- Implement optimization if time permits
- Explain why approach is optimal

## Common Patterns Deep Dive

### Two Pointers
**When to use:** Sorted arrays, palindromes, pair problems
**Variations:** Opposite ends, same direction, fast & slow
**Complexity:** Usually O(n) time, O(1) space

### Sliding Window
**When to use:** Contiguous subarrays/substrings, fixed/variable window
**Variations:** Fixed size, variable size, multiple pointers
**Complexity:** Usually O(n) time, O(1) or O(k) space

### Hash Map
**When to use:** Fast lookups, frequency counting, grouping
**Variations:** Value to index, frequency map, grouping by key
**Complexity:** O(n) time, O(n) space

### DFS/BFS
**When to use:** Trees/graphs, exploring all paths, shortest path
**Variations:** Recursive DFS, iterative DFS, BFS with queue
**Complexity:** O(V + E) time, O(V) space

### Dynamic Programming
**When to use:** Optimization, overlapping subproblems, optimal substructure
**Variations:** Top-down (memoization), bottom-up (tabulation)
**Complexity:** Varies, often O(n²) time, O(n) or O(n²) space

## Practice Strategy

### Phase 1: Build Foundation (Weeks 1-2)
**Focus:** Easy problems across all categories
**Goal:** Understand fundamental patterns
**Volume:** 30-40 problems
**Categories:** Arrays, Strings, Hash Tables, Easy Trees

### Phase 2: Strengthen Core (Weeks 3-4)
**Focus:** Medium problems in common categories
**Goal:** Develop problem-solving intuition
**Volume:** 40-50 problems
**Categories:** Arrays, Trees, Graphs, DP basics

### Phase 3: Advanced Techniques (Weeks 5-6)
**Focus:** Hard problems and specialized topics
**Goal:** Master complex algorithms
**Volume:** 30-40 problems
**Categories:** Hard DP, Advanced Graphs, Design

### Phase 4: Mock Interviews (Ongoing)
**Focus:** Timed practice, full interview simulation
**Goal:** Build speed and confidence
**Volume:** 2-3 per week
**Format:** 45 minutes, 1-2 problems

## Success Metrics

**Beginner (0-50 problems):**
- Solve 60%+ of Easy problems
- Recognize basic patterns
- Can implement with hints

**Intermediate (50-150 problems):**
- Solve 80%+ of Easy, 40%+ of Medium
- Identify patterns quickly
- Can optimize initial solutions

**Advanced (150+ problems):**
- Solve 90%+ of Easy, 60%+ of Medium, 30%+ of Hard
- Multiple approaches to problems
- Can handle novel problems

## Additional Resources

**Pattern Recognition:** Learn to identify which pattern applies
**Complexity Analysis:** Master Big-O notation and analysis
**Edge Cases:** Always consider empty, single, maximum size inputs
**Clean Code:** Practice writing interview-quality code
**Communication:** Explain your thinking process clearly

---

*This is the generic LeetCode-style practice mode. Switch to a specific company with `/switch {company}` for targeted preparation.*
