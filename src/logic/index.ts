/**
 * Main Logic Module
 * 
 * This module provides a high-level interface for working with Boolean expressions.
 * It integrates parsing, AST construction, and evaluation.
 */

import { BooleanExpression } from './expressions';
import { parseExpression, addParentheses } from './parser';
import { constructAST, ExpressionParseError } from './constructor';

/**
 * Parse a string expression into a BooleanExpression AST
 */
export function parseToExpression(expressionString: string): BooleanExpression {
  try {
    // Step 1: Tokenize the expression
    const tokens = parseExpression(expressionString);
    
    if (tokens.length === 0) {
      throw new ExpressionParseError('Expression cannot be empty');
    }

    // Step 2: Add parentheses for proper precedence
    const parenthesizedTokens = addParentheses(tokens);
    
    // Step 3: Construct the AST
    const ast = constructAST(parenthesizedTokens);
    
    return ast;
  } catch (error) {
    if (error instanceof ExpressionParseError) {
      throw error;
    }
    throw new ExpressionParseError(`Failed to parse expression: ${error}`);
  }
}

/**
 * Validate that an expression string can be parsed
 */
export function validateExpression(expressionString: string): { valid: boolean; error?: string } {
  try {
    parseToExpression(expressionString);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

// Re-export all the main types and functions for convenience
export * from './expressions';
export * from './parser';
export * from './constructor';
export * from './rules';
export * from './truthTable';
export * from './proofSystem';
