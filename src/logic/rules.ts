/**
 * Transformational Proof Rules
 *
 * This module contains all the logical transformation rules that can be applied
 * to Boolean expressions. Each rule defines when it can be applied and how to
 * transform the expression.
 */

import {
  BooleanExpression,
  Negation,
  Conjunction,
  Disjunction,
  Implication,
  Biconditional,
  TrueConstant,
  FalseConstant,
  isNegation,
  isConjunction,
  isDisjunction,
  isImplication,
  isBiconditional,
  isTrueConstant,
  isFalseConstant,
  isBinaryOperation,
} from './expressions';

export interface TransformationRule {
  readonly name: string;
  readonly category: string;
  readonly description: string;
  canApply(expression: BooleanExpression): boolean;
  apply(expression: BooleanExpression): BooleanExpression;
}

// Base class for transformation rules
abstract class Rule implements TransformationRule {
  constructor(
    public readonly name: string,
    public readonly category: string,
    public readonly description: string
  ) {}

  abstract canApply(expression: BooleanExpression): boolean;
  abstract apply(expression: BooleanExpression): BooleanExpression;
}

// Commutativity Rules
export class CommutativityAND extends Rule {
  constructor() {
    super('Commutativity (AND)', 'comm_assoc', 'P ∧ Q ⟺ Q ∧ P');
  }

  canApply(expression: BooleanExpression): boolean {
    return isConjunction(expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isConjunction(expression)) {
      throw new Error('Cannot apply AND commutativity to non-conjunction');
    }
    return new Conjunction(expression.right, expression.left);
  }
}

export class CommutativityOR extends Rule {
  constructor() {
    super('Commutativity (OR)', 'comm_assoc', 'P ∨ Q ⟺ Q ∨ P');
  }

  canApply(expression: BooleanExpression): boolean {
    return isDisjunction(expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isDisjunction(expression)) {
      throw new Error('Cannot apply OR commutativity to non-disjunction');
    }
    return new Disjunction(expression.right, expression.left);
  }
}

export class CommutativityIFF extends Rule {
  constructor() {
    super('Commutativity (IFF)', 'comm_assoc', 'P ⟺ Q ⟺ Q ⟺ P');
  }

  canApply(expression: BooleanExpression): boolean {
    return isBiconditional(expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isBiconditional(expression)) {
      throw new Error('Cannot apply IFF commutativity to non-biconditional');
    }
    return new Biconditional(expression.right, expression.left);
  }
}

// Double Negation Rule
export class DoubleNegation extends Rule {
  constructor() {
    super('Double Negation', 'neg', '¬(¬P) ⟺ P');
  }

  canApply(expression: BooleanExpression): boolean {
    return isNegation(expression) && isNegation(expression.expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isNegation(expression) || !isNegation(expression.expression)) {
      throw new Error('Cannot apply double negation rule');
    }
    return expression.expression.expression;
  }
}

// Excluded Middle Rule
export class ExcludedMiddle extends Rule {
  constructor() {
    super('Excluded Middle', 'lem', 'P ∨ ¬P ⟺ true');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isDisjunction(expression)) return false;

    // Check for P ∨ ¬P
    if (isNegation(expression.right)) {
      return expression.left.equals(expression.right.expression);
    }

    // Check for ¬P ∨ P
    if (isNegation(expression.left)) {
      return expression.right.equals(expression.left.expression);
    }

    return false;
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!this.canApply(expression)) {
      throw new Error('Cannot apply excluded middle rule');
    }
    return new TrueConstant();
  }
}

// Contradiction Rule
export class Contradiction extends Rule {
  constructor() {
    super('Contradiction', 'contr', 'P ∧ ¬P ⟺ false');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isConjunction(expression)) return false;

    // Check for P ∧ ¬P
    if (isNegation(expression.right)) {
      return expression.left.equals(expression.right.expression);
    }

    // Check for ¬P ∧ P
    if (isNegation(expression.left)) {
      return expression.right.equals(expression.left.expression);
    }

    return false;
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!this.canApply(expression)) {
      throw new Error('Cannot apply contradiction rule');
    }
    return new FalseConstant();
  }
}

