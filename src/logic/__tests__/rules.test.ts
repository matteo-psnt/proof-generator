/**
 * Transformation Rules Tests
 * 
 * Tests for logical transformation rules.
 */

import {
  Variable,
  Negation,
  Conjunction,
  Disjunction,
  Implication,
  Biconditional,
  TrueConstant,
  FalseConstant
} from '../../logic/expressions';

import {
  CommutativityAND,
  CommutativityOR,
  CommutativityIFF,
  DoubleNegation,
  ExcludedMiddle,
  Contradiction,
  DeMorganAND,
  DeMorganOR,
  ImplicationElimination,
  DistributivityAND,
  DistributivityOR,
  Idempotence,
  Equivalence,
  SimplificationWithTrue,
  SimplificationWithFalse
} from '../../logic/rules';

describe('Transformation Rules', () => {
  const P = new Variable('P');
  const Q = new Variable('Q');
  const R = new Variable('R');

  describe('Commutativity Rules', () => {
    test('CommutativityAND should work', () => {
      const rule = new CommutativityAND();
      const expr = new Conjunction(P, Q);
      
      expect(rule.canApply(expr)).toBe(true);
      expect(rule.canApply(P)).toBe(false);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Conjunction);
      expect((result as Conjunction).left.equals(Q)).toBe(true);
      expect((result as Conjunction).right.equals(P)).toBe(true);
    });

    test('CommutativityOR should work', () => {
      const rule = new CommutativityOR();
      const expr = new Disjunction(P, Q);
      
      expect(rule.canApply(expr)).toBe(true);
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Disjunction);
      expect((result as Disjunction).left.equals(Q)).toBe(true);
      expect((result as Disjunction).right.equals(P)).toBe(true);
    });

    test('CommutativityIFF should work', () => {
      const rule = new CommutativityIFF();
      const expr = new Biconditional(P, Q);
      
      expect(rule.canApply(expr)).toBe(true);
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Biconditional);
      expect((result as Biconditional).left.equals(Q)).toBe(true);
      expect((result as Biconditional).right.equals(P)).toBe(true);
    });
  });

  describe('Double Negation', () => {
    test('should eliminate double negation', () => {
      const rule = new DoubleNegation();
      const expr = new Negation(new Negation(P));
      
      expect(rule.canApply(expr)).toBe(true);
      expect(rule.canApply(new Negation(P))).toBe(false);
      
      const result = rule.apply(expr);
      expect(result.equals(P)).toBe(true);
    });
  });

  describe('Excluded Middle', () => {
    test('should recognize P | !P', () => {
      const rule = new ExcludedMiddle();
      const expr1 = new Disjunction(P, new Negation(P));
      const expr2 = new Disjunction(new Negation(P), P);
      
      expect(rule.canApply(expr1)).toBe(true);
      expect(rule.canApply(expr2)).toBe(true);
      expect(rule.canApply(new Disjunction(P, Q))).toBe(false);
      
      const result = rule.apply(expr1);
      expect(result).toBeInstanceOf(TrueConstant);
    });
  });

  describe('Contradiction', () => {
    test('should recognize P & !P', () => {
      const rule = new Contradiction();
      const expr1 = new Conjunction(P, new Negation(P));
      const expr2 = new Conjunction(new Negation(P), P);
      
      expect(rule.canApply(expr1)).toBe(true);
      expect(rule.canApply(expr2)).toBe(true);
      expect(rule.canApply(new Conjunction(P, Q))).toBe(false);
      
      const result = rule.apply(expr1);
      expect(result).toBeInstanceOf(FalseConstant);
    });
  });

  describe("De Morgan's Laws", () => {
    test('DeMorganAND should work', () => {
      const rule = new DeMorganAND();
      const expr = new Negation(new Conjunction(P, Q));
      
      expect(rule.canApply(expr)).toBe(true);
      expect(rule.canApply(new Conjunction(P, Q))).toBe(false);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Disjunction);
      const disjunction = result as Disjunction;
      expect(disjunction.left).toBeInstanceOf(Negation);
      expect(disjunction.right).toBeInstanceOf(Negation);
      expect((disjunction.left as Negation).expression.equals(P)).toBe(true);
      expect((disjunction.right as Negation).expression.equals(Q)).toBe(true);
    });

    test('DeMorganOR should work', () => {
      const rule = new DeMorganOR();
      const expr = new Negation(new Disjunction(P, Q));
      
      expect(rule.canApply(expr)).toBe(true);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Conjunction);
      const conjunction = result as Conjunction;
      expect(conjunction.left).toBeInstanceOf(Negation);
      expect(conjunction.right).toBeInstanceOf(Negation);
      expect((conjunction.left as Negation).expression.equals(P)).toBe(true);
      expect((conjunction.right as Negation).expression.equals(Q)).toBe(true);
    });
  });

  describe('Implication Elimination', () => {
    test('should convert P => Q to !P | Q', () => {
      const rule = new ImplicationElimination();
      const expr = new Implication(P, Q);
      
      expect(rule.canApply(expr)).toBe(true);
      expect(rule.canApply(new Conjunction(P, Q))).toBe(false);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Disjunction);
      const disjunction = result as Disjunction;
      expect(disjunction.left).toBeInstanceOf(Negation);
      expect((disjunction.left as Negation).expression.equals(P)).toBe(true);
      expect(disjunction.right.equals(Q)).toBe(true);
    });
  });

  describe('Distributivity', () => {
    test('DistributivityAND should work', () => {
      const rule = new DistributivityAND();
      const expr = new Conjunction(P, new Disjunction(Q, R));
      
      expect(rule.canApply(expr)).toBe(true);
      expect(rule.canApply(new Conjunction(P, Q))).toBe(false);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Disjunction);
      const disjunction = result as Disjunction;
      expect(disjunction.left).toBeInstanceOf(Conjunction);
      expect(disjunction.right).toBeInstanceOf(Conjunction);
    });

    test('DistributivityOR should work', () => {
      const rule = new DistributivityOR();
      const expr = new Disjunction(P, new Conjunction(Q, R));
      
      expect(rule.canApply(expr)).toBe(true);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Conjunction);
      const conjunction = result as Conjunction;
      expect(conjunction.left).toBeInstanceOf(Disjunction);
      expect(conjunction.right).toBeInstanceOf(Disjunction);
    });
  });

  describe('Idempotence', () => {
    test('should simplify P & P to P', () => {
      const rule = new Idempotence();
      const expr1 = new Conjunction(P, P);
      const expr2 = new Disjunction(P, P);
      
      expect(rule.canApply(expr1)).toBe(true);
      expect(rule.canApply(expr2)).toBe(true);
      expect(rule.canApply(new Conjunction(P, Q))).toBe(false);
      
      const result1 = rule.apply(expr1);
      const result2 = rule.apply(expr2);
      expect(result1.equals(P)).toBe(true);
      expect(result2.equals(P)).toBe(true);
    });
  });

  describe('Equivalence', () => {
    test('should convert P <=> Q to (P => Q) & (Q => P)', () => {
      const rule = new Equivalence();
      const expr = new Biconditional(P, Q);
      
      expect(rule.canApply(expr)).toBe(true);
      expect(rule.canApply(new Implication(P, Q))).toBe(false);
      
      const result = rule.apply(expr);
      expect(result).toBeInstanceOf(Conjunction);
      const conjunction = result as Conjunction;
      expect(conjunction.left).toBeInstanceOf(Implication);
      expect(conjunction.right).toBeInstanceOf(Implication);
    });
  });

  describe('Simplification Rules', () => {
    test('SimplificationWithTrue should work', () => {
      const rule = new SimplificationWithTrue();
      const expr1 = new Conjunction(P, new TrueConstant());
      const expr2 = new Conjunction(new TrueConstant(), P);
      const expr3 = new Disjunction(P, new FalseConstant());
      const expr4 = new Disjunction(new FalseConstant(), P);
      
      expect(rule.canApply(expr1)).toBe(true);
      expect(rule.canApply(expr2)).toBe(true);
      expect(rule.canApply(expr3)).toBe(true);
      expect(rule.canApply(expr4)).toBe(true);
      
      expect(rule.apply(expr1).equals(P)).toBe(true);
      expect(rule.apply(expr2).equals(P)).toBe(true);
      expect(rule.apply(expr3).equals(P)).toBe(true);
      expect(rule.apply(expr4).equals(P)).toBe(true);
    });

    test('SimplificationWithFalse should work', () => {
      const rule = new SimplificationWithFalse();
      const expr1 = new Disjunction(P, new TrueConstant());
      const expr2 = new Conjunction(P, new FalseConstant());
      
      expect(rule.canApply(expr1)).toBe(true);
      expect(rule.canApply(expr2)).toBe(true);
      
      const result1 = rule.apply(expr1);
      const result2 = rule.apply(expr2);
      expect(result1).toBeInstanceOf(TrueConstant);
      expect(result2).toBeInstanceOf(FalseConstant);
    });
  });
});
