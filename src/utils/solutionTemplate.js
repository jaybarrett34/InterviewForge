/**
 * Solution Template Factory
 * Generates standardized Python solution templates for interview problems
 *
 * IMPORTANT: Test cases are kept SEPARATE from the solution file.
 * - solution.py: Only contains the Solution class (what user edits)
 * - __tests__/test_solution.py: Contains pytest tests (hidden from user, visible to Claude)
 */

/**
 * Default solution template - NO TEST CASES VISIBLE
 * User only sees the class they need to implement
 */
export const DEFAULT_TEMPLATE = `"""
InterviewForge - Solution Template
==================================

To get started:
1. Go to the Claude Code terminal (bottom right)
2. Type: claude
3. Ask Claude to generate a problem: "/new" or "/new <category>"

Categories: string_parsing, array_manipulation, hash_map,
           tree_traversal, dynamic_programming, graph, linked_list
"""

from typing import List, Optional, Dict, Any, Tuple


class Solution:
    """
    Implement your solution in the method below.

    The method signature will be provided when you generate a problem.
    """

    def solve(self, input_data: Any) -> Any:
        """
        TODO: Implement your solution here

        Args:
            input_data: The problem input

        Returns:
            The expected output

        Example:
            >>> s = Solution()
            >>> s.solve([2, 7, 11, 15], 9)
            [0, 1]
        """
        # Your implementation goes here
        pass
`;

/**
 * Generate a clean solution template for a specific problem
 * NO TEST CASES - just the class and method to implement
 *
 * @param {Object} problem - Problem configuration
 * @returns {string} - Python solution template (user-visible)
 */
export function generateSolutionTemplate(problem) {
  const {
    title = "Untitled Problem",
    description = "No description provided",
    difficulty = "Medium",
    category = "general",
    functionName = "solve",
    functionParams = [{ name: "input_data", type: "Any", description: "The input" }],
    returnType = "Any",
    returnDescription = "The expected output",
    examples = [],
    constraints = [],
    hints = []
  } = problem;

  // Generate parameter string for function signature
  const paramsStr = functionParams
    .map(p => `${p.name}: ${p.type}`)
    .join(", ");

  // Generate docstring params
  const docParams = functionParams
    .map(p => `            ${p.name}: ${p.description || p.type}`)
    .join("\n");

  // Generate example in docstring (only first example, no expected output shown)
  const exampleStr = examples.length > 0
    ? `
        Example:
            >>> s = Solution()
            >>> s.${functionName}(${JSON.stringify(examples[0].input)})
            # Returns the expected output`
    : '';

  return `"""
${title}
${"=".repeat(title.length)}

Difficulty: ${difficulty}
Category: ${category}

${description}
${constraints.length > 0 ? `
Constraints:
${constraints.map(c => `  - ${c}`).join("\n")}
` : ''}
${hints.length > 0 ? `
Hints (use sparingly!):
${hints.map((h, i) => `  ${i + 1}. ${h}`).join("\n")}
` : ''}
"""

from typing import List, Optional, Dict, Any, Tuple


class Solution:
    """
    Implement your solution for: ${title}
    """

    def ${functionName}(self, ${paramsStr}) -> ${returnType}:
        """
        TODO: Implement your solution here

        Args:
${docParams}

        Returns:
            ${returnDescription}
        ${exampleStr}
        """
        # TODO: Your implementation goes here
        raise NotImplementedError("Implement your solution!")
`;
}

/**
 * Generate the TEST file (separate from solution)
 * This goes in __tests__/test_solution.py
 * Claude can see this, user cannot easily access it
 *
 * @param {Object} problem - Problem configuration
 * @returns {string} - Pytest test file content
 */
export function generateTestFile(problem) {
  const {
    title = "Untitled Problem",
    functionName = "solve",
    examples = [],
    hiddenTests = []
  } = problem;

  // Combine visible examples and hidden tests
  const allTests = [
    ...examples.map((ex, i) => ({
      name: `test_example_${i + 1}`,
      input: ex.input,
      expected: ex.output,
      visible: true
    })),
    ...hiddenTests.map((test, i) => ({
      name: test.name || `test_hidden_${i + 1}`,
      input: test.input,
      expected: test.expected,
      visible: false
    }))
  ];

  const testMethods = allTests.map(test => `
    def ${test.name}(self):
        """${test.visible ? 'Visible test case' : 'Hidden test case'}"""
        solution = Solution()
        result = solution.${functionName}(${JSON.stringify(test.input)})
        assert result == ${JSON.stringify(test.expected)}, \\
            f"Expected ${JSON.stringify(test.expected)}, got {result}"
`).join("\n");

  return `"""
Auto-generated test file for: ${title}
DO NOT SHARE WITH USER - These are the hidden test cases

Run with: pytest __tests__/test_solution.py -v
"""

import pytest
import sys
sys.path.insert(0, '..')

from solution import Solution


class TestSolution:
    """Test cases for ${title}"""
${testMethods}


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
`;
}

/**
 * Example problem configurations
 */
export const EXAMPLE_PROBLEMS = {
  two_sum: {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    difficulty: "Easy",
    category: "hash_map",
    functionName: "twoSum",
    functionParams: [
      { name: "nums", type: "List[int]", description: "Array of integers" },
      { name: "target", type: "int", description: "Target sum" }
    ],
    returnType: "List[int]",
    returnDescription: "Indices of the two numbers that add up to target",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ],
    examples: [
      { input: [[2, 7, 11, 15], 9], output: [0, 1] },
      { input: [[3, 2, 4], 6], output: [1, 2] }
    ],
    hiddenTests: [
      { name: "test_negative_numbers", input: [[-1, -2, -3, -4], -6], expected: [1, 3] },
      { name: "test_large_array", input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 19], expected: [8, 9] },
      { name: "test_same_number", input: [[3, 3], 6], expected: [0, 1] }
    ],
    hints: [
      "Consider using a hash map to store numbers you've seen",
      "For each number, check if (target - number) exists in your map"
    ]
  },

  valid_parentheses: {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: "Easy",
    category: "string_parsing",
    functionName: "isValid",
    functionParams: [
      { name: "s", type: "str", description: "String containing brackets" }
    ],
    returnType: "bool",
    returnDescription: "True if the string has valid parentheses",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ],
    examples: [
      { input: "()", output: true },
      { input: "()[]{}", output: true },
      { input: "(]", output: false }
    ],
    hiddenTests: [
      { name: "test_empty", input: "", expected: true },
      { name: "test_nested", input: "([{}])", expected: true },
      { name: "test_unmatched", input: "((", expected: false },
      { name: "test_wrong_order", input: "([)]", expected: false }
    ],
    hints: [
      "Use a stack to keep track of opening brackets",
      "When you see a closing bracket, check if it matches the top of the stack"
    ]
  }
};
