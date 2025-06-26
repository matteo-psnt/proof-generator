/**
 * AST Input Component
 *
 * Specialized input component for Abstract Syntax Tree visualization.
 */

import React from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export function ASTInput() {
  const { currentExpressionString, expressionError, setCurrentExpression } = useAppStore();

  const handleQuickExample = (example: string) => {
    setCurrentExpression(example);
  };

  const generateRandomExpression = () => {
    const variables = ['a', 'b', 'c', 'd', 'e', 'p', 'q', 'r', 's', 'u', 'x', 'y', 'z'];
    const constants = ['true', 'false'];
    const operators = ['&', '|', '=>', '<=>', '!'];
    const complexityLevels = [1, 2, 3]; // 1 = simple, 2 = medium, 3 = complex

    const getRandomVariable = () => variables[Math.floor(Math.random() * variables.length)];
    const getRandomConstant = () => constants[Math.floor(Math.random() * constants.length)];
    const getRandomOperand = () => {
      // 80% chance for variable, 20% chance for constant
      return Math.random() < 0.8 ? getRandomVariable() : getRandomConstant();
    };
    const getRandomOperator = () => operators[Math.floor(Math.random() * operators.length)];
    const complexity = complexityLevels[Math.floor(Math.random() * complexityLevels.length)];

    const generateSubExpression = (depth: number): string => {
      if (depth === 0) {
        return getRandomOperand();
      }

      const operator = getRandomOperator();

      if (operator === '!') {
        return `!${generateSubExpression(depth - 1)}`;
      } else {
        const left = generateSubExpression(depth - 1);
        const right = generateSubExpression(depth - 1);
        return `(${left} ${operator} ${right})`;
      }
    };

    return generateSubExpression(complexity);
  };

  const handleRandomExample = () => {
    const randomExpression = generateRandomExpression();
    setCurrentExpression(randomExpression);
  };

  const quickExamples = ['(p & q) → r', 'a | (b & !c)', '(x ↔ y) & z', '!(a & b) | c'];

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Eye className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Expression for Tree Visualization</h3>
      </div>

      <div className="space-y-4">
        {/* Main Input */}
        <div>
          <label
            htmlFor="ast-expression-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Expression
          </label>
          <div className="relative">
            <input
              id="ast-expression-input"
              type="text"
              value={currentExpressionString}
              onChange={(e) => setCurrentExpression(e.target.value)}
              placeholder="Enter expression to visualize (e.g., (p & q) → r)"
              className={`input font-mono ${
                expressionError ? 'border-red-300 focus:ring-red-500' : ''
              }`}
            />
            <button
              onClick={handleRandomExample}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Generate random example"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {expressionError && <p className="mt-2 text-sm text-red-600">{expressionError}</p>}
        </div>

        {/* Quick Examples */}
        <div>
          <label htmlFor="quick-examples" className="block text-sm font-medium text-gray-700 mb-2">
            Quick examples
          </label>
          <div id="quick-examples" className="flex flex-wrap gap-2">
            {quickExamples.map((example) => (
              <button
                key={example}
                onClick={() => handleQuickExample(example)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 font-mono"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
