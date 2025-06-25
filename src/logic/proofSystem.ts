/**
 * Transformational Proof System
 *
 * This module implements algorithms for finding transformation paths between
 * Boolean expressions using logical rules. It uses breadth-first search to
 * find the shortest proof sequence.
 */

import {
  BooleanExpression,
  Negation,
  BinaryOperation,
  Conjunction,
  Disjunction,
  Implication,
  Biconditional,
  isNegation,
  isBinaryOperation,
} from './expressions';
import { TransformationRule, ALL_TRANSFORMATION_RULES } from './rules';

export interface ProofStep {
  expression: BooleanExpression;
  rule: TransformationRule | null;
  appliedToSubexpression?: BooleanExpression;
  stepNumber: number;
}

export interface TransformationProof {
  startExpression: BooleanExpression;
  targetExpression: BooleanExpression;
  steps: ProofStep[];
  found: boolean;
  searchDepth: number;
  totalStatesExplored: number;
}

export interface ProofSearchOptions {
  maxDepth?: number;
  maxStates?: number;
  maxExpressionLength?: number;
  rules?: TransformationRule[];
  onProgress?: (statesExplored: number, depth: number) => void;
}

/**
 * Internal proof node for search algorithm
 */
interface ProofNode {
  expression: BooleanExpression;
  parent: ProofNode | null;
  rule: TransformationRule | null;
  appliedToSubexpression?: BooleanExpression;
  depth: number;
}

/**
 * Find a transformation proof between two expressions
 */
export function findTransformationProof(
  startExpression: BooleanExpression,
  targetExpression: BooleanExpression,
  options: ProofSearchOptions = {}
): TransformationProof {
  const {
    maxDepth = 15,
    maxStates = 10000,
    maxExpressionLength = 15,
    rules = ALL_TRANSFORMATION_RULES,
    onProgress,
  } = options;

  // Check if expressions are already equal
  if (startExpression.equals(targetExpression)) {
    return {
      startExpression,
      targetExpression,
      steps: [{ expression: startExpression, rule: null, stepNumber: 1 }],
      found: true,
      searchDepth: 0,
      totalStatesExplored: 1,
    };
  }

  const queue: ProofNode[] = [
    {
      expression: startExpression,
      parent: null,
      rule: null,
      depth: 0,
    },
  ];

  const visited = new Set<string>();
  visited.add(startExpression.getHash());

  let statesExplored = 0;
  let maxDepthReached = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    statesExplored++;

    // Update progress
    if (onProgress && statesExplored % 100 === 0) {
      onProgress(statesExplored, current.depth);
    }

    // Check termination conditions
    if (statesExplored >= maxStates) {
      break;
    }

    if (current.depth >= maxDepth) {
      continue;
    }

    maxDepthReached = Math.max(maxDepthReached, current.depth);

    // Get all possible transformations from current expression
    const transformations = getAllPossibleTransformations(
      current.expression,
      rules,
      maxExpressionLength
    );

    for (const { newExpression, rule, appliedToSubexpression } of transformations) {
      const hash = newExpression.getHash();

      // Skip if we've already visited this expression
      if (visited.has(hash)) {
        continue;
      }

      visited.add(hash);

      const newNode: ProofNode = {
        expression: newExpression,
        parent: current,
        rule,
        appliedToSubexpression,
        depth: current.depth + 1,
      };

      // Check if we found the target
      if (newExpression.equals(targetExpression)) {
        const steps = reconstructProof(newNode);
        return {
          startExpression,
          targetExpression,
          steps,
          found: true,
          searchDepth: newNode.depth,
          totalStatesExplored: statesExplored,
        };
      }

      queue.push(newNode);
    }
  }

  // No proof found
  return {
    startExpression,
    targetExpression,
    steps: [],
    found: false,
    searchDepth: maxDepthReached,
    totalStatesExplored: statesExplored,
  };
}

/**
 * Get all possible transformations that can be applied to an expression
 */
function getAllPossibleTransformations(
  expression: BooleanExpression,
  rules: TransformationRule[],
  maxLength: number
): Array<{
  newExpression: BooleanExpression;
  rule: TransformationRule;
  appliedToSubexpression?: BooleanExpression;
}> {
  const transformations: Array<{
    newExpression: BooleanExpression;
    rule: TransformationRule;
    appliedToSubexpression?: BooleanExpression;
  }> = [];

  // Apply rules to the root expression
  for (const rule of rules) {
    if (rule.canApply(expression)) {
      try {
        const newExpression = rule.apply(expression);
        if (newExpression.getLength() <= maxLength) {
          transformations.push({
            newExpression,
            rule,
            appliedToSubexpression: expression,
          });
        }
      } catch (error) {
        // Skip rules that throw errors
        console.warn(`Rule ${rule.name} failed to apply:`, error);
      }
    }
  }

  // Apply rules to sub-expressions recursively
  const subTransformations = getSubexpressionTransformations(expression, rules, maxLength);
  transformations.push(...subTransformations);

  return transformations;
}

/**
 * Apply rules to sub-expressions of the given expression
 */
