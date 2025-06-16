/**
 * Main Content Component
 * 
 * Container for the main application content that switches based on active tab.
 */

import React from 'react';
import { ProofView } from './ProofView';
import { ExpressionInput } from './ExpressionInput';
import { ASTInput } from './ASTInput';
import { TruthTableView } from './TruthTableView';
import ASTVisualization from './ASTVisualization';
import { useAppStore } from '../store/appStore';

interface MainContentProps {
  activeTab: 'proof' | 'expression' | 'ast' | 'truth-table';
  className?: string;
}

export function MainContent({ activeTab, className }: MainContentProps) {
  const { currentExpression } = useAppStore();
  
  return (
    <main className={className}>
      <div className="p-6">

        {activeTab === 'proof' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Transformation Proofs</h2>
              <p className="text-gray-600 mb-6">
                Find step-by-step transformations between Boolean expressions using logical rules.
              </p>
            </div>
            <ProofView />
          </div>
        )}

        {activeTab === 'expression' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Boolean Expression Explorer</h2>
              <p className="text-gray-600 mb-6">
                Enter Boolean expressions to analyze, transform, and explore their properties.
              </p>
            </div>
            <ExpressionInput 
              title="Enter Boolean Expression to Explore"
              placeholder="Enter a Boolean expression to analyze and transform (e.g., (a & b) | !c)"
            />
          </div>
        )}

        {activeTab === 'ast' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Abstract Syntax Tree</h2>
              <p className="text-gray-600 mb-6">
                Visualize the structure of Boolean expressions as interactive AST diagrams.
              </p>
            </div>
            <ASTInput />
            <div className="h-96 lg:h-[600px]">
              <ASTVisualization expression={currentExpression} />
            </div>
          </div>
        )}
        
        {activeTab === 'truth-table' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Truth Tables</h2>
              <p className="text-gray-600 mb-6">
                Generate and analyze truth tables for Boolean expressions.
              </p>
            </div>
            <TruthTableView />
          </div>
        )}
      </div>
    </main>
  );
}
