/**
 * Boolean Expression Parser
 *
 * This module handles parsing of Boolean expressions from string input.
 * It supports various notations and converts them to a standardized token format.
 */

export type Token = string;

/**
 * Mapping of various Boolean operator notations to standard symbols
 */
const DELIMITER_MAPPING: Record<string, string> = {
  // Logical AND variations
  '∧': '&',
  '^': '&',
  '&&': '&',
  'AND': '&',
  'and': '&',
  '*': '&',

  // Logical OR variations
  '∨': '|',
  'v': '|',
  '||': '|',
  'OR': '|',
  'or': '|',
  '+': '|',

  // Logical NOT variations
  '¬': '!',
  '~': '!',
  'NOT': '!',
  'not': '!',

  // Implication variations
  '→': '=>',
  '->': '=>',
  'IMP': '=>',
  'imp': '=>',
  'implies': '=>',

  // Biconditional variations
  '↔': '<=>',
  '<->': '<=>',
  'IFF': '<=>',
  'iff': '<=>',
  'equiv': '<=>',

  // Boolean constants
  'TRUE': 'true',
  'True': 'true',
  'T': 'true',
  't': 'true',
  '1': 'true',

  'FALSE': 'false',
  'False': 'false',
  'F': 'false',
  'f': 'false',
  '0': 'false',
};

/**
 * Standard delimiters recognized by the parser
 */
const STANDARD_DELIMITERS = ['!', '&', '|', '=>', '<=>', '(', ')', 'true', 'false', ','];

/**
 * Parse a Boolean expression string into tokens
 */
export function parseExpression(expression: string): Token[] {
  if (!expression || expression.trim() === '') {
    return [];
  }

  // Add spaces around the expression for easier pattern matching
  let processedExpr = ` ${expression.trim()} `;

  // Apply delimiter mapping to normalize the expression
  // Sort by length in descending order to handle longer patterns first (e.g., '<->' before '->')
  const sortedEntries = Object.entries(DELIMITER_MAPPING).sort(([a], [b]) => b.length - a.length);

  for (const [variant, standard] of sortedEntries) {
    // Handle Unicode symbols and multi-character symbols differently from word-based tokens
    if (variant.match(/[^\w\s]/)) {
      // For Unicode symbols and special characters (like ->, <->, <=>), use global replacement
      const regex = new RegExp(escapeRegExp(variant), 'g');
      processedExpr = processedExpr.replace(regex, ` ${standard} `);
    } else {
      // For word-based tokens, use word boundaries
      const regex = new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'gi');
      processedExpr = processedExpr.replace(regex, standard);
    }
  }

  // Handle special cases where constants might be adjacent to parentheses or operators
  processedExpr = processedExpr
    .replace(/\(T\s/g, '(true ')
    .replace(/\sT\)/g, ' true)')
    .replace(/!T\s/g, '!true ')
    .replace(/\(F\s/g, '(false ')
    .replace(/\sF\)/g, ' false)')
    .replace(/!F\s/g, '!false ')
    .replace(/\(t\s/g, '(true ')
    .replace(/\st\)/g, ' true)')
    .replace(/!t\s/g, '!true ')
    .replace(/\(f\s/g, '(false ')
    .replace(/\sf\)/g, ' false)')
    .replace(/!f\s/g, '!false ')
    .replace(/\(1\s/g, '(true ')
    .replace(/\s1\)/g, ' true)')
    .replace(/!1\s/g, '!true ')
    .replace(/\(0\s/g, '(false ')
    .replace(/\s0\)/g, ' false)')
    .replace(/!0\s/g, '!false ');

  // Create regex pattern for splitting
  const delimiterPattern = `(${STANDARD_DELIMITERS.map(escapeRegExp).join('|')})`;
  const regex = new RegExp(delimiterPattern, 'g');

  // Split and filter out empty strings
  const tokens = processedExpr
    .split(regex)
    .map((token) => token.trim())
    .filter((token) => token !== '');

  return tokens;
}

/**
 * Add parentheses to tokens to ensure correct operator precedence
 * Precedence order (highest to lowest): !, &, |, =>, <=>
 */
export function addParentheses(tokens: Token[]): Token[] {
  if (tokens.length === 0) {
    throw new Error('Expression cannot be empty');
  }

  // Create a copy to avoid modifying the original
  let processedTokens = [...tokens];

  // Validate parentheses balance
  validateParentheses(processedTokens);

  // Check if the entire expression is already fully parenthesized
  if (isFullyParenthesized(processedTokens)) {
    return processedTokens;
  }

  // Add parentheses around negations first
  processedTokens = addNegationParentheses(processedTokens);

  // Add parentheses for binary operators in precedence order
  const operators = ['&', '|', '=>', '<=>'];
  for (const operator of operators) {
    processedTokens = addOperatorParentheses(processedTokens, operator);
  }

  return processedTokens;
}

/**
 * Check if an expression is already fully parenthesized
 */