// De Morgan's Laws
export class DeMorganAND extends Rule {
  constructor() {
    super("De Morgan's Law (AND)", 'dm', '¬(P ∧ Q) ⟺ (¬P) ∨ (¬Q)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isNegation(expression) && isConjunction(expression.expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isNegation(expression) || !isConjunction(expression.expression)) {
      throw new Error("Cannot apply De Morgan's law for AND");
    }
    const inner = expression.expression;
    return new Disjunction(new Negation(inner.left), new Negation(inner.right));
  }
}

export class DeMorganOR extends Rule {
  constructor() {
    super("De Morgan's Law (OR)", 'dm', '¬(P ∨ Q) ⟺ (¬P) ∧ (¬Q)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isNegation(expression) && isDisjunction(expression.expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isNegation(expression) || !isDisjunction(expression.expression)) {
      throw new Error("Cannot apply De Morgan's law for OR");
    }
    const inner = expression.expression;
    return new Conjunction(new Negation(inner.left), new Negation(inner.right));
  }
}

// Reverse De Morgan's Laws
export class DeMorganANDReverse extends Rule {
  constructor() {
    super("De Morgan's Law (AND Reverse)", 'dm', '(¬P) ∨ (¬Q) ⟺ ¬(P ∧ Q)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isDisjunction(expression) && isNegation(expression.left) && isNegation(expression.right);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (
      !isDisjunction(expression) ||
      !isNegation(expression.left) ||
      !isNegation(expression.right)
    ) {
      throw new Error("Cannot apply reverse De Morgan's law for AND");
    }
    return new Negation(new Conjunction(expression.left.expression, expression.right.expression));
  }
}

export class DeMorganORReverse extends Rule {
  constructor() {
    super("De Morgan's Law (OR Reverse)", 'dm', '(¬P) ∧ (¬Q) ⟺ ¬(P ∨ Q)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isConjunction(expression) && isNegation(expression.left) && isNegation(expression.right);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (
      !isConjunction(expression) ||
      !isNegation(expression.left) ||
      !isNegation(expression.right)
    ) {
      throw new Error("Cannot apply reverse De Morgan's law for OR");
    }
    return new Negation(new Disjunction(expression.left.expression, expression.right.expression));
  }
}

// Implication Rules
export class ImplicationElimination extends Rule {
  constructor() {
    super('Implication Elimination', 'impl', 'P ⇒ Q ⟺ ¬P ∨ Q');
  }

  canApply(expression: BooleanExpression): boolean {
    return isImplication(expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isImplication(expression)) {
      throw new Error('Cannot apply implication elimination to non-implication');
    }
    return new Disjunction(new Negation(expression.left), expression.right);
  }
}

export class ImplicationEliminationReverse extends Rule {
  constructor() {
    super('Implication Elimination (Reverse)', 'impl', '¬P ∨ Q ⟺ P ⇒ Q');
  }

  canApply(expression: BooleanExpression): boolean {
    return isDisjunction(expression) && isNegation(expression.left);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isDisjunction(expression) || !isNegation(expression.left)) {
      throw new Error('Cannot apply reverse implication elimination');
    }
    return new Implication(expression.left.expression, expression.right);
  }
}

// Distributivity Rules
export class DistributivityAND extends Rule {
  constructor() {
    super('Distributivity (AND over OR)', 'distr', 'P ∧ (Q ∨ R) ⟺ (P ∧ Q) ∨ (P ∧ R)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isConjunction(expression) && isDisjunction(expression.right);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isConjunction(expression) || !isDisjunction(expression.right)) {
      throw new Error('Cannot apply AND distributivity');
    }
    const P = expression.left;
    const QorR = expression.right;
    return new Disjunction(new Conjunction(P, QorR.left), new Conjunction(P, QorR.right));
  }
}

export class DistributivityOR extends Rule {
  constructor() {
    super('Distributivity (OR over AND)', 'distr', 'P ∨ (Q ∧ R) ⟺ (P ∨ Q) ∧ (P ∨ R)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isDisjunction(expression) && isConjunction(expression.right);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isDisjunction(expression) || !isConjunction(expression.right)) {
      throw new Error('Cannot apply OR distributivity');
    }
    const P = expression.left;
    const QandR = expression.right;
    return new Conjunction(new Disjunction(P, QandR.left), new Disjunction(P, QandR.right));
  }
}

