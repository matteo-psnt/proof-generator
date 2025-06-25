/**
 * Proof View Component
 *
 * Interface for finding and displaying transformation proofs between expressions.
 */

import React, { useState, useEffect } from 'react';
import { Play, Square, Copy, Settings, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { RuleSelector } from './RuleSelector';
import { useAppStore } from '../store/appStore';
import {
  findTransformationProof,
  formatTransformationProof,
  TransformationProof,
  ProofStep,
} from '../logic/proofSystem';
import { parseToExpression, validateExpression } from '../logic';
import { ALL_TRANSFORMATION_RULES } from '../logic/rules';

export function ProofView() {
  const {
    startExpressionString,
    startExpressionError,
    targetExpressionString,
    targetExpressionError,
    setStartExpression,
    setTargetExpression,
  } = useAppStore();

  const [proof, setProof] = useState<TransformationProof | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRules, setSelectedRules] = useState(
    new Set(ALL_TRANSFORMATION_RULES.map((r) => r.name))
  );
  const [maxDepth, setMaxDepth] = useState(15);
  const [maxExpressionLength, setMaxExpressionLength] = useState(15);
  const [maxStates, setMaxStates] = useState(10000);
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [searchAbortController, setSearchAbortController] = useState<AbortController | null>(null);
  const [autoCalculateLength, setAutoCalculateLength] = useState(true);
  const [manualMaxLength, setManualMaxLength] = useState(15);

  // Helper function to safely parse expression and get length
  const getExpressionLength = (value: string): number => {
    if (value.trim() === '') return 0;

    const validation = validateExpression(value);
    if (validation.valid) {
      try {
        const parsed = parseToExpression(value);
        return parsed.getLength();
      } catch {
        return 0;
      }
    }
    return 0;
  };

  // Automatically update maxExpressionLength based on start and target expressions
  useEffect(() => {
    if (!autoCalculateLength) return;

    let maxLength = 0;

    // Get length of start expression if valid
    const startLength = getExpressionLength(startExpressionString);
    maxLength = Math.max(maxLength, startLength);

    // Get length of target expression if valid
    const targetLength = getExpressionLength(targetExpressionString);
    maxLength = Math.max(maxLength, targetLength);

    // Set maxExpressionLength to +1 longer than the longest expression, minimum 10
    const newMaxLength = Math.max(10, maxLength + 1);
    setMaxExpressionLength(newMaxLength);
  }, [startExpressionString, targetExpressionString, autoCalculateLength]);

  // Handle toggling between auto and manual length calculation
  useEffect(() => {
    if (!autoCalculateLength) {
      // When switching to manual, restore the manual value
      setMaxExpressionLength(manualMaxLength);
    }
    // When switching to auto, the other useEffect will handle the calculation
  }, [autoCalculateLength, manualMaxLength]);

  const validateInput = (value: string, setError: (error: string | null) => void) => {
    if (value.trim() === '') {
      setError(null);
      return null;
    }

    const validation = validateExpression(value);
    if (validation.valid) {
      try {
        const parsed = parseToExpression(value);
        setError(null);
        return parsed;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Parse error';
        setError(errorMsg);
        return null;
      }
    } else {
      setError(validation.error ?? 'Invalid expression');
      return null;
    }
  };

  const handleStartChange = (value: string) => {
    setStartExpression(value);
    setProof(null);
  };

  const handleTargetChange = (value: string) => {
    setTargetExpression(value);
    setProof(null);
  };

  const handleSearch = async () => {
    const startExpr = validateInput(startExpressionString, () => {});
    const targetExpr = validateInput(targetExpressionString, () => {});

    if (!startExpr || !targetExpr) {
      return;
    }

    const abortController = new AbortController();
    setSearchAbortController(abortController);
    setIsSearching(true);
    setProof(null);
    setShowRuleSelector(false);

    try {
      // Simulate async operation
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 100);
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Search cancelled'));
        });
      });

      if (abortController.signal.aborted) {
        return;
      }

      const activeRules = ALL_TRANSFORMATION_RULES.filter((rule) => selectedRules.has(rule.name));

      const result = findTransformationProof(startExpr, targetExpr, {
        maxDepth,
        maxExpressionLength,
        maxStates,
        rules: activeRules,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onProgress: (_states, _depth) => {
          // Could update progress indicator here
          if (abortController.signal.aborted) {
            throw new Error('Search cancelled');
          }
        },
      });

      if (!abortController.signal.aborted) {
        setProof(result);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Search cancelled') {
        console.error('Error searching for proof:', error);
      }
    } finally {
      setIsSearching(false);
      setSearchAbortController(null);
    }
  };

  const handleCancelSearch = () => {
    if (searchAbortController) {
      searchAbortController.abort();
    }
    setIsSearching(false);
    setSearchAbortController(null);
  };

  const handleCopyProof = () => {
    if (proof) {
      const formatted = formatTransformationProof(proof);
      navigator.clipboard.writeText(formatted);
    }
  };

  const canSearch =
    startExpressionString.trim() &&
    targetExpressionString.trim() &&
    !startExpressionError &&
    !targetExpressionError;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Transformation Proof</h3>

        <div className="space-y-4">
          {/* Start Expression */}
          <div>
            <label htmlFor="start-expr" className="block text-sm font-medium text-gray-700 mb-2">
              Start Expression
            </label>
            <input
              id="start-expr"
              type="text"
              value={startExpressionString}
              onChange={(e) => handleStartChange(e.target.value)}
              placeholder="e.g., !(a & b)"
              className={`input font-mono ${
                startExpressionError ? 'border-red-300 focus:ring-red-500' : ''
              }`}
            />
            {startExpressionError && (
              <p className="mt-2 text-sm text-red-600">{startExpressionError}</p>
            )}
          </div>

          {/* Target Expression */}
          <div>
            <label htmlFor="target-expr" className="block text-sm font-medium text-gray-700 mb-2">
              Target Expression
            </label>
            <input
              id="target-expr"
              type="text"
              value={targetExpressionString}
              onChange={(e) => handleTargetChange(e.target.value)}
              placeholder="e.g., !a | !b"
              className={`input font-mono ${
                targetExpressionError ? 'border-red-300 focus:ring-red-500' : ''
              }`}
            />
            {targetExpressionError && (
              <p className="mt-2 text-sm text-red-600">{targetExpressionError}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Left side: Play/Cancel button and Advanced link */}
            <div className="flex flex-col items-start space-y-2">
              <div className="flex space-x-2">
                {isSearching ? (
                  <button onClick={handleCancelSearch} className="btn-secondary">
                    <Square className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                ) : (
                  <button onClick={handleSearch} disabled={!canSearch} className="btn-primary">
                    <Play className="h-4 w-4 mr-2" />
                    Find Proof
                  </button>
                )}
              </div>

              {/* Advanced options toggle */}
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                title="Advanced search options"
              >
                {showAdvancedOptions ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <span>Advanced Options</span>
              </button>
            </div>

            {/* Right side: Rules button */}
            <div>
              <button
                onClick={() => setShowRuleSelector(!showRuleSelector)}
                className="btn-outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Rules ({selectedRules.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Selector */}
      {showRuleSelector && (
        <RuleSelector
          selectedRules={selectedRules}
          onRuleToggle={(ruleName: string) => {
            const newSelected = new Set(selectedRules);
            if (newSelected.has(ruleName)) {
              newSelected.delete(ruleName);
            } else {
              newSelected.add(ruleName);
            }
            setSelectedRules(newSelected);
            setProof(null);
          }}
          onSelectAll={() => {
            setSelectedRules(new Set(ALL_TRANSFORMATION_RULES.map((r) => r.name)));
            setProof(null);
          }}
          onDeselectAll={() => {
            setSelectedRules(new Set());
            setProof(null);
          }}
        />
      )}

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced Search Options</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Max Depth */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label htmlFor="max-depth" className="text-sm font-medium text-gray-700">
                  Max Search Depth
                </label>
                <div className="group relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    How many transformation steps to explore
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  id="max-depth"
                  type="range"
                  min="1"
                  max="30"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-mono min-w-[3rem] text-center">
                  {maxDepth}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Controls how many transformation steps to try in sequence.
              </div>
            </div>

            {/* Max Expression Length */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="max-expression-length"
                    className="text-sm font-medium text-gray-700"
                  >
                    Max Expression Length
                  </label>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {autoCalculateLength
                        ? 'Auto-calculated as max(start, target) length + 1, minimum 10'
                        : 'Manually set maximum expression complexity limit'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Manual</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (autoCalculateLength) {
                        // Store current auto value as manual value before switching
                        setManualMaxLength(maxExpressionLength);
                      }
                      setAutoCalculateLength(!autoCalculateLength);
                    }}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      autoCalculateLength ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        autoCalculateLength ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-600">Auto</span>
                </div>
              </div>

              {autoCalculateLength ? (
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-2 bg-green-200 rounded-lg relative">
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-green-700 font-medium">
                      Auto-calculated
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-md px-3 py-1 text-sm font-mono min-w-[3rem] text-center text-green-700">
                    {maxExpressionLength}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <input
                    id="max-expression-length"
                    type="range"
                    min="5"
                    max="50"
                    value={maxExpressionLength}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setMaxExpressionLength(newValue);
                      setManualMaxLength(newValue);
                    }}
                    className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-mono min-w-[3rem] text-center">
                    {maxExpressionLength}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600">
                {autoCalculateLength
                  ? 'Automatically set to +1 longer than the longest input expression (minimum 10)'
                  : 'Controls complexity limit during proof search. If no proof is found, try increasing this - some solutions require longer intermediate steps.'}
              </div>
            </div>

            {/* Max States */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label htmlFor="max-states" className="text-sm font-medium text-gray-700">
                  Max States
                </label>
                <div className="group relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Maximum search space to explore
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  id="max-states"
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={maxStates}
                  onChange={(e) => setMaxStates(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-mono min-w-[4rem] text-center">
                  {maxStates.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Higher values allow more comprehensive search but use more memory
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Tips:</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Start with lower max depth and increase if needed</li>
                  <li>Alter max expression length if its not finding the proof</li>
                  <li>Enable only the transformation rules you need</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Result */}
      {proof && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {proof.found ? 'Transformation Proof Found' : 'No Proof Found'}
            </h3>

            {proof.found && (
              <div className="flex space-x-2">
                <button onClick={handleCopyProof} className="btn-outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </button>
              </div>
            )}
          </div>

          {proof.found ? (
            <div className="space-y-4">
              {/* Proof Steps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Proof Steps:</h4>
                <div className="space-y-2 font-mono text-sm">
                  {proof.steps.map((step: ProofStep) => (
                    <div key={step.stepNumber + '-' + step.expression.toString()} className="flex items-start space-x-3">
                      <span className="text-gray-500 min-w-[2rem]">{step.stepNumber}.</span>
                      <div className="flex-1">
                        <div className="expression text-gray-900 mb-1">
                          {step.expression.toString()}
                        </div>
                        {step.rule && (
                          <div className="text-xs text-blue-600">by {step.rule.name}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proof Statistics */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{proof.steps.length - 1}</div>
                  <div className="text-gray-600">Steps</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{proof.totalStatesExplored}</div>
                  <div className="text-gray-600">States Explored</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{proof.searchDepth}</div>
                  <div className="text-gray-600">Max Depth</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                No transformation path found between the expressions.
              </div>
              <div className="text-sm text-gray-400">
                Explored {proof.totalStatesExplored} states to depth {proof.searchDepth}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Try increasing the max depth or enabling more rules.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
