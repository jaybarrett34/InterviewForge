# Test Suite Generation Guidelines

## Overview

When generating a new problem, you must create a comprehensive test suite in test_solution.py that thoroughly validates solutions while maintaining the mystery of hidden test cases.

## Critical Security Rule

**NEVER reveal the contents of test_solution.py to the user** unless they have completed the `/submit` command and you're showing them what test cases they missed. Even then, be selective about what you show.

## Test Suite Structure

Create test_solution.py with this structure:

```python
"""
Test suite for [Problem Title]

This file contains both visible and hidden test cases.
Visible tests match the examples in problem.md.
Hidden tests cover edge cases, boundary conditions, and complex scenarios.
"""

import pytest
from solution import [function_name]  # Import the function to test


class TestVisible:
    """
    Visible test cases that match the examples in problem.md.
    Users can see these tests and their expected behavior.
    """

    def test_example_1(self):
        """Test Example 1 from problem.md"""
        # Input from example 1
        result = [function_name]([params])
        expected = [expected_output]
        assert result == expected, f"Expected {expected}, but got {result}"

    def test_example_2(self):
        """Test Example 2 from problem.md"""
        # Input from example 2
        result = [function_name]([params])
        expected = [expected_output]
        assert result == expected, f"Expected {expected}, but got {result}"

    def test_example_3(self):
        """Test Example 3 from problem.md (if exists)"""
        # Input from example 3
        result = [function_name]([params])
        expected = [expected_output]
        assert result == expected, f"Expected {expected}, but got {result}"


class TestHidden:
    """
    Hidden test cases that users should not see until after submission.
    These test edge cases, boundary conditions, and complex scenarios.
    """

    def test_edge_case_empty(self):
        """Test with empty input"""
        # Implementation hidden from user
        pass

    def test_edge_case_single_element(self):
        """Test with single element"""
        # Implementation hidden from user
        pass

    def test_boundary_minimum(self):
        """Test at minimum constraint boundary"""
        # Implementation hidden from user
        pass

    def test_boundary_maximum(self):
        """Test at maximum constraint boundary"""
        # Implementation hidden from user
        pass

    def test_all_same_values(self):
        """Test with all identical values"""
        # Implementation hidden from user
        pass

    def test_already_sorted(self):
        """Test with already sorted input (if applicable)"""
        # Implementation hidden from user
        pass

    def test_reverse_sorted(self):
        """Test with reverse sorted input (if applicable)"""
        # Implementation hidden from user
        pass

    def test_complex_scenario_1(self):
        """Test complex scenario with multiple edge conditions"""
        # Implementation hidden from user
        pass

    def test_complex_scenario_2(self):
        """Test another complex scenario"""
        # Implementation hidden from user
        pass

    def test_performance(self):
        """Test with large input to verify performance"""
        # Implementation hidden from user
        pass


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
```

## Test Case Categories

### Visible Tests (2-3 tests)

These must **exactly match** the examples in problem.md:

1. **Example 1**: Basic happy path
2. **Example 2**: Different valid scenario
3. **Example 3** (optional): Edge case shown in examples

**Purpose:**
- Let users verify basic functionality
- Provide immediate feedback during development
- Build confidence that their approach works

**Guidelines:**
- Use the exact inputs/outputs from problem.md
- Include helpful assertion messages
- Add comments explaining what's being tested
- Keep them simple and clear

### Hidden Tests (8-12 tests)

These cover everything else. Users should NOT see these implementations.

#### 1. Edge Cases (3-4 tests)

**Empty Input:**
```python
def test_edge_case_empty(self):
    """Test with empty input"""
    result = function_name([])
    assert result == expected_empty_result
```

**Single Element:**
```python
def test_edge_case_single_element(self):
    """Test with single element"""
    result = function_name([single_value])
    assert result == expected_single_result
```

**Null/None Cases (if applicable):**
```python
def test_edge_case_null(self):
    """Test with null/None input"""
    result = function_name(None)
    assert result == expected_null_result
```

**Duplicate Values (if relevant):**
```python
def test_edge_case_all_duplicates(self):
    """Test with all identical values"""
    result = function_name([5, 5, 5, 5, 5])
    assert result == expected_duplicate_result
```

#### 2. Boundary Conditions (2-3 tests)

Test at the limits specified in constraints:

**Minimum Size:**
```python
def test_boundary_minimum_size(self):
    """Test at minimum constraint (e.g., length = 1)"""
    result = function_name([min_case])
    assert result == expected_min_result
```

