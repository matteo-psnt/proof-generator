/**
 * Parser Tests
 * 
 * Tests for Boolean expression parsing and tokenization.
 */

import { parseExpression, addParentheses } from '../../logic/parser';

describe('Expression Parser', () => {
  describe('parseExpression', () => {
    test('should parse simple expressions', () => {
      expect(parseExpression('a & b')).toEqual(['a', '&', 'b']);
      expect(parseExpression('a | b')).toEqual(['a', '|', 'b']);
      expect(parseExpression('!a')).toEqual(['!', 'a']);
    });

    test('should handle parentheses', () => {
      expect(parseExpression('(a & b) | c')).toEqual(['(', 'a', '&', 'b', ')', '|', 'c']);
      expect(parseExpression('a & (b | c)')).toEqual(['a', '&', '(', 'b', '|', 'c', ')']);
    });

    test('should handle alternative notations', () => {
      expect(parseExpression('a AND b')).toEqual(['a', '&', 'b']);
      expect(parseExpression('a OR b')).toEqual(['a', '|', 'b']);
      expect(parseExpression('NOT a')).toEqual(['!', 'a']);
      expect(parseExpression('a -> b')).toEqual(['a', '=>', 'b']);
      expect(parseExpression('a <-> b')).toEqual(['a', '<=>', 'b']);
    });

    test('should handle constants', () => {
      expect(parseExpression('true & false')).toEqual(['true', '&', 'false']);
      expect(parseExpression('T & F')).toEqual(['true', '&', 'false']);
      expect(parseExpression('1 & 0')).toEqual(['true', '&', 'false']);
    });

    test('should handle Unicode symbols', () => {
      expect(parseExpression('a ∧ b')).toEqual(['a', '&', 'b']);
      expect(parseExpression('a ∨ b')).toEqual(['a', '|', 'b']);
      expect(parseExpression('¬a')).toEqual(['!', 'a']);
      expect(parseExpression('a → b')).toEqual(['a', '=>', 'b']);
      expect(parseExpression('a ↔ b')).toEqual(['a', '<=>', 'b']);
    });

    test('should handle empty input', () => {
      expect(parseExpression('')).toEqual([]);
      expect(parseExpression('   ')).toEqual([]);
    });

    test('should handle complex expressions', () => {
      const tokens = parseExpression('((a AND b) OR (NOT c)) => (d IFF e)');
      expect(tokens).toEqual([
        '(', '(', 'a', '&', 'b', ')', '|', '(', '!', 'c', ')', ')', '=>', '(', 'd', '<=>', 'e', ')'
      ]);
    });
  });

  describe('addParentheses', () => {
    test('should add parentheses for operator precedence', () => {
      // & has higher precedence than |
      expect(addParentheses(['a', '&', 'b', '|', 'c'])).toEqual([
        '(', '(', 'a', '&', 'b', ')', '|', 'c', ')'
      ]);
    });

    test('should handle negation parentheses', () => {
      expect(addParentheses(['!', 'a', '&', 'b'])).toEqual([
        '(', '(', '!', 'a', ')', '&', 'b', ')'
      ]);
    });

    test('should handle complex precedence', () => {
      // Precedence: !, &, |, =>, <=>
      const result = addParentheses(['a', '&', 'b', '|', 'c', '=>', 'd', '<=>', 'e']);
      expect(result).toEqual([
        '(', '(', '(', '(', 'a', '&', 'b', ')', '|', 'c', ')', '=>', 'd', ')', '<=>', 'e', ')'
      ]);
    });

    test('should preserve existing parentheses', () => {
      expect(addParentheses(['(', 'a', '&', 'b', ')'])).toEqual([
        '(', 'a', '&', 'b', ')'
      ]);
    });

    test('should throw error for unbalanced parentheses', () => {
      expect(() => addParentheses(['(', 'a', '&', 'b'])).toThrow('Unbalanced parentheses');
      expect(() => addParentheses(['a', '&', 'b', ')'])).toThrow('Unbalanced parentheses');
    });

    test('should throw error for empty expression', () => {
      expect(() => addParentheses([])).toThrow('Expression cannot be empty');
    });

    test('should handle nested negations', () => {
      expect(addParentheses(['!', '!', 'a'])).toEqual([
        '(', '!', '(', '!', 'a', ')', ')'
      ]);
    });

    test('should handle triple negations', () => {
      expect(addParentheses(['!', '!', '!', 'a'])).toEqual([
        '(', '!', '(', '!', '(', '!', 'a', ')', ')', ')'
      ]);
    });

    test('should handle negation of parenthesized expressions', () => {
      expect(addParentheses(['!', '(', 'a', '&', 'b', ')'])).toEqual([
        '(', '!', '(', 'a', '&', 'b', ')', ')'
      ]);
    });
  });

  describe('end-to-end parsing', () => {
    test('should parse double negation !!a correctly', () => {
      // This was the original issue reported by the user
      const tokens = parseExpression('!!a');
      expect(tokens).toEqual(['!', '!', 'a']);
      
      const withParens = addParentheses(tokens);
      expect(withParens).toEqual(['(', '!', '(', '!', 'a', ')', ')']);
    });

    test('should parse complex expressions with double negation', () => {
      const tokens = parseExpression('!!a & b');
      expect(tokens).toEqual(['!', '!', 'a', '&', 'b']);
      
      const withParens = addParentheses(tokens);
      expect(withParens).toEqual(['(', '(', '!', '(', '!', 'a', ')', ')', '&', 'b', ')']);
    });
  });
});
