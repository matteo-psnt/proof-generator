/**
 * Boolean Expression Tests
 *
 * Comprehensive tests for the core Boolean expression classes.
 */

import {
  Variable,
  Negation,
  Conjunction,
  Disjunction,
  Implication,
  Biconditional,
  TrueConstant,
  FalseConstant,
  Assignment,
} from '../../logic/expressions';

describe('Boolean Expressions', () => {
  describe('Variable', () => {
    test('should evaluate correctly', () => {
      const var1 = new Variable('a');
      const assignment: Assignment = { a: true, b: false };

      expect(var1.evaluate(assignment)).toBe(true);
      expect(var1.toString()).toBe('a');
      expect(var1.getLength()).toBe(1);
      expect(var1.getVariables()).toEqual(new Set(['a']));
    });

    test('should throw error for missing variable', () => {
      const var1 = new Variable('c');
      const assignment: Assignment = { a: true, b: false };

      expect(() => var1.evaluate(assignment)).toThrow("Variable 'c' not found in assignment");
    });

    test('should check equality correctly', () => {
      const var1 = new Variable('a');
      const var2 = new Variable('a');
      const var3 = new Variable('b');

      expect(var1.equals(var2)).toBe(true);
      expect(var1.equals(var3)).toBe(false);
    });
  });

  describe('Negation', () => {
    test('should evaluate correctly', () => {
      const var1 = new Variable('a');
      const neg = new Negation(var1);
      const assignment: Assignment = { a: true };

      expect(neg.evaluate(assignment)).toBe(false);
      expect(neg.toString()).toBe('!a');
      expect(neg.getLength()).toBe(2);
    });

    test('should handle nested negations', () => {
      const var1 = new Variable('a');
      const doubleNeg = new Negation(new Negation(var1));
      const assignment: Assignment = { a: true };

      expect(doubleNeg.evaluate(assignment)).toBe(true);
      expect(doubleNeg.toString()).toBe('!!a');
    });
  });

  describe('Conjunction', () => {
    test('should evaluate correctly', () => {
      const var1 = new Variable('a');
      const var2 = new Variable('b');
      const and = new Conjunction(var1, var2);

      expect(and.evaluate({ a: true, b: true })).toBe(true);
      expect(and.evaluate({ a: true, b: false })).toBe(false);
      expect(and.evaluate({ a: false, b: true })).toBe(false);
      expect(and.evaluate({ a: false, b: false })).toBe(false);

      expect(and.toString()).toBe('a & b');
      expect(and.getLength()).toBe(3);
      expect(and.getVariables()).toEqual(new Set(['a', 'b']));
    });
  });

  describe('Disjunction', () => {
    test('should evaluate correctly', () => {
      const var1 = new Variable('a');
      const var2 = new Variable('b');
      const or = new Disjunction(var1, var2);

      expect(or.evaluate({ a: true, b: true })).toBe(true);
      expect(or.evaluate({ a: true, b: false })).toBe(true);
      expect(or.evaluate({ a: false, b: true })).toBe(true);
      expect(or.evaluate({ a: false, b: false })).toBe(false);

      expect(or.toString()).toBe('a | b');
    });
  });

  describe('Implication', () => {
    test('should evaluate correctly', () => {
      const var1 = new Variable('a');
      const var2 = new Variable('b');
      const imp = new Implication(var1, var2);

      expect(imp.evaluate({ a: true, b: true })).toBe(true);
      expect(imp.evaluate({ a: true, b: false })).toBe(false);
      expect(imp.evaluate({ a: false, b: true })).toBe(true);
      expect(imp.evaluate({ a: false, b: false })).toBe(true);

      expect(imp.toString()).toBe('a => b');
    });
  });

  describe('Biconditional', () => {
    test('should evaluate correctly', () => {
      const var1 = new Variable('a');
      const var2 = new Variable('b');
      const iff = new Biconditional(var1, var2);

      expect(iff.evaluate({ a: true, b: true })).toBe(true);
      expect(iff.evaluate({ a: true, b: false })).toBe(false);
      expect(iff.evaluate({ a: false, b: true })).toBe(false);
      expect(iff.evaluate({ a: false, b: false })).toBe(true);

      expect(iff.toString()).toBe('a <=> b');
    });
  });

  describe('Constants', () => {
    test('TrueConstant should work correctly', () => {
      const trueConst = new TrueConstant();

      expect(trueConst.evaluate({})).toBe(true);
      expect(trueConst.toString()).toBe('true');
      expect(trueConst.getLength()).toBe(1);
      expect(trueConst.getVariables()).toEqual(new Set());
    });

    test('FalseConstant should work correctly', () => {
      const falseConst = new FalseConstant();

      expect(falseConst.evaluate({})).toBe(false);
      expect(falseConst.toString()).toBe('false');
      expect(falseConst.getLength()).toBe(1);
      expect(falseConst.getVariables()).toEqual(new Set());
    });
  });

  describe('Complex expressions', () => {
    test('should handle nested expressions', () => {
      // (a & b) | (!c)
      const var1 = new Variable('a');
      const var2 = new Variable('b');
      const var3 = new Variable('c');

      const and = new Conjunction(var1, var2);
      const not = new Negation(var3);
      const or = new Disjunction(and, not);

      expect(or.evaluate({ a: true, b: true, c: false })).toBe(true);
      expect(or.evaluate({ a: false, b: false, c: true })).toBe(false);
      expect(or.evaluate({ a: false, b: false, c: false })).toBe(true);

      expect(or.getVariables()).toEqual(new Set(['a', 'b', 'c']));
      expect(or.getLength()).toBe(6); // a, b, &, c, !, |
    });
  });
});
