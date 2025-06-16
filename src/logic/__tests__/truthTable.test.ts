/**
 * Truth Table Tests
 * 
 * Tests for truth table generation and analysis.
 */

import {
  Variable,
  Negation,
  Conjunction,
  Disjunction,
  TrueConstant,
  FalseConstant,
  BooleanExpression
} from '../../logic/expressions';

import {
  generateTruthTable,
  formatTruthTable,
  truthTableToCSV,
  analyzeTruthTable,
  areExpressionsEquivalent,
  findSatisfyingAssignments,
  validateVariableCount,
  MAX_TRUTH_TABLE_VARIABLES
} from '../../logic/truthTable';

describe('Truth Table Generation', () => {
  describe('validateVariableCount', () => {
    test('should validate expressions with acceptable variable count', () => {
      const expr = new Conjunction(new Variable('a'), new Variable('b'));
      const validation = validateVariableCount(expr);
      
      expect(validation.valid).toBe(true);
      expect(validation.variableCount).toBe(2);
      expect(validation.error).toBeUndefined();
    });

    test('should reject expressions with too many variables', () => {
      // Create an expression with 16 variables (exceeds limit)
      const variables = 'abcdefghijklmnop'.split('').map(name => new Variable(name));
      let expr: BooleanExpression = variables[0];
      for (let i = 1; i < variables.length; i++) {
        expr = new Conjunction(expr, variables[i]);
      }
      
      const validation = validateVariableCount(expr);
      
      expect(validation.valid).toBe(false);
      expect(validation.variableCount).toBe(16);
      expect(validation.error).toContain('Too many variables (16)');
      expect(validation.error).toContain(`${MAX_TRUTH_TABLE_VARIABLES} variables maximum`);
    });

    test('should work correctly at the variable limit boundary', () => {
      // Test with exactly MAX_TRUTH_TABLE_VARIABLES (15)
      const variables = 'abcdefghijklmno'.split('').map(name => new Variable(name));
      let expr: BooleanExpression = variables[0];
      for (let i = 1; i < variables.length; i++) {
        expr = new Disjunction(expr, variables[i]);
      }
      
      const validation = validateVariableCount(expr);
      
      expect(validation.valid).toBe(true);
      expect(validation.variableCount).toBe(MAX_TRUTH_TABLE_VARIABLES);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('generateTruthTable', () => {
    test('should generate truth table for single variable', () => {
      const expr = new Variable('a');
      const table = generateTruthTable(expr);
      
      expect(table.variables).toEqual(['a']);
      expect(table.rows).toHaveLength(2);
      expect(table.rows[0].assignment).toEqual({ a: false });
      expect(table.rows[0].result).toBe(false);
      expect(table.rows[1].assignment).toEqual({ a: true });
      expect(table.rows[1].result).toBe(true);
    });

    test('should generate truth table for conjunction', () => {
      const expr = new Conjunction(new Variable('a'), new Variable('b'));
      const table = generateTruthTable(expr);
      
      expect(table.variables).toEqual(['a', 'b']);
      expect(table.rows).toHaveLength(4);
      
      // Check all combinations
      expect(table.rows[0].assignment).toEqual({ a: false, b: false });
      expect(table.rows[0].result).toBe(false);
      
      expect(table.rows[1].assignment).toEqual({ a: false, b: true });
      expect(table.rows[1].result).toBe(false);
      
      expect(table.rows[2].assignment).toEqual({ a: true, b: false });
      expect(table.rows[2].result).toBe(false);
      
      expect(table.rows[3].assignment).toEqual({ a: true, b: true });
      expect(table.rows[3].result).toBe(true);
    });

    test('should generate truth table for disjunction', () => {
      const expr = new Disjunction(new Variable('a'), new Variable('b'));
      const table = generateTruthTable(expr);
      
      expect(table.variables).toEqual(['a', 'b']);
      expect(table.rows).toHaveLength(4);
      
      const results = table.rows.map(row => row.result);
      expect(results).toEqual([false, true, true, true]);
    });

    test('should generate truth table for negation', () => {
      const expr = new Negation(new Variable('a'));
      const table = generateTruthTable(expr);
      
      expect(table.variables).toEqual(['a']);
      expect(table.rows).toHaveLength(2);
      expect(table.rows[0].result).toBe(true);  // !false = true
      expect(table.rows[1].result).toBe(false); // !true = false
    });

    test('should handle constants', () => {
      const trueTable = generateTruthTable(new TrueConstant());
      expect(trueTable.variables).toEqual([]);
      expect(trueTable.rows).toHaveLength(1);
      expect(trueTable.rows[0].result).toBe(true);

      const falseTable = generateTruthTable(new FalseConstant());
      expect(falseTable.variables).toEqual([]);
      expect(falseTable.rows).toHaveLength(1);
      expect(falseTable.rows[0].result).toBe(false);
    });

    test('should handle complex expressions', () => {
      // (a & b) | !c
      const expr = new Disjunction(
        new Conjunction(new Variable('a'), new Variable('b')),
        new Negation(new Variable('c'))
      );
      
      const table = generateTruthTable(expr);
      
      expect(table.variables).toEqual(['a', 'b', 'c']);
      expect(table.rows).toHaveLength(8);
      
      // Test specific case: a=true, b=true, c=false -> (true & true) | !false = true | true = true
      const row = table.rows.find(r => r.assignment.a && r.assignment.b && !r.assignment.c);
      expect(row?.result).toBe(true);
    });

    test('should throw error for expressions with more than 15 variables', () => {
      // Create an expression with 16 variables (a, b, c, ..., p)
      const variables = 'abcdefghijklmnop'.split('').map(name => new Variable(name));
      
      // Create a large conjunction with all 16 variables
      let expr: BooleanExpression = variables[0];
      for (let i = 1; i < variables.length; i++) {
        expr = new Conjunction(expr, variables[i]);
      }
      
      expect(() => generateTruthTable(expr)).toThrow(
        'Too many variables (16). Truth tables are limited to 15 variables maximum'
      );
    });

    test('should work correctly with exactly 15 variables', () => {
      // Create an expression with exactly 15 variables (a, b, c, ..., o)
      const variables = 'abcdefghijklmno'.split('').map(name => new Variable(name));
      
      // Create a disjunction with all 15 variables
      let expr: BooleanExpression = variables[0];
      for (let i = 1; i < variables.length; i++) {
        expr = new Disjunction(expr, variables[i]);
      }
      
      const table = generateTruthTable(expr);
      
      expect(table.variables).toHaveLength(15);
      expect(table.rows).toHaveLength(Math.pow(2, 15)); // 32,768 rows
      expect(table.expression).toBe(expr);
    });
  });

  describe('formatTruthTable', () => {
    test('should format truth table as string', () => {
      const expr = new Conjunction(new Variable('a'), new Variable('b'));
      const table = generateTruthTable(expr);
      
      const formatted = formatTruthTable(table, { useSymbols: true });
      
      expect(formatted).toContain('a | b | Result');
      expect(formatted).toContain('F | F | F');
      expect(formatted).toContain('T | T | T');
    });

    test('should format with different options', () => {
      const expr = new Variable('a');
      const table = generateTruthTable(expr);
      
      const withSymbols = formatTruthTable(table, { useSymbols: true });
      const withWords = formatTruthTable(table, { useSymbols: false });
      
      expect(withSymbols).toContain('T');
      expect(withSymbols).toContain('F');
      expect(withWords).toContain('true');
      expect(withWords).toContain('false');
    });
  });

  describe('truthTableToCSV', () => {
    test('should convert truth table to CSV', () => {
      const expr = new Conjunction(new Variable('a'), new Variable('b'));
      const table = generateTruthTable(expr);
      
      const csv = truthTableToCSV(table);
      
      expect(csv).toContain('a,b,Result');
      expect(csv).toContain('0,0,0');
      expect(csv).toContain('1,1,1');
    });
  });

  describe('analyzeTruthTable', () => {
    test('should identify tautology', () => {
      // a | !a is always true
      const expr = new Disjunction(new Variable('a'), new Negation(new Variable('a')));
      const table = generateTruthTable(expr);
      const analysis = analyzeTruthTable(table);
      
      expect(analysis.isTautology).toBe(true);
      expect(analysis.isContradiction).toBe(false);
      expect(analysis.isContingent).toBe(false);
      expect(analysis.satisfiableCount).toBe(2);
      expect(analysis.satisfiabilityRatio).toBe(1.0);
    });

    test('should identify contradiction', () => {
      // a & !a is always false
      const expr = new Conjunction(new Variable('a'), new Negation(new Variable('a')));
      const table = generateTruthTable(expr);
      const analysis = analyzeTruthTable(table);
      
      expect(analysis.isTautology).toBe(false);
      expect(analysis.isContradiction).toBe(true);
      expect(analysis.isContingent).toBe(false);
      expect(analysis.satisfiableCount).toBe(0);
      expect(analysis.satisfiabilityRatio).toBe(0.0);
    });

    test('should identify contingent expression', () => {
      // a & b is sometimes true, sometimes false
      const expr = new Conjunction(new Variable('a'), new Variable('b'));
      const table = generateTruthTable(expr);
      const analysis = analyzeTruthTable(table);
      
      expect(analysis.isTautology).toBe(false);
      expect(analysis.isContradiction).toBe(false);
      expect(analysis.isContingent).toBe(true);
      expect(analysis.satisfiableCount).toBe(1);
      expect(analysis.satisfiabilityRatio).toBe(0.25);
    });
  });

  describe('areExpressionsEquivalent', () => {
    test('should identify equivalent expressions', () => {
      const expr1 = new Conjunction(new Variable('a'), new Variable('b'));
      const expr2 = new Conjunction(new Variable('b'), new Variable('a')); // Commutative
      
      expect(areExpressionsEquivalent(expr1, expr2)).toBe(true);
    });

    test('should identify non-equivalent expressions', () => {
      const expr1 = new Conjunction(new Variable('a'), new Variable('b'));
      const expr2 = new Disjunction(new Variable('a'), new Variable('b'));
      
      expect(areExpressionsEquivalent(expr1, expr2)).toBe(false);
    });

    test('should handle expressions with different variables', () => {
      const expr1 = new Variable('a');
      const expr2 = new Variable('b');
      
      expect(areExpressionsEquivalent(expr1, expr2)).toBe(false);
    });
  });

  describe('findSatisfyingAssignments', () => {
    test('should find satisfying assignments', () => {
      const expr = new Conjunction(new Variable('a'), new Variable('b'));
      const assignments = findSatisfyingAssignments(expr);
      
      expect(assignments).toHaveLength(1);
      expect(assignments[0]).toEqual({ a: true, b: true });
    });

    test('should handle unsatisfiable expressions', () => {
      const expr = new Conjunction(new Variable('a'), new Negation(new Variable('a')));
      const assignments = findSatisfyingAssignments(expr);
      
      expect(assignments).toHaveLength(0);
    });

    test('should handle tautologies', () => {
      const expr = new Disjunction(new Variable('a'), new Negation(new Variable('a')));
      const assignments = findSatisfyingAssignments(expr);
      
      expect(assignments).toHaveLength(2);
    });
  });
});
