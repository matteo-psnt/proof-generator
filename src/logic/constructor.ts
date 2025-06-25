/**
 * AST Constructor
 *
 * This module builds Abstract Syntax Trees from tokenized Boolean expressions.
 * It handles operator precedence and parentheses to create the correct tree structure.
 */

import {
  BooleanExpression,
  Variable,
  Negation,
  Conjunction,
  Disjunction,
  Implication,
  Biconditional,
  TrueConstant,
  FalseConstant,
} from './expressions';
import type { Token } from './parser';

export interface ParseError {
  message: string;
  position?: number;
  token?: string;
}

export class ExpressionParseError extends Error {
  constructor(
    message: string,
    public readonly position?: number,
    public readonly token?: string
  ) {
    super(message);
    this.name = 'ExpressionParseError';
  }
}

/**
 * Construct an Abstract Syntax Tree from a list of tokens
 */
export function constructAST(tokens: Token[]): BooleanExpression {
  if (tokens.length === 0) {
    throw new ExpressionParseError('Expression cannot be empty');
  }

  return parseExpression(tokens, 0).expression;
}

interface ParseResult {
  expression: BooleanExpression;
  nextIndex: number;
}

/**
 * Parse an expression starting from the given index
 */
function parseExpression(tokens: Token[], startIndex: number): ParseResult {
  return parseBiconditional(tokens, startIndex);
}

/**
 * Parse biconditional expressions (lowest precedence)
 */
function parseBiconditional(tokens: Token[], startIndex: number): ParseResult {
  let result = parseImplication(tokens, startIndex);

  while (result.nextIndex < tokens.length && tokens[result.nextIndex] === '<=>') {
    const rightResult = parseImplication(tokens, result.nextIndex + 1);
    result = {
      expression: new Biconditional(result.expression, rightResult.expression),
      nextIndex: rightResult.nextIndex,
    };
  }

  return result;
}

/**
 * Parse implication expressions
 */
function parseImplication(tokens: Token[], startIndex: number): ParseResult {
  let result = parseDisjunction(tokens, startIndex);

  while (result.nextIndex < tokens.length && tokens[result.nextIndex] === '=>') {
    const rightResult = parseDisjunction(tokens, result.nextIndex + 1);
    result = {
      expression: new Implication(result.expression, rightResult.expression),
      nextIndex: rightResult.nextIndex,
    };
  }

  return result;
}

/**
 * Parse disjunction expressions
 */
function parseDisjunction(tokens: Token[], startIndex: number): ParseResult {
  let result = parseConjunction(tokens, startIndex);

  while (result.nextIndex < tokens.length && tokens[result.nextIndex] === '|') {
    const rightResult = parseConjunction(tokens, result.nextIndex + 1);
    result = {
      expression: new Disjunction(result.expression, rightResult.expression),
      nextIndex: rightResult.nextIndex,
    };
  }

  return result;
}

/**
 * Parse conjunction expressions
 */
function parseConjunction(tokens: Token[], startIndex: number): ParseResult {
  let result = parseNegation(tokens, startIndex);

  while (result.nextIndex < tokens.length && tokens[result.nextIndex] === '&') {
    const rightResult = parseNegation(tokens, result.nextIndex + 1);
    result = {
      expression: new Conjunction(result.expression, rightResult.expression),
      nextIndex: rightResult.nextIndex,
    };
  }

  return result;
}

/**
 * Parse negation expressions (highest precedence)
 */
function parseNegation(tokens: Token[], startIndex: number): ParseResult {
  if (startIndex >= tokens.length) {
    throw new ExpressionParseError('Unexpected end of expression', startIndex);
  }

  if (tokens[startIndex] === '!') {
    const innerResult = parseNegation(tokens, startIndex + 1);
    return {
      expression: new Negation(innerResult.expression),
      nextIndex: innerResult.nextIndex,
    };
  }

  return parsePrimary(tokens, startIndex);
}

/**
 * Parse primary expressions (variables, constants, parenthesized expressions)
 */
function parsePrimary(tokens: Token[], startIndex: number): ParseResult {
  if (startIndex >= tokens.length) {
    throw new ExpressionParseError('Unexpected end of expression', startIndex);
  }

  const token = tokens[startIndex];

  // Handle parenthesized expressions
  if (token === '(') {
    const innerResult = parseExpression(tokens, startIndex + 1);

    if (innerResult.nextIndex >= tokens.length || tokens[innerResult.nextIndex] !== ')') {
      throw new ExpressionParseError(
        'Missing closing parenthesis',
        innerResult.nextIndex,
        tokens[innerResult.nextIndex]
      );
    }

    return {
      expression: innerResult.expression,
      nextIndex: innerResult.nextIndex + 1,
    };
  }

  // Handle boolean constants
  if (token === 'true') {
    return {
      expression: new TrueConstant(),
      nextIndex: startIndex + 1,
    };
  }

  if (token === 'false') {
    return {
      expression: new FalseConstant(),
      nextIndex: startIndex + 1,
    };
  }

  // Handle variables
  if (isValidVariableName(token)) {
    return {
      expression: new Variable(token),
      nextIndex: startIndex + 1,
    };
  }

  // If we reach here, we have an unexpected token
  throw new ExpressionParseError(`Unexpected token: '${token}'`, startIndex, token);
}

/**
 * Check if a token is a valid variable name
 */
function isValidVariableName(token: string): boolean {
  // Variables should be alphanumeric strings that aren't reserved words
  const reservedWords = ['true', 'false', '&', '|', '!', '=>', '<=>', '(', ')'];
  return !reservedWords.includes(token) && /^[a-zA-Z]\w*$/.test(token);
}

/**
 * Alternative constructor that handles the full parsing pipeline
 */
export function parseToAST(expression: string): BooleanExpression {
  try {
    // This would use the parser module to tokenize and add parentheses
    // For now, we'll implement a simple version
    const tokens = simpleTokenize(expression);
    return constructAST(tokens);
  } catch (error) {
    if (error instanceof ExpressionParseError) {
      throw error;
    }
    throw new ExpressionParseError(`Parse error: ${error}`);
  }
}

/**
 * Simple tokenizer for basic expressions (temporary implementation)
 */
function simpleTokenize(expression: string): Token[] {
  // Remove extra spaces and split on whitespace and operators
  const normalizedExpr = expression.replace(/\s+/g, ' ').trim();

  // This is a simplified tokenizer - in practice, we'd use the parser module
  const tokens: Token[] = [];
  let currentToken = '';

  for (let i = 0; i < normalizedExpr.length; i++) {
    const char = normalizedExpr[i];

    if (' ()&|!'.includes(char)) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      if (char !== ' ') {
        tokens.push(char);
      }
    } else if (char === '=' && i + 1 < normalizedExpr.length && normalizedExpr[i + 1] === '>') {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      tokens.push('=>');
      i++; // Skip the '>'
    } else if (
      char === '<' &&
      i + 2 < normalizedExpr.length &&
      normalizedExpr.slice(i, i + 3) === '<=>'
    ) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      tokens.push('<=>');
      i += 2; // Skip the '=>'
    } else {
      currentToken += char;
    }
  }

  if (currentToken) {
    tokens.push(currentToken);
  }

  return tokens;
}
