/**
 * Sidebar Component
 *
 * Modern left navigation sidebar with clean design.
 */

import React from 'react';
import { GitBranch, Calculator, Network, Grid } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: 'proof' | 'expression' | 'ast' | 'truth-table';
  onTabChange: (tab: 'proof' | 'expression' | 'ast' | 'truth-table') => void;
}

const tabs = [
  {
    id: 'proof' as const,
    label: 'Transformation Proofs',
    shortLabel: 'Proofs',
    icon: GitBranch,
    description: 'Find step-by-step transformations between Boolean expressions',
  },
  {
    id: 'expression' as const,
    label: 'Expression Explorer',
    shortLabel: 'Explorer',
    icon: Calculator,
    description: 'Enter and analyze Boolean expressions',
  },
  {
    id: 'ast' as const,
    label: 'AST Visualizer',
    shortLabel: 'AST',
    icon: Network,
    description: 'Visualize expression structure as trees',
  },
  {
    id: 'truth-table' as const,
    label: 'Truth Tables',
    shortLabel: 'Tables',
    icon: Grid,
    description: 'Generate and analyze truth tables',
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Tools</h2>
        <p className="text-sm text-gray-500 mt-1">Choose a Boolean logic tool</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'w-full group flex flex-col items-start p-4 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isActive
                  ? 'bg-primary-50 border border-primary-200 text-primary-700'
                  : 'hover:bg-gray-50 text-gray-700 border border-transparent'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon
                  className={clsx(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block">{tab.shortLabel}</span>
                  <span className="text-xs text-gray-500 mt-0.5 block leading-tight">
                    {tab.description}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">Boolean Logic Tools</div>
      </div>
    </div>
  );
}
