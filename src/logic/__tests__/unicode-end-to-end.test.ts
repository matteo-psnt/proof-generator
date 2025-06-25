/**
 * End-to-end test for Unicode symbols
 */

import { parseToExpression, validateExpression } from '../index';

describe('Unicode End-to-End Test', () => {
  test('should handle Unicode expressions end-to-end', () => {
    const expressions = [
      'a ↔ b',
      'a ∧ b ∨ c',
      '¬(a → b)',
      '(a ∧ b) ↔ (c ∨ d)',
      'a↔b',
      'a∧b∨c',
      '¬(a→b)',
    ];

    expressions.forEach((expr) => {
      // Should validate successfully
      const validation = validateExpression(expr);
      expect(validation.valid).toBe(true);

      // Should parse successfully
      expect(() => parseToExpression(expr)).not.toThrow();

      const parsed = parseToExpression(expr);
      expect(parsed).toBeDefined();
      expect(parsed.toString()).toBeDefined();
    });
  });
});
