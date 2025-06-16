/**
 * Core Boolean Expression Types and Classes
 * 
 * This module contains the fundamental types for representing Boolean expressions
 * as an Abstract Syntax Tree (AST). Each expression type supports evaluation,
 * string representation, and structural equality checks.
 */

export type Assignment = Record<string, boolean>;

export abstract class BooleanExpression {
  abstract evaluate(assignment: Assignment): boolean;
  abstract toString(): string;
  abstract equals(other: BooleanExpression): boolean;
  abstract clone(): BooleanExpression;
  abstract getLength(): number;
  abstract getVariables(): Set<string>;
  
  // Hash function for use in sets and maps
  abstract getHash(): string;
}

export class Variable extends BooleanExpression {
  constructor(public readonly name: string) {
    super();
  }

  evaluate(assignment: Assignment): boolean {
    if (!(this.name in assignment)) {
      throw new Error(`Variable '${this.name}' not found in assignment`);
    }
    return assignment[this.name];
  }

  toString(): string {
    return this.name;
  }

  equals(other: BooleanExpression): boolean {
    return other instanceof Variable && this.name === other.name;
  }

  clone(): Variable {
    return new Variable(this.name);
  }

  getLength(): number {
    return 1;
  }

  getVariables(): Set<string> {
    return new Set([this.name]);
  }

  getHash(): string {
    return `VAR(${this.name})`;
  }
}

export class Negation extends BooleanExpression {
  constructor(public readonly expression: BooleanExpression) {
    super();
  }

  evaluate(assignment: Assignment): boolean {
    return !this.expression.evaluate(assignment);
  }

  toString(): string {
    if (this.expression instanceof Variable || this.expression instanceof Negation) {
      return `!${this.expression.toString()}`;
    }
    return `!(${this.expression.toString()})`;
  }

  equals(other: BooleanExpression): boolean {
    return other instanceof Negation && this.expression.equals(other.expression);
  }

  clone(): Negation {
    return new Negation(this.expression.clone());
  }

  getLength(): number {
    return this.expression.getLength() + 1;
  }

  getVariables(): Set<string> {
    return this.expression.getVariables();
  }

  getHash(): string {
    return `NOT(${this.expression.getHash()})`;
  }
}

export abstract class BinaryOperation extends BooleanExpression {
  constructor(
    public readonly left: BooleanExpression,
    public readonly right: BooleanExpression
  ) {
    super();
  }

  abstract getOperatorSymbol(): string;
  abstract getOperatorName(): string;

  equals(other: BooleanExpression): boolean {
    return (
      other.constructor === this.constructor &&
      other instanceof BinaryOperation &&
      this.left.equals(other.left) &&
      this.right.equals(other.right)
    );
  }

  getLength(): number {
    return this.left.getLength() + this.right.getLength() + 1;
  }

  getVariables(): Set<string> {
    const leftVars = this.left.getVariables();
    const rightVars = this.right.getVariables();
    return new Set([...leftVars, ...rightVars]);
  }

  protected formatToString(): string {
    const leftStr = this.shouldParenthesize(this.left) 
      ? `(${this.left.toString()})` 
      : this.left.toString();
    
    const rightStr = this.shouldParenthesize(this.right) 
      ? `(${this.right.toString()})` 
      : this.right.toString();

    return `${leftStr} ${this.getOperatorSymbol()} ${rightStr}`;
  }

  private shouldParenthesize(expr: BooleanExpression): boolean {
    if (expr instanceof Variable || expr instanceof Negation) {
      return false;
    }
    // Add parentheses for binary operations to maintain clarity
    return expr instanceof BinaryOperation;
  }

  clone(): BinaryOperation {
    // This will be overridden by subclasses
    throw new Error('clone() must be implemented by subclasses');
  }

  getHash(): string {
    return `${this.getOperatorName()}(${this.left.getHash()}, ${this.right.getHash()})`;
  }
}