// Additional Commutativity and Associativity Rules
export class CommutativityANDAND extends Rule {
  constructor() {
    super('Commutativity (AND-AND)', 'comm_assoc', '(P ∧ Q) ∧ R ⟺ Q ∧ (P ∧ R)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isConjunction(expression) && isConjunction(expression.left);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isConjunction(expression) || !isConjunction(expression.left)) {
      throw new Error('Cannot apply AND-AND commutativity');
    }
    const left = expression.left as Conjunction;
    return new Conjunction(left.right, new Conjunction(left.left, expression.right));
  }
}

export class CommutativityOROR extends Rule {
  constructor() {
    super('Commutativity (OR-OR)', 'comm_assoc', '(P ∨ Q) ∨ R ⟺ Q ∨ (P ∨ R)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isDisjunction(expression) && isDisjunction(expression.left);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isDisjunction(expression) || !isDisjunction(expression.left)) {
      throw new Error('Cannot apply OR-OR commutativity');
    }
    const left = expression.left as Disjunction;
    return new Disjunction(left.right, new Disjunction(left.left, expression.right));
  }
}

// Additional Distributivity Rules
export class DistributivityANDReverse extends Rule {
  constructor() {
    super('Distributivity (AND Reverse)', 'distr', '(P ∧ Q) ∨ (P ∧ R) ⟺ P ∧ (Q ∨ R)');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isDisjunction(expression)) return false;
    const left = expression.left;
    const right = expression.right;
    return isConjunction(left) && isConjunction(right) && left.left.equals(right.left);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isDisjunction(expression)) {
      throw new Error('Cannot apply AND distributivity reverse to non-disjunction');
    }
    const left = expression.left as Conjunction;
    const right = expression.right as Conjunction;
    return new Conjunction(left.left, new Disjunction(left.right, right.right));
  }
}

export class DistributivityORReverse extends Rule {
  constructor() {
    super('Distributivity (OR Reverse)', 'distr', '(P ∨ Q) ∧ (P ∨ R) ⟺ P ∨ (Q ∧ R)');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isConjunction(expression)) return false;
    const left = expression.left;
    const right = expression.right;
    return isDisjunction(left) && isDisjunction(right) && left.left.equals(right.left);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isConjunction(expression)) {
      throw new Error('Cannot apply OR distributivity reverse to non-conjunction');
    }
    const left = expression.left as Disjunction;
    const right = expression.right as Disjunction;
    return new Disjunction(left.left, new Conjunction(left.right, right.right));
  }
}

// Contrapositive Rule
export class Contrapositive extends Rule {
  constructor() {
    super('Contrapositive', 'contrapos', '(P ⇒ Q) ⟺ (¬Q ⇒ ¬P)');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isImplication(expression)) return false;
    // Don't apply if already in contrapositive form
    return !(isNegation(expression.left) && isNegation(expression.right));
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isImplication(expression)) {
      throw new Error('Cannot apply contrapositive to non-implication');
    }
    return new Implication(new Negation(expression.right), new Negation(expression.left));
  }
}

// Idempotence Rule
export class Idempotence extends Rule {
  constructor() {
    super('Idempotence', 'idemp', 'P ∧ P ⟺ P ∨ P ⟺ P');
  }

  canApply(expression: BooleanExpression): boolean {
    return (
      (isConjunction(expression) || isDisjunction(expression)) &&
      expression.left.equals(expression.right)
    );
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isBinaryOperation(expression) || !expression.left.equals(expression.right)) {
      throw new Error('Cannot apply idempotence rule');
    }
    return expression.left;
  }
}

// Idempotence Reverse Rules
export class IdempotenceReverseOR extends Rule {
  constructor() {
    super('Idempotence Reverse (OR)', 'idemp', 'P ⟺ P ∨ P');
  }

  canApply(expression: BooleanExpression): boolean {
    // Apply to any expression that's not already an idempotent OR/AND
    return (
      !(isDisjunction(expression) && expression.left.equals(expression.right)) &&
      !(isConjunction(expression) && expression.left.equals(expression.right))
    );
  }

  apply(expression: BooleanExpression): BooleanExpression {
    return new Disjunction(expression, expression.clone());
  }
}

export class IdempotenceReverseAND extends Rule {
  constructor() {
    super('Idempotence Reverse (AND)', 'idemp', 'P ⟺ P ∧ P');
  }

  canApply(expression: BooleanExpression): boolean {
    // Apply to any expression that's not already an idempotent OR/AND
    return (
      !(isDisjunction(expression) && expression.left.equals(expression.right)) &&
      !(isConjunction(expression) && expression.left.equals(expression.right))
    );
  }

