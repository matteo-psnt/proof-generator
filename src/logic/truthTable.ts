/**
 * Truth Table Generator
 * 
 * This module generates truth tables for Boolean expressions by evaluating
 * the expression for all possible variable assignments.
 */

import { BooleanExpression, Assignment } from './expressions';

/**
 * Maximum number of variables allowed in truth table generation
 * This limit prevents browser freezing from exponential growth in computation time
 */
export const MAX_TRUTH_TABLE_VARIABLES = 15;

/**
 * Check if an expression has too many variables for truth table generation
 */
export function validateVariableCount(expression: BooleanExpression): { 
  valid: boolean; 
  variableCount: number;
  error?: string; 
} {
  const variableCount = expression.getVariables().size;
  
  if (variableCount > MAX_TRUTH_TABLE_VARIABLES) {
    return {
      valid: false,
      variableCount,
      error: `Too many variables (${variableCount}). Truth tables are limited to ${MAX_TRUTH_TABLE_VARIABLES} variables maximum ` +
             `to maintain performance. Consider simplifying your expression or breaking it into smaller parts.`
    };
  }
  
  return { valid: true, variableCount };
}

export interface TruthTableRow {
  assignment: Assignment;
  result: boolean;
}

export interface TruthTable {
  variables: string[];
  rows: TruthTableRow[];
  expression: BooleanExpression;
}

/**
 * Generate a complete truth table for a Boolean expression
 */
export function generateTruthTable(expression: BooleanExpression): TruthTable {
  const variables = Array.from(expression.getVariables()).sort();
  
  // Validate variable count
  const validation = validateVariableCount(expression);
  if (!validation.valid) {
    throw new Error(validation.error!);
  }
  
  const rows: TruthTableRow[] = [];

  // Generate all possible combinations of variable assignments
  const numRows = Math.pow(2, variables.length);
  
  for (let i = 0; i < numRows; i++) {
    const assignment: Assignment = {};
    
    // Convert the row number to a binary representation
    // Each bit determines the truth value of a variable
    for (let j = 0; j < variables.length; j++) {
      const bitPosition = variables.length - 1 - j;
      assignment[variables[j]] = Boolean((i >> bitPosition) & 1);
    }
    
    try {
      const result = expression.evaluate(assignment);
      rows.push({ assignment, result });
    } catch (error) {
      // If evaluation fails, mark as error (shouldn't happen with valid expressions)
      console.error(`Error evaluating expression with assignment ${JSON.stringify(assignment)}:`, error);
      rows.push({ assignment, result: false }); // Default to false for error cases
    }
  }

  return {
    variables,
    rows,
    expression
  };
}

/**
 * Format a truth table as a string for display or export
 */
export function formatTruthTable(truthTable: TruthTable, options: {
  useSymbols?: boolean;
  includeExpression?: boolean;
  separator?: string;
} = {}): string {
  const { 
    useSymbols = true, 
    includeExpression = true, 
    separator = ' | ' 
  } = options;

  const trueSymbol = useSymbols ? 'T' : 'true';
  const falseSymbol = useSymbols ? 'F' : 'false';

  let result = '';

  // Add expression if requested
  if (includeExpression) {
    result += `Truth table for: ${truthTable.expression.toString()}\n\n`;
  }

  // Create header
  const headers = [...truthTable.variables, 'Result'];
  result += headers.join(separator) + '\n';

  // Add separator line
  const separatorLine = headers.map(h => '-'.repeat(h.length)).join(separator.replace(/\s/g, '-'));
  result += separatorLine + '\n';

  // Add rows
  for (const row of truthTable.rows) {
    const values = truthTable.variables.map(variable => {
      const value = row.assignment[variable];
      return value ? trueSymbol : falseSymbol;
    });
    
    const resultValue = row.result ? trueSymbol : falseSymbol;
    values.push(resultValue);
    
    result += values.join(separator) + '\n';
  }

  return result;
}

/**
 * Convert truth table to CSV format
 */
export function truthTableToCSV(truthTable: TruthTable): string {
  const headers = [...truthTable.variables, 'Result'];
  let csv = headers.join(',') + '\n';

  for (const row of truthTable.rows) {
    const values = truthTable.variables.map(variable => 
      row.assignment[variable] ? '1' : '0'
    );
    values.push(row.result ? '1' : '0');
    csv += values.join(',') + '\n';
  }

  return csv;
}

/**
 * Analyze truth table properties
 */
export interface TruthTableAnalysis {
  isTautology: boolean;
  isContradiction: boolean;
  isContingent: boolean;
  satisfiableCount: number;
  totalRows: number;
  satisfiabilityRatio: number;
}

export function analyzeTruthTable(truthTable: TruthTable): TruthTableAnalysis {
  const satisfiableRows = truthTable.rows.filter(row => row.result);
  const satisfiableCount = satisfiableRows.length;
  const totalRows = truthTable.rows.length;

  const isTautology = satisfiableCount === totalRows;
  const isContradiction = satisfiableCount === 0;
  const isContingent = satisfiableCount > 0 && satisfiableCount < totalRows;

  return {
    isTautology,
    isContradiction,
    isContingent,
    satisfiableCount,
    totalRows,
    satisfiabilityRatio: totalRows > 0 ? satisfiableCount / totalRows : 0
  };
}

/**
 * Find all satisfying assignments for an expression
 */
export function findSatisfyingAssignments(expression: BooleanExpression): Assignment[] {
  const truthTable = generateTruthTable(expression);
  return truthTable.rows
    .filter(row => row.result)
    .map(row => row.assignment);
}

/**
 * Check if two expressions are equivalent by comparing their truth tables
 */
export function areExpressionsEquivalent(expr1: BooleanExpression, expr2: BooleanExpression): boolean {
  // Get all variables from both expressions
  const vars1 = expr1.getVariables();
  const vars2 = expr2.getVariables();
  const allVars = new Set([...vars1, ...vars2]);
  const variables = Array.from(allVars).sort();

  // Generate all possible assignments
  const numRows = Math.pow(2, variables.length);
  
  for (let i = 0; i < numRows; i++) {
    const assignment: Assignment = {};
    
    for (let j = 0; j < variables.length; j++) {
      const bitPosition = variables.length - 1 - j;
      assignment[variables[j]] = Boolean((i >> bitPosition) & 1);
    }
    
    try {
      // Evaluate both expressions with the same assignment
      const result1 = expr1.evaluate(assignment);
      const result2 = expr2.evaluate(assignment);
      
      // If results differ, expressions are not equivalent
      if (result1 !== result2) {
        return false;
      }
    } catch {
      // If either expression fails to evaluate, they're not equivalent
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a compact truth table representation for small expressions
 */
export function generateCompactTruthTable(expression: BooleanExpression): string {
  const variables = Array.from(expression.getVariables()).sort();
  
  if (variables.length === 0) {
    // Expression is a constant
    const result = expression.evaluate({});
    return result ? '1' : '0';
  }
  
  if (variables.length > 6) {
    throw new Error('Expression has too many variables for compact representation');
  }
  
  const truthTable = generateTruthTable(expression);
  
  // Create a binary string representation
  return truthTable.rows.map(row => row.result ? '1' : '0').join('');
}