export class Conjunction extends BinaryOperation {
  evaluate(assignment: Assignment): boolean {
    return this.left.evaluate(assignment) && this.right.evaluate(assignment);
  }

  getOperatorSymbol(): string {
    return '&';
  }

  getOperatorName(): string {
    return 'AND';
  }

  toString(): string {
    return this.formatToString();
  }

  clone(): Conjunction {
    return new Conjunction(this.left.clone(), this.right.clone());
  }
}

export class Disjunction extends BinaryOperation {
  evaluate(assignment: Assignment): boolean {
    return this.left.evaluate(assignment) || this.right.evaluate(assignment);
  }

  getOperatorSymbol(): string {
    return '|';
  }

  getOperatorName(): string {
    return 'OR';
  }

  toString(): string {
    return this.formatToString();
  }

  clone(): Disjunction {
    return new Disjunction(this.left.clone(), this.right.clone());
  }
}

export class Implication extends BinaryOperation {
  evaluate(assignment: Assignment): boolean {
    return !this.left.evaluate(assignment) || this.right.evaluate(assignment);
  }

  getOperatorSymbol(): string {
    return '=>';
  }

  getOperatorName(): string {
    return 'IMP';
  }

  toString(): string {
    return this.formatToString();
  }

  clone(): Implication {
    return new Implication(this.left.clone(), this.right.clone());
  }
}

export class Biconditional extends BinaryOperation {
  evaluate(assignment: Assignment): boolean {
    const leftVal = this.left.evaluate(assignment);
    const rightVal = this.right.evaluate(assignment);
    return (leftVal && rightVal) || (!leftVal && !rightVal);
  }

  getOperatorSymbol(): string {
    return '<=>';
  }

  getOperatorName(): string {
    return 'IFF';
  }

  toString(): string {
    return this.formatToString();
  }

  clone(): Biconditional {
    return new Biconditional(this.left.clone(), this.right.clone());
  }
}

// Constant values
export class TrueConstant extends BooleanExpression {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluate(_assignment: Assignment): boolean {
    return true;
  }

  toString(): string {
    return 'true';
  }

  equals(other: BooleanExpression): boolean {
    return other instanceof TrueConstant;
  }

  clone(): TrueConstant {
    return new TrueConstant();
  }

  getLength(): number {
    return 1;
  }

  getVariables(): Set<string> {
    return new Set();
  }

  getHash(): string {
    return 'TRUE';
  }
}

export class FalseConstant extends BooleanExpression {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluate(_assignment: Assignment): boolean {
    return false;
  }

  toString(): string {
    return 'false';
  }

  equals(other: BooleanExpression): boolean {
    return other instanceof FalseConstant;
  }

  clone(): FalseConstant {
    return new FalseConstant();
  }

  getLength(): number {
    return 1;
  }

  getVariables(): Set<string> {
    return new Set();
  }

  getHash(): string {
    return 'FALSE';
  }
}

// Type guards for instanceof checks
export const isVariable = (expr: BooleanExpression): expr is Variable => 
  expr instanceof Variable;

export const isNegation = (expr: BooleanExpression): expr is Negation => 
  expr instanceof Negation;

export const isConjunction = (expr: BooleanExpression): expr is Conjunction => 
  expr instanceof Conjunction;

export const isDisjunction = (expr: BooleanExpression): expr is Disjunction => 
  expr instanceof Disjunction;

export const isImplication = (expr: BooleanExpression): expr is Implication => 
  expr instanceof Implication;

export const isBiconditional = (expr: BooleanExpression): expr is Biconditional => 
  expr instanceof Biconditional;

export const isTrueConstant = (expr: BooleanExpression): expr is TrueConstant => 
  expr instanceof TrueConstant;

export const isFalseConstant = (expr: BooleanExpression): expr is FalseConstant => 
  expr instanceof FalseConstant;

export const isBinaryOperation = (expr: BooleanExpression): expr is BinaryOperation => 
  expr instanceof BinaryOperation;
