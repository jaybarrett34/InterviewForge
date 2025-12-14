/**
 * Parse problem.md file into structured format for ProblemPane
 *
 * Expected markdown format:
 * # Problem Title
 * **Difficulty:** Easy|Medium|Hard
 * **Category:** Category Name
 * **Company:** Company Name
 *
 * ## Description
 * Problem description text...
 *
 * ## Examples
 * ### Example 1
 * **Input:** input_value
 * **Output:** output_value
 * **Explanation:** explanation text
 *
 * ## Constraints
 * - constraint 1
 * - constraint 2
 *
 * ## Hints
 * <details>
 * <summary>Hint 1</summary>
 * hint text
 * </details>
 */

export function parseProblemMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return null;
  }

  const lines = markdown.split('\n');
  const problem = {
    title: '',
    difficulty: 'Medium',
    category: '',
    company: '',
    description: '',
    examples: [],
    constraints: [],
    hints: [],
    followUp: []
  };

  let currentSection = null;
  let currentExample = null;
  let currentHint = null;
  let inHintDetails = false;
  let descriptionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Parse title (# Problem Title)
    if (trimmedLine.startsWith('# ') && !problem.title) {
      problem.title = trimmedLine.substring(2).trim();
      continue;
    }

    // Parse metadata
    if (trimmedLine.startsWith('**Difficulty:**')) {
      problem.difficulty = trimmedLine.replace('**Difficulty:**', '').trim();
      continue;
    }
    if (trimmedLine.startsWith('**Category:**')) {
      problem.category = trimmedLine.replace('**Category:**', '').trim();
      continue;
    }
    if (trimmedLine.startsWith('**Company:**')) {
      problem.company = trimmedLine.replace('**Company:**', '').trim();
      continue;
    }

    // Parse sections
    if (trimmedLine.startsWith('## ')) {
      // Save current example if we were in examples section
      if (currentExample && currentSection === 'examples') {
        problem.examples.push(currentExample);
        currentExample = null;
      }

      // Save description if we were collecting it
      if (currentSection === 'description') {
        problem.description = descriptionLines.join('\n').trim();
        descriptionLines = [];
      }

      const sectionName = trimmedLine.substring(3).trim().toLowerCase();
      if (sectionName === 'description') {
        currentSection = 'description';
      } else if (sectionName === 'examples') {
        currentSection = 'examples';
      } else if (sectionName === 'constraints') {
        currentSection = 'constraints';
      } else if (sectionName === 'hints') {
        currentSection = 'hints';
      } else if (sectionName === 'notes' || sectionName === 'follow-up questions') {
        currentSection = 'followUp';
      } else {
        currentSection = null;
      }
      continue;
    }

    // Parse example headers (### Example 1)
    if (currentSection === 'examples' && trimmedLine.startsWith('### ')) {
      if (currentExample) {
        problem.examples.push(currentExample);
      }
      currentExample = { input: '', output: '', explanation: '' };
      continue;
    }

    // Parse example content
    if (currentSection === 'examples' && currentExample) {
      if (trimmedLine.startsWith('**Input:**')) {
        currentExample.input = trimmedLine.replace('**Input:**', '').trim();
      } else if (trimmedLine.startsWith('**Output:**')) {
        currentExample.output = trimmedLine.replace('**Output:**', '').trim();
      } else if (trimmedLine.startsWith('**Explanation:**')) {
        currentExample.explanation = trimmedLine.replace('**Explanation:**', '').trim();
      }
      continue;
    }

    // Parse description
    if (currentSection === 'description') {
      descriptionLines.push(line);
      continue;
    }

    // Parse constraints
    if (currentSection === 'constraints') {
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        problem.constraints.push(trimmedLine.substring(1).trim());
      }
      continue;
    }

    // Parse hints (using <details> tags)
    if (currentSection === 'hints') {
      if (trimmedLine === '<details>') {
        inHintDetails = true;
        currentHint = '';
        continue;
      }
      if (trimmedLine === '</details>') {
        if (currentHint !== null && currentHint.trim()) {
          problem.hints.push(currentHint.trim());
        }
        inHintDetails = false;
        currentHint = null;
        continue;
      }
      if (trimmedLine.startsWith('<summary>')) {
        // Skip the summary line (e.g., <summary>Hint 1</summary>)
        continue;
      }
      if (inHintDetails && currentHint !== null) {
        currentHint += (currentHint ? '\n' : '') + line;
      }
      continue;
    }

    // Parse follow-up
    if (currentSection === 'followUp') {
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        problem.followUp.push(trimmedLine.substring(1).trim());
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        problem.followUp.push(trimmedLine);
      }
      continue;
    }
  }

  // Don't forget to save the last example
  if (currentExample) {
    problem.examples.push(currentExample);
  }

  // Save description if we ended while collecting it
  if (currentSection === 'description' && descriptionLines.length > 0) {
    problem.description = descriptionLines.join('\n').trim();
  }

  return problem.title ? problem : null;
}

export default parseProblemMarkdown;