**Maximum Size:**
```python
def test_boundary_maximum_size(self):
    """Test at maximum constraint (e.g., length = 10^4)"""
    large_input = generate_large_input(10000)  # Helper function
    result = function_name(large_input)
    assert result == expected_max_result
```

**Minimum Values:**
```python
def test_boundary_minimum_value(self):
    """Test with minimum allowed values (e.g., -10^9)"""
    result = function_name([-1000000000])
    assert result == expected
```

**Maximum Values:**
```python
def test_boundary_maximum_value(self):
    """Test with maximum allowed values (e.g., 10^9)"""
    result = function_name([1000000000])
    assert result == expected
```

#### 3. Complex Scenarios (3-4 tests)

**Multiple Edge Conditions Combined:**
```python
def test_complex_mixed_edges(self):
    """Test combining multiple edge conditions"""
    # e.g., large array with duplicates and extreme values
    result = function_name([complex_input])
    assert result == expected
```

**Algorithmic Edge Cases:**
```python
def test_complex_algorithmic_edge(self):
    """Test scenario that challenges the algorithm"""
    # e.g., worst case for sorting, requires backtracking, etc.
    result = function_name([challenging_input])
    assert result == expected
```

**Specific Problem Edge Cases:**

For array problems:
- Already sorted
- Reverse sorted
- All same values
- Alternating patterns

For graph problems:
- Disconnected graphs
- Cycles
- Single node
- Complete graphs

For string problems:
- All same character
- Palindromes
- Special characters
- Maximum length

For tree problems:
- Skewed trees
- Balanced trees
- Single node
- Deep trees

#### 4. Performance Tests (1-2 tests)

```python
def test_performance_large_input(self):
    """Verify solution handles large inputs efficiently"""
    import time
    large_input = generate_large_input(10000)

    start = time.time()
    result = function_name(large_input)
    duration = time.time() - start

    # Should complete in reasonable time (e.g., < 1 second for n=10000)
    assert duration < 1.0, f"Solution too slow: {duration:.2f}s"
    assert result == expected_large_result
```

## Test Implementation Best Practices

### 1. Clear Test Names

Use descriptive names that explain what's being tested:

**Good:**
```python
def test_empty_array_returns_zero(self):
def test_single_element_returns_element(self):
def test_all_negative_numbers(self):
```

**Bad:**
```python
def test_1(self):
def test_case(self):
def test_it_works(self):
```

### 2. Helpful Assertion Messages

Always include messages that help debug failures:

**Good:**
```python
assert result == expected, f"Expected {expected}, but got {result}"
assert len(result) == 3, f"Expected 3 elements, got {len(result)}"
assert result > 0, f"Result must be positive, got {result}"
```

**Bad:**
```python
assert result == expected
assert len(result) == 3
```

### 3. Use Pytest Features

**Parametrize for Similar Tests:**
```python
@pytest.mark.parametrize("input_val,expected", [
    ([1, 2, 3], 6),
    ([0, 0, 0], 0),
    ([-1, -2, -3], -6),
])
def test_sum_variations(input_val, expected):
    assert sum_array(input_val) == expected
```

**Test Exceptions:**
```python
def test_invalid_input_raises_error(self):
    with pytest.raises(ValueError):
        function_name(invalid_input)
```

**Approximate Comparisons (for floats):**
```python
def test_floating_point_result(self):
    result = calculate_average([1, 2, 3])
    assert result == pytest.approx(2.0, rel=1e-5)
```

### 4. Generate Test Data

For large inputs, create helper functions:

```python
def generate_sorted_array(size):
    """Generate sorted array of given size"""
    return list(range(size))

def generate_random_array(size, min_val=-1000, max_val=1000):
    """Generate random array within constraints"""
    import random
    return [random.randint(min_val, max_val) for _ in range(size)]

def generate_worst_case(size):
    """Generate worst-case input for the algorithm"""
    # Problem-specific worst case
    return [size - i for i in range(size)]  # Reverse sorted
```

### 5. Test Both Correctness and Efficiency

```python
def test_correctness_and_performance(self):
    """Test that solution is both correct and efficient"""
    import time

    # Large input
    n = 10000
    large_input = generate_large_input(n)

    # Measure time
    start = time.time()
    result = function_name(large_input)
    duration = time.time() - start

    # Verify correctness
    assert verify_result(result, large_input), "Result is incorrect"

    # Verify efficiency (adjust based on expected complexity)
    # O(n): should be < 0.1s, O(n log n): < 0.5s, O(n²): < 5s
    assert duration < 0.5, f"Too slow: {duration:.2f}s for n={n}"
```

## Difficulty-Based Test Distribution

### Easy Problems

