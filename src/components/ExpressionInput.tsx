/**
 * Expression Input Component
 * 
 * Main input component for entering and managing Boolean expressions.
 */

import React, { useState, useEffect } from 'react';
import { Trash2, Copy } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface ExpressionInputProps {
  showSyntaxHelp?: boolean;
  variant?: 'default' | 'ast';
  title?: string;
  placeholder?: string;
}

export function ExpressionInput({ 
  showSyntaxHelp = true, 
  variant = 'default',
  title = 'Enter Boolean Expression',
  placeholder = 'Enter a Boolean expression (e.g., (a & b) | !c)'
}: ExpressionInputProps) {
  const { 
    currentExpression, 
    currentExpressionString, 
    expressionError,
    setCurrentExpression 
  } = useAppStore();

  const [inputValue, setInputValue] = useState(currentExpressionString);

  // Sync local input with store
  useEffect(() => {
    setInputValue(currentExpressionString);
  }, [currentExpressionString]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setCurrentExpression(value);
  };

  const handleClear = () => {
    setInputValue('');
    setCurrentExpression('');
  };

  const handleCopy = () => {
    if (currentExpression) {
      navigator.clipboard.writeText(currentExpression.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          {variant === 'ast' && (
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01.293.707v2.586l2.293 2.293A1 1 0 0112 13h4a1 1 0 110 2h-4a1 1 0 01-.707-.293L9 12.414V9.828L6.707 7.535A1 1 0 016 7H4a1 1 0 01-1-1V4z" clipRule="evenodd" />
            </svg>
          )}
          {title}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="expression-input" className="block text-sm font-medium text-gray-700 mb-2">
              Expression
            </label>
            <input
              id="expression-input"
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className={`input font-mono ${expressionError ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {expressionError && (
              <p className="mt-2 text-sm text-red-600">{expressionError}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClear}
              className="btn-secondary"
              disabled={!inputValue}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </button>
            
            <button
              onClick={handleCopy}
              className="btn-outline"
              disabled={!currentExpression}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Expression Display */}
      {currentExpression && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {variant === 'ast' ? 'Expression for AST Visualization' : 'Parsed Expression'}
          </h3>
          <div className="expression">
            {currentExpression.toString()}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Variables:</span> {Array.from(currentExpression.getVariables()).join(', ') || 'None'}
            </div>
            <div>
              <span className="font-medium">Length:</span> {currentExpression.getLength()}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {showSyntaxHelp && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Expression Syntax</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div><strong>AND:</strong> &, ∧, ^, &&, AND, and, *, .</div>
            <div><strong>OR:</strong> |, ∨, v, ||, OR, or, +</div>
            <div><strong>NOT:</strong> !, ¬, ~, NOT, not</div>
            <div><strong>IMPLIES:</strong> {'=>'}, →, {'->'}, IMP, imp, implies</div>
            <div><strong>IFF:</strong> {'<=>'}, ↔, {'<->'}, IFF, iff, equiv</div>
            <div><strong>Constants:</strong> true, false, TRUE, True, FALSE, False, T, t, F, f, 1, 0</div>
            <div><strong>Variables:</strong> Any alphanumeric identifier (a, b, P, Q, var1, etc.)</div>
            <div><strong>Grouping:</strong> Use parentheses ( ) to control precedence</div>
          </div>
        </div>
      )}
    </div>
  );
}
