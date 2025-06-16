/**
 * Quick Unicode Parser Test
 */

import { parseExpression } from '../parser';

describe('Unicode Symbol Parser Fix', () => {
  test('should handle Unicode symbols with spaces', () => {
    expect(parseExpression('a ↔ b')).toEqual(['a', '<=>', 'b']);
    expect(parseExpression('a ∧ b')).toEqual(['a', '&', 'b']);
    expect(parseExpression('a ∨ b')).toEqual(['a', '|', 'b']);
    expect(parseExpression('a → b')).toEqual(['a', '=>', 'b']);
    expect(parseExpression('¬ a')).toEqual(['!', 'a']);
  });

  test('should handle Unicode symbols without spaces', () => {
    expect(parseExpression('a↔b')).toEqual(['a', '<=>', 'b']);
    expect(parseExpression('a∧b')).toEqual(['a', '&', 'b']);
    expect(parseExpression('a∨b')).toEqual(['a', '|', 'b']);
    expect(parseExpression('a→b')).toEqual(['a', '=>', 'b']);
    expect(parseExpression('¬a')).toEqual(['!', 'a']);
  });
});