- 2-3 visible tests (from examples)
- 6-8 hidden tests:
  - 2 edge cases (empty, single element)
  - 2 boundary cases (min/max from constraints)
  - 2-3 additional scenarios
  - 1 performance test (optional)

### Medium Problems

- 2-3 visible tests (from examples)
- 8-10 hidden tests:
  - 3 edge cases
  - 3 boundary cases
  - 3-4 complex scenarios
  - 1 performance test

### Hard Problems

- 2-3 visible tests (from examples)
- 10-12 hidden tests:
  - 4 edge cases
  - 3 boundary cases
  - 4-5 complex scenarios
  - 1-2 performance tests
  - Potentially multiple algorithmic approaches tested

## Test Output Formatting

When running tests, use pytest's verbose mode to show clear results:

```bash
pytest test_solution.py -v
```

Output should look like:
```
test_solution.py::TestVisible::test_example_1 PASSED
test_solution.py::TestVisible::test_example_2 PASSED
test_solution.py::TestVisible::test_example_3 PASSED
test_solution.py::TestHidden::test_edge_case_empty FAILED
test_solution.py::TestHidden::test_edge_case_single_element PASSED
...
```

## What to Tell Users About Tests

**Before Submission:**
- "Your solution will be tested against the examples shown in the problem, plus additional hidden test cases"
- "Hidden tests cover edge cases, boundary conditions, and complex scenarios"
- "Make sure to handle empty inputs, large inputs, and all constraints"

**After Submission (if tests fail):**
- Show which visible tests passed/failed
- For hidden tests, show: "Hidden test: test_edge_case_empty FAILED"
- Do NOT show the actual inputs/outputs of hidden tests
- Do provide hints: "Consider what happens with an empty input" or "Check boundary conditions"

**Never Say:**
- The exact inputs for hidden tests
- The expected outputs for hidden tests
- The total number of hidden tests
- The specific implementation of any hidden test

## Problem-Specific Test Examples

### Array Problem Example

```python
class TestHidden:
    def test_empty_array(self):
        assert find_max([]) is None

    def test_single_element(self):
        assert find_max([5]) == 5

    def test_all_negative(self):
        assert find_max([-5, -2, -10]) == -2

    def test_all_same(self):
        assert find_max([3, 3, 3, 3]) == 3

    def test_large_array(self):
        arr = list(range(10000))
        assert find_max(arr) == 9999
```

### String Problem Example

```python
class TestHidden:
    def test_empty_string(self):
        assert is_palindrome("") is True

    def test_single_char(self):
        assert is_palindrome("a") is True

    def test_all_same_char(self):
        assert is_palindrome("aaaa") is True

    def test_case_sensitivity(self):
        assert is_palindrome("Aa") is False  # If case-sensitive

    def test_special_chars(self):
        assert is_palindrome("a!b!a") is True
```

### Graph Problem Example

```python
class TestHidden:
    def test_single_node(self):
        graph = {0: []}
        assert has_path(graph, 0, 0) is True

    def test_disconnected(self):
        graph = {0: [1], 1: [0], 2: [3], 3: [2]}
        assert has_path(graph, 0, 2) is False

    def test_cycle(self):
        graph = {0: [1], 1: [2], 2: [0]}
        assert has_cycle(graph) is True
```

## Quality Checklist

Before finalizing test_solution.py:

- [ ] All visible tests match problem.md examples exactly
- [ ] 8-12 hidden tests created
- [ ] Edge cases covered (empty, single, null)
- [ ] Boundary conditions covered (min/max from constraints)
- [ ] Complex scenarios included
- [ ] Performance test for large inputs included
- [ ] All tests have clear names and docstrings
- [ ] All assertions have helpful error messages
- [ ] Tests are independent (no shared state)
- [ ] Tests can run in any order
- [ ] Helper functions are implemented if needed
- [ ] Imports are correct
- [ ] Tests actually pass with a correct solution

## Common Mistakes to Avoid

1. **Showing Hidden Tests**: Never reveal hidden test details to users
2. **Too Few Tests**: Always aim for 10-15 total tests (visible + hidden)
3. **Tests That Depend on Each Other**: Each test should be independent
4. **Vague Test Names**: Use descriptive names
5. **Missing Edge Cases**: Always test empty, single, minimum, maximum
6. **No Performance Tests**: Include at least one test with large input
7. **Incorrect Expected Values**: Double-check your expected outputs
8. **Copy-Paste Errors**: Each test should test something different
9. **Not Testing Constraints**: Verify solution handles all constraint boundaries
10. **Forgetting to Import**: Make sure all imports are present

Remember: The test suite is the ground truth for whether a solution is correct. Make it comprehensive, fair, and challenging.
