/**
 * Truth Table View Component
 *
 * Displays truth tables for Boolean expressions with analysis and export options.
 */

import React, { useState, useEffect } from 'react';
import { Download, Copy, AlertTriangle } from 'lucide-react';
import {
  generateTruthTable,
  formatTruthTable,
  truthTableToCSV,
  analyzeTruthTable,
  validateVariableCount,
  MAX_TRUTH_TABLE_VARIABLES,
  TruthTable,
  TruthTableAnalysis,
  TruthTableRow,
} from '../logic/truthTable';
import { useAppStore } from '../store/appStore';

export function TruthTableView() {
  const {
    currentExpression,
    currentExpressionString,
    expressionError,
    setCurrentExpression,
    useSymbolsInTruthTable,
    toggleUseSymbolsInTruthTable,
  } = useAppStore();

  const [truthTable, setTruthTable] = useState<TruthTable | null>(null);
  const [analysis, setAnalysis] = useState<TruthTableAnalysis | null>(null);
  const [variableWarning, setVariableWarning] = useState<{ count: number; warning: string } | null>(
    null
  );

  // Generate truth table when current expression changes
  useEffect(() => {
    if (!currentExpression) {
      setTruthTable(null);
      setAnalysis(null);
      setVariableWarning(null);
      return;
    }

    // Check variable count for warnings
    const varValidation = validateVariableCount(currentExpression);

    if (!varValidation.valid) {
      setTruthTable(null);
      setAnalysis(null);
      setVariableWarning(null);
      return;
    }

    // Show warning for expressions with many variables (but still within limit)
    if (varValidation.variableCount > 10) {
      setVariableWarning({
        count: varValidation.variableCount,
        warning: `This expression has ${varValidation.variableCount} variables, which will generate ${Math.pow(2, varValidation.variableCount).toLocaleString()} truth table rows. Consider using smaller expressions for better performance.`,
      });
    } else {
      setVariableWarning(null);
    }

    const table = generateTruthTable(currentExpression);
    const tableAnalysis = analyzeTruthTable(table);

    setTruthTable(table);
    setAnalysis(tableAnalysis);
  }, [currentExpression]);

  const handleCopy = () => {
    if (truthTable) {
      const formatted = formatTruthTable(truthTable, { useSymbols: useSymbolsInTruthTable });
      navigator.clipboard.writeText(formatted);
    }
  };

  const handleDownloadCSV = () => {
    if (truthTable) {
      const csv = truthTableToCSV(truthTable);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'truth-table.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Truth Table</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="truth-table-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Boolean Expression
            </label>
            <input
              id="truth-table-input"
              type="text"
              value={currentExpressionString}
              onChange={(e) => setCurrentExpression(e.target.value)}
              placeholder="Enter a Boolean expression (e.g., (a & b) | !c)"
              className={`input font-mono ${expressionError ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {expressionError && <p className="mt-2 text-sm text-red-600">{expressionError}</p>}
            {variableWarning && !expressionError && (
              <div className="mt-2 flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Performance Warning</p>
                  <p>{variableWarning.warning}</p>
                  <p className="mt-1 text-xs">
                    Maximum allowed: {MAX_TRUTH_TABLE_VARIABLES} variables (
                    {Math.pow(2, MAX_TRUTH_TABLE_VARIABLES).toLocaleString()} rows)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useSymbolsInTruthTable}
                  onChange={toggleUseSymbolsInTruthTable}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Use T/F symbols</span>
              </label>
            </div>

            {truthTable && (
              <div className="flex space-x-2">
                <button onClick={handleCopy} className="btn-outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </button>

                <button onClick={handleDownloadCSV} className="btn-outline">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
              </div>
            )}
          </div>

          {/* Variable count warning */}
          {variableWarning && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
              <p className="text-sm">{variableWarning.warning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis */}
      {analysis && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.satisfiableCount}</div>
              <div className="text-sm text-gray-600">Satisfiable</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{analysis.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>

            <div className="text-center">
              {(() => {
                let analysisTypeClass = '';
                if (analysis.isTautology) {
                  analysisTypeClass = 'text-green-600';
                } else if (analysis.isContradiction) {
                  analysisTypeClass = 'text-red-600';
                } else {
                  analysisTypeClass = 'text-yellow-600';
                }

                let analysisTypeLabel = '';
                if (analysis.isTautology) {
                  analysisTypeLabel = 'Tautology';
                } else if (analysis.isContradiction) {
                  analysisTypeLabel = 'Contradiction';
                } else {
                  analysisTypeLabel = 'Contingent';
                }

                return (
                  <div className={`text-2xl font-bold ${analysisTypeClass}`}>
                    {analysisTypeLabel}
                  </div>
                );
              })()}
              <div className="text-sm text-gray-600">Type</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(analysis.satisfiabilityRatio * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      )}

      {/* Truth Table Display */}
      {truthTable && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Truth Table</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {truthTable.variables.map((variable: string) => (
                    <th
                      key={variable}
                      className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900"
                    >
                      {variable}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {truthTable.rows.map((row: TruthTableRow) => {
                  const rowKey = JSON.stringify(row.assignment) + '-' + String(row.result);
                  const rowIndex = truthTable.rows.findIndex(
                    (r) =>
                      JSON.stringify(r.assignment) === JSON.stringify(row.assignment) &&
                      r.result === row.result
                  );
                  return (
                    <tr key={rowKey} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {truthTable.variables.map((variable: string) => (
                        <td
                          key={variable}
                          className="border border-gray-300 px-4 py-2 font-mono text-center"
                        >
                          {(() => {
                            if (useSymbolsInTruthTable) {
                              return row.assignment[variable] ? 'T' : 'F';
                            } else {
                              return row.assignment[variable] ? 'true' : 'false';
                            }
                          })()}
                        </td>
                      ))}
                      <td
                        className={`border border-gray-300 px-4 py-2 font-mono text-center font-bold ${
                          row.result ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {(() => {
                          if (useSymbolsInTruthTable) {
                            return row.result ? 'T' : 'F';
                          } else {
                            return row.result ? 'true' : 'false';
                          }
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