function isFullyParenthesized(tokens: Token[]): boolean {
  if (tokens.length < 3) return false;

  // Check if the expression starts with '(' and ends with ')'
  if (tokens[0] !== '(' || tokens[tokens.length - 1] !== ')') {
    return false;
  }

  // Check if the opening and closing parentheses match
  let depth = 0;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === '(') depth++;
    else if (tokens[i] === ')') depth--;

    // If depth becomes 0 before the end, it means the outer parentheses don't wrap the entire expression
    if (depth === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Validate that parentheses are balanced in the token array
 */
function validateParentheses(tokens: Token[]): void {
  let depth = 0;

  for (const token of tokens) {
    if (token === '(') {
      depth++;
    } else if (token === ')') {
      depth--;
      if (depth < 0) {
        throw new Error('Unbalanced parentheses: closing parenthesis without matching opening');
      }
    }
  }

  if (depth !== 0) {
    throw new Error('Unbalanced parentheses: missing closing parenthesis');
  }
}

/**
 * Add parentheses around negation operations
 */
function addNegationParentheses(tokens: Token[]): Token[] {
  const result: Token[] = [];
  let i = 0;

  while (i < tokens.length) {
    if (tokens[i] === '!') {
      result.push('(');
      result.push('!');

      if (tokens[i + 1] === '(') {
        // Handle negation of parenthesized expression
        result.push('(');
        i += 2;

        let depth = 1;
        while (i < tokens.length && depth > 0) {
          const token = tokens[i];
          result.push(token);

          if (token === '(') depth++;
          else if (token === ')') depth--;

          i++;
        }
      } else {
        // Handle negation of simple expression or consecutive negations
        if (i + 1 >= tokens.length) {
          throw new Error('Missing operand after negation');
        }

        // If next token is another negation, we need to handle it properly
        if (tokens[i + 1] === '!') {
          // Find the complete negation chain and the final operand
          let negationCount = 0;
          let j = i + 1;

          // Count consecutive negations
          while (j < tokens.length && tokens[j] === '!') {
            negationCount++;
            j++;
          }

          if (j >= tokens.length) {
            throw new Error('Missing operand after negation');
          }

          // Add the nested structure
          for (let k = 0; k < negationCount; k++) {
            result.push('(');
            result.push('!');
          }

          // Add the final operand
          result.push(tokens[j]);

          // Close all the parentheses
          for (let k = 0; k < negationCount; k++) {
            result.push(')');
          }

          // Skip all the processed tokens
          i = j + 1;
        } else {
          // Simple operand
          result.push(tokens[i + 1]);
          i += 2;
        }
      }

      result.push(')');
    } else {
      result.push(tokens[i]);
      i++;
    }
  }

  return result;
}

/**
 * Add parentheses around binary operations for a specific operator
 */
function addOperatorParentheses(tokens: Token[], operator: string): Token[] {
  // Don't add parentheses if the entire expression is already parenthesized
  if (isFullyParenthesized(tokens)) {
    return tokens;
  }

  // Find all occurrences of the operator (right to left for right associativity)
  const indices: number[] = [];

  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i] === operator) {
      // Skip operators that are already inside parentheses
      if (!isOperatorInParentheses(tokens, i)) {
        indices.push(i);
      }
    }
  }

  // eslint-disable-next-line prefer-const
  let result = [...tokens];

  // Process each operator occurrence
  for (const index of indices) {
    if (index >= result.length) continue;

    const actualIndex = result.indexOf(operator, index);
    if (actualIndex === -1) continue;

    if (actualIndex === 0 || actualIndex === result.length - 1) {
      throw new Error(`Missing operand for operator '${operator}'`);
    }

    // Find the bounds of the left operand
    const leftStart = findLeftOperandStart(result, actualIndex);

    // Find the bounds of the right operand
    const rightEnd = findRightOperandEnd(result, actualIndex);

    // Insert closing parenthesis
    result.splice(rightEnd + 1, 0, ')');

    // Insert opening parenthesis
    result.splice(leftStart, 0, '(');
  }

  return result;
}

/**
 * Check if an operator at a given index is already inside parentheses
 */
function isOperatorInParentheses(tokens: Token[], operatorIndex: number): boolean {
  let depth = 0;

  // Check if we're inside parentheses by counting depth from the start
  for (let i = 0; i < operatorIndex; i++) {
    if (tokens[i] === '(') depth++;
    else if (tokens[i] === ')') depth--;
  }

  return depth > 0;
}

/**
 * Find the start index of the left operand for a binary operator
 */
function findLeftOperandStart(tokens: Token[], operatorIndex: number): number {
  if (tokens[operatorIndex - 1] === ')') {
    // Left operand is a parenthesized expression
    let depth = 1;
    let i = operatorIndex - 2;

    while (i >= 0 && depth > 0) {
      if (tokens[i] === ')') depth++;
      else if (tokens[i] === '(') depth--;
      i--;
    }

    if (depth !== 0) {
      throw new Error('Unbalanced parentheses in left operand');
    }

    return i + 1;
  } else {
    // Left operand is a simple token
    return operatorIndex - 1;
  }
}

/**
 * Find the end index of the right operand for a binary operator
 */
function findRightOperandEnd(tokens: Token[], operatorIndex: number): number {
  if (tokens[operatorIndex + 1] === '(') {
    // Right operand is a parenthesized expression
    let depth = 1;
    let i = operatorIndex + 2;

    while (i < tokens.length && depth > 0) {
      if (tokens[i] === '(') depth++;
      else if (tokens[i] === ')') depth--;
      i++;
    }

    if (depth !== 0) {
      throw new Error('Unbalanced parentheses in right operand');
    }

    return i - 1;
  } else {
    // Right operand is a simple token
    return operatorIndex + 1;
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
