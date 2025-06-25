/**
 * Rule Selector Component
 *
 * Interface for selecting which transformation rules to use in proofs.
 */

import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { ALL_TRANSFORMATION_RULES, RULES_BY_CATEGORY } from '../logic/rules';

interface RuleSelectorProps {
  selectedRules: Set<string>;
  onRuleToggle: (ruleName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function RuleSelector({
  selectedRules,
  onRuleToggle,
  onSelectAll,
  onDeselectAll,
}: Readonly<RuleSelectorProps>) {
  const allSelected = selectedRules.size === ALL_TRANSFORMATION_RULES.length;
  const noneSelected = selectedRules.size === 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transformation Rules</h3>

        <div className="flex space-x-2">
          <button onClick={onSelectAll} disabled={allSelected} className="btn-outline text-sm">
            <CheckSquare className="h-4 w-4 mr-1" />
            All
          </button>

          <button onClick={onDeselectAll} disabled={noneSelected} className="btn-outline text-sm">
            <Square className="h-4 w-4 mr-1" />
            None
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Select which logical transformation rules to use when searching for proofs. More rules may
        find more solutions but will take longer to search.
      </div>

      <div className="space-y-6">
        {Object.entries(RULES_BY_CATEGORY).map(([category, rules]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3 capitalize">
              {category.replace('_', ' & ')} Rules
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {rules.map((rule) => (
                <label
                  key={rule.name}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRules.has(rule.name)}
                    onChange={() => onRuleToggle(rule.name)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    aria-label={rule.name}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{rule.name}</div>
                    <div className="text-xs text-gray-600 mt-1 font-mono">{rule.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>Selected:</strong> {selectedRules.size} of {ALL_TRANSFORMATION_RULES.length} rules
        </div>
        {selectedRules.size === 0 && (
          <div className="text-sm text-blue-700 mt-1">
            ⚠️ No rules selected - proof search will not be possible
          </div>
        )}
      </div>
    </div>
  );
}