  apply(expression: BooleanExpression): BooleanExpression {
    return new Conjunction(expression, expression.clone());
  }
}

// Equivalence Rules
export class Equivalence extends Rule {
  constructor() {
    super('Equivalence', 'equiv', 'P ⟺ Q ⟺ (P ⇒ Q) ∧ (Q ⇒ P)');
  }

  canApply(expression: BooleanExpression): boolean {
    return isBiconditional(expression);
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isBiconditional(expression)) {
      throw new Error('Cannot apply equivalence rule to non-biconditional');
    }
    return new Conjunction(
      new Implication(expression.left, expression.right),
      new Implication(expression.right, expression.left)
    );
  }
}

// Equivalence Reverse Rule
export class EquivalenceReverse extends Rule {
  constructor() {
    super('Equivalence Reverse', 'equiv', '(P ⇒ Q) ∧ (Q ⇒ P) ⟺ P ⟺ Q');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isConjunction(expression)) return false;
    const left = expression.left;
    const right = expression.right;
    return (
      isImplication(left) &&
      isImplication(right) &&
      left.left.equals(right.right) &&
      left.right.equals(right.left)
    );
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isConjunction(expression)) {
      throw new Error('Cannot apply equivalence reverse to non-conjunction');
    }
    const left = expression.left as Implication;
    return new Biconditional(left.left, left.right);
  }
}

// Simplification Rules
export class SimplificationWithTrue extends Rule {
  constructor() {
    super('Simplification (True)', 'simp1', 'P ∧ true ⟺ P, P ∨ false ⟺ P');
  }

  canApply(expression: BooleanExpression): boolean {
    if (isConjunction(expression)) {
      return isTrueConstant(expression.left) || isTrueConstant(expression.right);
    }
    if (isDisjunction(expression)) {
      return isFalseConstant(expression.left) || isFalseConstant(expression.right);
    }
    return false;
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (isConjunction(expression)) {
      if (isTrueConstant(expression.left)) return expression.right;
      if (isTrueConstant(expression.right)) return expression.left;
    }
    if (isDisjunction(expression)) {
      if (isFalseConstant(expression.left)) return expression.right;
      if (isFalseConstant(expression.right)) return expression.left;
    }
    throw new Error('Cannot apply simplification with true/false');
  }
}

export class SimplificationWithFalse extends Rule {
  constructor() {
    super('Simplification (False)', 'simp1', 'P ∨ true ⟺ true, P ∧ false ⟺ false');
  }

  canApply(expression: BooleanExpression): boolean {
    if (isDisjunction(expression)) {
      return isTrueConstant(expression.left) || isTrueConstant(expression.right);
    }
    if (isConjunction(expression)) {
      return isFalseConstant(expression.left) || isFalseConstant(expression.right);
    }
    return false;
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (isDisjunction(expression)) {
      return new TrueConstant();
    }
    if (isConjunction(expression)) {
      return new FalseConstant();
    }
    throw new Error('Cannot apply simplification with true/false');
  }
}

// Additional Simplification Rules
export class Simplification1AndReverse extends Rule {
  constructor() {
    super('Simplification 1 (AND Reverse)', 'simp1', 'P ⟺ P ∧ True');
  }

  canApply(expression: BooleanExpression): boolean {
    return (
      !(
        isConjunction(expression) &&
        (isTrueConstant(expression.left) || isTrueConstant(expression.right))
      ) &&
      !(
        isDisjunction(expression) &&
        (isFalseConstant(expression.left) || isFalseConstant(expression.right))
      )
    );
  }

  apply(expression: BooleanExpression): BooleanExpression {
    return new Conjunction(expression, new TrueConstant());
  }
}

export class Simplification1OrReverse extends Rule {
  constructor() {
    super('Simplification 1 (OR Reverse)', 'simp1', 'P ⟺ P ∨ False');
  }

  canApply(expression: BooleanExpression): boolean {
    return (
      !(
        isConjunction(expression) &&
        (isTrueConstant(expression.left) || isTrueConstant(expression.right))
      ) &&
      !(
        isDisjunction(expression) &&
        (isFalseConstant(expression.left) || isFalseConstant(expression.right))
      )
    );
  }

  apply(expression: BooleanExpression): BooleanExpression {
    return new Disjunction(expression, new FalseConstant());
  }
}