function getSubexpressionTransformations(
  expression: BooleanExpression,
  rules: TransformationRule[],
  maxLength: number
): Array<{
  newExpression: BooleanExpression;
  rule: TransformationRule;
  appliedToSubexpression?: BooleanExpression;
}> {
  const transformations: Array<{
    newExpression: BooleanExpression;
    rule: TransformationRule;
    appliedToSubexpression?: BooleanExpression;
  }> = [];

  // Handle negation
  if (isNegation(expression)) {
    const innerTransformations = getAllPossibleTransformations(
      expression.expression,
      rules,
      maxLength - 1
    );

    for (const { newExpression: newInner, rule, appliedToSubexpression } of innerTransformations) {
      const newExpression = new Negation(newInner);
      if (newExpression.getLength() <= maxLength) {
        transformations.push({
          newExpression,
          rule,
          appliedToSubexpression,
        });
      }
    }
  }

  // Handle binary operations
  if (isBinaryOperation(expression)) {
    // Transform left side
    const leftTransformations = getAllPossibleTransformations(
      expression.left,
      rules,
      maxLength - expression.right.getLength() - 1
    );

    for (const { newExpression: newLeft, rule, appliedToSubexpression } of leftTransformations) {
      const newExpression = createBinaryOperation(expression, newLeft, expression.right);
      if (newExpression.getLength() <= maxLength) {
        transformations.push({
          newExpression,
          rule,
          appliedToSubexpression,
        });
      }
    }

    // Transform right side
    const rightTransformations = getAllPossibleTransformations(
      expression.right,
      rules,
      maxLength - expression.left.getLength() - 1
    );

    for (const { newExpression: newRight, rule, appliedToSubexpression } of rightTransformations) {
      const newExpression = createBinaryOperation(expression, expression.left, newRight);
      if (newExpression.getLength() <= maxLength) {
        transformations.push({
          newExpression,
          rule,
          appliedToSubexpression,
        });
      }
    }
  }

  return transformations;
}

/**
 * Reconstruct the proof steps from the final node
 */
function reconstructProof(finalNode: ProofNode): ProofStep[] {
  const steps: ProofStep[] = [];
  const nodes: ProofNode[] = [];

  // Collect all nodes from final to start
  let current: ProofNode | null = finalNode;
  while (current) {
    nodes.unshift(current);
    current = current.parent;
  }

  // Convert nodes to proof steps
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    steps.push({
      expression: node.expression,
      rule: node.rule,
      appliedToSubexpression: node.appliedToSubexpression,
      stepNumber: i + 1,
    });
  }

  return steps;
}

/**
 * Format a transformation proof as a readable string
 */
export function formatTransformationProof(proof: TransformationProof): string {
  if (!proof.found) {
    return (
      `No transformation found from ${proof.startExpression.toString()} to ${proof.targetExpression.toString()}\n` +
      `Search explored ${proof.totalStatesExplored} states to depth ${proof.searchDepth}`
    );
  }

  // Header with biconditional format
  let result = `${proof.startExpression.toString()}  <->  ${proof.targetExpression.toString()}\n\n`;

  // Calculate the maximum width needed for step number + expression part
  let maxStepWidth = 0;
  for (let i = 0; i < proof.steps.length; i++) {
    const step = proof.steps[i];
    const stepPrefix = `${step.stepNumber}) ${step.expression.toString()}`;
    maxStepWidth = Math.max(maxStepWidth, stepPrefix.length);
  }

  // Add some padding for alignment
  const alignmentPosition = maxStepWidth + 3;

  // Steps with numbered format and aligned "by" statements
  for (let i = 0; i < proof.steps.length; i++) {
    const step = proof.steps[i];
    const stepPrefix = `${step.stepNumber}) ${step.expression.toString()}`;

    if (i === 0) {
      // First step is just the starting expression
      result += `${stepPrefix}\n`;
    } else {
      // Subsequent steps show rule category, aligned
      const ruleName = step.rule?.category || 'unknown';
      const padding = ' '.repeat(Math.max(1, alignmentPosition - stepPrefix.length));
      result += `${stepPrefix}${padding}by ${ruleName}\n`;
    }
  }

  return result;
}

/**
 * Check if a transformation is possible (without finding the full proof)
 */
export function isTransformationPossible(
  startExpression: BooleanExpression,
  targetExpression: BooleanExpression,
  options: Omit<ProofSearchOptions, 'onProgress'> = {}
): boolean {
  const proof = findTransformationProof(startExpression, targetExpression, {
    ...options,
    maxDepth: Math.min(options.maxDepth || 10, 10), // Limit depth for quick check
    maxStates: Math.min(options.maxStates || 1000, 1000), // Limit states for quick check
  });

  return proof.found;
}

/**
 * Helper function to create a new binary operation with the same constructor
 */
function createBinaryOperation(
  originalExpression: BinaryOperation,
  left: BooleanExpression,
  right: BooleanExpression
): BinaryOperation {
  if (originalExpression instanceof Conjunction) {
    return new Conjunction(left, right);
  }
  if (originalExpression instanceof Disjunction) {
    return new Disjunction(left, right);
  }
  if (originalExpression instanceof Implication) {
    return new Implication(left, right);
  }
  if (originalExpression instanceof Biconditional) {
    return new Biconditional(left, right);
  }
  throw new Error(`Unknown binary operation type: ${originalExpression.constructor.name}`);
}