export class Simplification1True extends Rule {
  constructor() {
    super('Simplification 1 (True)', 'simp1', 'P ∨ True ⟺ True');
  }

  canApply(expression: BooleanExpression): boolean {
    return (
      isDisjunction(expression) &&
      (isTrueConstant(expression.left) || isTrueConstant(expression.right))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_expression: BooleanExpression): BooleanExpression {
    return new TrueConstant();
  }
}

export class Simplification1False extends Rule {
  constructor() {
    super('Simplification 1 (False)', 'simp1', 'P ∧ False ⟺ False');
  }

  canApply(expression: BooleanExpression): boolean {
    return (
      isConjunction(expression) &&
      (isFalseConstant(expression.left) || isFalseConstant(expression.right))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_expression: BooleanExpression): BooleanExpression {
    return new FalseConstant();
  }
}

export class Simplification2Or extends Rule {
  constructor() {
    super('Simplification 2 (OR)', 'simp2', 'P ∨ (P ∧ Q) ⟺ P');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isDisjunction(expression)) return false;

    const left = expression.left;
    const right = expression.right;

    // Check P ∨ (P ∧ Q) pattern
    if (isConjunction(right)) {
      return left.equals(right.left) || left.equals(right.right);
    }

    // Check (P ∧ Q) ∨ P pattern
    if (isConjunction(left)) {
      return right.equals(left.left) || right.equals(left.right);
    }

    return false;
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isDisjunction(expression)) {
      throw new Error('Cannot apply OR simplification 2 to non-disjunction');
    }

    const left = expression.left;
    const right = expression.right;

    if (isConjunction(right)) {
      return left; // P ∨ (P ∧ Q) = P
    } else {
      return right; // (P ∧ Q) ∨ P = P
    }
  }
}

export class Simplification2And extends Rule {
  constructor() {
    super('Simplification 2 (AND)', 'simp2', 'P ∧ (P ∨ Q) ⟺ P');
  }

  canApply(expression: BooleanExpression): boolean {
    if (!isConjunction(expression)) return false;

    const left = expression.left;
    const right = expression.right;

    // Check P ∧ (P ∨ Q) pattern
    if (isDisjunction(right)) {
      return left.equals(right.left) || left.equals(right.right);
    }

    // Check (P ∨ Q) ∧ P pattern
    if (isDisjunction(left)) {
      return right.equals(left.left) || right.equals(left.right);
    }

    return false;
  }

  apply(expression: BooleanExpression): BooleanExpression {
    if (!isConjunction(expression)) {
      throw new Error('Cannot apply AND simplification 2 to non-conjunction');
    }

    const left = expression.left;
    const right = expression.right;

    if (isDisjunction(right)) {
      return left; // P ∧ (P ∨ Q) = P
    } else {
      return right; // (P ∨ Q) ∧ P = P
    }
  }
}

// Export all transformation rules
export const ALL_TRANSFORMATION_RULES: TransformationRule[] = [
  // Commutativity and Associativity
  new CommutativityAND(),
  new CommutativityOR(),
  new CommutativityIFF(),
  new CommutativityANDAND(),
  new CommutativityOROR(),

  // Double Negation
  new DoubleNegation(),

  // Excluded Middle and Contradiction
  new ExcludedMiddle(),
  new Contradiction(),

  // De Morgan's Laws
  new DeMorganAND(),
  new DeMorganOR(),
  new DeMorganANDReverse(),
  new DeMorganORReverse(),

  // Implication
  new ImplicationElimination(),
  new ImplicationEliminationReverse(),
  new Contrapositive(),

  // Distributivity
  new DistributivityAND(),
  new DistributivityOR(),
  new DistributivityANDReverse(),
  new DistributivityORReverse(),

  // Idempotence
  new Idempotence(),
  new IdempotenceReverseOR(),
  new IdempotenceReverseAND(),

  // Equivalence
  new Equivalence(),
  new EquivalenceReverse(),

  // Simplification
  new SimplificationWithTrue(),
  new SimplificationWithFalse(),
  new Simplification1AndReverse(),
  new Simplification1OrReverse(),
  new Simplification1True(),
  new Simplification1False(),
  new Simplification2Or(),
  new Simplification2And(),
];

// Group rules by category
export const RULES_BY_CATEGORY = ALL_TRANSFORMATION_RULES.reduce(
  (acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  },
  {} as Record<string, TransformationRule[]>
);
