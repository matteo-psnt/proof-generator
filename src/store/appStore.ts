/**
 * Application State Management
 * 
 * This module provides centralized state management for the Boolean Transformational Prover
 * using Zustand for reactive state updates.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  BooleanExpression, 
  parseToExpression, 
  validateExpression,
  TruthTable,
  generateTruthTable,
  TransformationProof,
  findTransformationProof,
  ALL_TRANSFORMATION_RULES
} from '../logic';

export interface ExpressionState {
  // Current expression being worked with
  currentExpression: BooleanExpression | null;
  currentExpressionString: string;
  expressionError: string | null;
  
  // Start expression for proofs
  startExpression: BooleanExpression | null;
  startExpressionString: string;
  startExpressionError: string | null;
  
  // Target expression for proofs
  targetExpression: BooleanExpression | null;
  targetExpressionString: string;
  targetExpressionError: string | null;
  
  // Truth table
  truthTable: TruthTable | null;
  showTruthTable: boolean;
  
  // Proof system
  currentProof: TransformationProof | null;
  isSearchingProof: boolean;
  proofSearchProgress: { statesExplored: number; depth: number } | null;
  
  // UI state
  selectedRules: Set<string>;
  maxProofDepth: number;
  showASTVisualization: boolean;
  
  // History
  expressionHistory: string[];
  
  // Settings
  useSymbolsInTruthTable: boolean;
  autoGenerateTruthTable: boolean;
}

export interface ExpressionActions {
  // Expression management
  setCurrentExpression: (expr: string) => void;
  clearCurrentExpression: () => void;
  setStartExpression: (expr: string) => void;
  clearStartExpression: () => void;
  setTargetExpression: (expr: string) => void;
  clearTargetExpression: () => void;
  
  // Truth table
  generateTruthTableForCurrent: () => void;
  toggleTruthTableVisibility: () => void;
  clearTruthTable: () => void;
  
  // Proof system
  searchForProof: () => void;
  cancelProofSearch: () => void;
  clearProof: () => void;
  
  // Rule management
  toggleRule: (ruleName: string) => void;
  selectAllRules: () => void;
  deselectAllRules: () => void;
  
  // Settings
  setMaxProofDepth: (depth: number) => void;
  toggleASTVisualization: () => void;
  toggleUseSymbolsInTruthTable: () => void;
  toggleAutoGenerateTruthTable: () => void;
  
  // History
  addToHistory: (expr: string) => void;
  clearHistory: () => void;
  loadFromHistory: (expr: string) => void;
}

export type AppStore = ExpressionState & ExpressionActions;

const initialState: ExpressionState = {
  currentExpression: null,
  currentExpressionString: '',
  expressionError: null,
  
  startExpression: null,
  startExpressionString: '',
  startExpressionError: null,
  
  targetExpression: null,
  targetExpressionString: '',
  targetExpressionError: null,
  
  truthTable: null,
  showTruthTable: false,
  
  currentProof: null,
  isSearchingProof: false,
  proofSearchProgress: null,
  
  selectedRules: new Set(ALL_TRANSFORMATION_RULES.map(rule => rule.name)),
  maxProofDepth: 15,
  showASTVisualization: true,
  
  expressionHistory: [],
  
  useSymbolsInTruthTable: true,
  autoGenerateTruthTable: true,
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Expression management
    setCurrentExpression: (expr: string) => {
      const trimmedExpr = expr.trim();
      
      if (trimmedExpr === '') {
        set({
          currentExpressionString: '',
          currentExpression: null,
          expressionError: null,
          truthTable: null,
          currentProof: null
        });
        return;
      }
      
      const validation = validateExpression(trimmedExpr);
      
      if (validation.valid) {
        try {
          const parsedExpression = parseToExpression(trimmedExpr);
          const state = get();
          
          set({
            currentExpressionString: trimmedExpr,
            currentExpression: parsedExpression,
            expressionError: null,
            currentProof: null // Clear existing proof when expression changes
          });
          
          // Auto-generate truth table if enabled
          if (state.autoGenerateTruthTable) {
            get().generateTruthTableForCurrent();
          }
          
          // Add to history
          get().addToHistory(trimmedExpr);
          
        } catch (error) {
          set({
            currentExpressionString: trimmedExpr,
            currentExpression: null,
            expressionError: error instanceof Error ? error.message : 'Unknown error',
            truthTable: null,
            currentProof: null
          });
        }
      } else {
        set({
          currentExpressionString: trimmedExpr,
          currentExpression: null,
          expressionError: validation.error,
          truthTable: null,
          currentProof: null
        });
      }
    },
    
    clearCurrentExpression: () => {
      set({
        currentExpressionString: '',
        currentExpression: null,
        expressionError: null,
        truthTable: null,
        currentProof: null
      });
    },
    
    setStartExpression: (expr: string) => {
      const trimmedExpr = expr.trim();
      
      if (trimmedExpr === '') {
        set({
          startExpressionString: '',
          startExpression: null,
          startExpressionError: null,
          currentProof: null
        });
        return;
      }
      
      const validation = validateExpression(trimmedExpr);
      if (validation.valid) {
        try {
          const parsedExpression = parseToExpression(trimmedExpr);
          
          set({
            startExpressionString: trimmedExpr,
            startExpression: parsedExpression,
            startExpressionError: null,
            currentProof: null // Clear existing proof when expression changes
          });
          
          // Add to history
          get().addToHistory(trimmedExpr);
          
        } catch (error) {
          set({
            startExpressionString: trimmedExpr,
            startExpression: null,
            startExpressionError: error instanceof Error ? error.message : 'Unknown error',
            currentProof: null
          });
        }
      } else {
        set({
          startExpressionString: trimmedExpr,
          startExpression: null,
          startExpressionError: validation.error,
          currentProof: null
        });
      }
    },
    
    clearStartExpression: () => {
      set({
        startExpressionString: '',
        startExpression: null,
        startExpressionError: null,
        currentProof: null
      });
    },
    
    setTargetExpression: (expr: string) => {
      const trimmedExpr = expr.trim();
      
      if (trimmedExpr === '') {
        set({
          targetExpressionString: '',
          targetExpression: null,
          targetExpressionError: null,
          currentProof: null
        });
        return;
      }
      
      const validation = validateExpression(trimmedExpr);
      
      if (validation.valid) {
        try {
          const parsedExpression = parseToExpression(trimmedExpr);
          set({
            targetExpressionString: trimmedExpr,
            targetExpression: parsedExpression,
            targetExpressionError: null,
            currentProof: null // Clear existing proof when target changes
          });
        } catch (error) {
          set({
            targetExpressionString: trimmedExpr,
            targetExpression: null,
            targetExpressionError: error instanceof Error ? error.message : 'Unknown error',
            currentProof: null
          });
        }
      } else {
        set({
          targetExpressionString: trimmedExpr,
          targetExpression: null,
          targetExpressionError: validation.error,
          currentProof: null
        });
      }
    },
    
    clearTargetExpression: () => {
      set({
        targetExpressionString: '',
        targetExpression: null,
        targetExpressionError: null,
        currentProof: null
      });
    },
    
    // Truth table management
    generateTruthTableForCurrent: () => {
      const { currentExpression } = get();
      if (currentExpression) {
        try {
          const truthTable = generateTruthTable(currentExpression);
          set({ truthTable, showTruthTable: true });
        } catch (error) {
          console.error('Failed to generate truth table:', error);
          set({ truthTable: null });
        }
      }
    },
    
    toggleTruthTableVisibility: () => {
      set(state => ({ showTruthTable: !state.showTruthTable }));
    },
    
    clearTruthTable: () => {
      set({ truthTable: null, showTruthTable: false });
    },
    
    // Proof system
    searchForProof: async () => {
      const { currentExpression, targetExpression, selectedRules, maxProofDepth } = get();
      
      if (!currentExpression || !targetExpression) {
        console.warn('Both current and target expressions must be set to search for proof');
        return;
      }
      
      set({ isSearchingProof: true, proofSearchProgress: null, currentProof: null });
      
      try {
        // Get selected rules
        const activeRules = ALL_TRANSFORMATION_RULES.filter(rule => 
          selectedRules.has(rule.name)
        );
        
        // Search for proof with progress callback
        const proof = await new Promise<TransformationProof>((resolve) => {
          // Use setTimeout to make this async and allow UI updates
          setTimeout(() => {
            const result = findTransformationProof(
              currentExpression,
              targetExpression,
              {
                maxDepth: maxProofDepth,
                rules: activeRules,
                onProgress: (statesExplored, depth) => {
                  set({ proofSearchProgress: { statesExplored, depth } });
                }
              }
            );
            resolve(result);
          }, 10);
        });
        
        set({ 
          currentProof: proof, 
          isSearchingProof: false, 
          proofSearchProgress: null 
        });
        
      } catch (error) {
        console.error('Error searching for proof:', error);
        set({ 
          isSearchingProof: false, 
          proofSearchProgress: null,
          currentProof: null 
        });
      }
    },
    
    cancelProofSearch: () => {
      set({ 
        isSearchingProof: false, 
        proofSearchProgress: null 
      });
    },
    
    clearProof: () => {
      set({ 
        currentProof: null, 
        isSearchingProof: false, 
        proofSearchProgress: null 
      });
    },
    
    // Rule management
    toggleRule: (ruleName: string) => {
      set(state => {
        const newSelectedRules = new Set(state.selectedRules);
        if (newSelectedRules.has(ruleName)) {
          newSelectedRules.delete(ruleName);
        } else {
          newSelectedRules.add(ruleName);
        }
        return { 
          selectedRules: newSelectedRules,
          currentProof: null // Clear proof when rules change
        };
      });
    },
    
    selectAllRules: () => {
      set({ 
        selectedRules: new Set(ALL_TRANSFORMATION_RULES.map(rule => rule.name)),
        currentProof: null
      });
    },
    
    deselectAllRules: () => {
      set({ 
        selectedRules: new Set(),
        currentProof: null
      });
    },
    
    // Settings
    setMaxProofDepth: (depth: number) => {
      set({ 
        maxProofDepth: Math.max(1, Math.min(30, depth)),
        currentProof: null // Clear proof when settings change
      });
    },
    
    toggleASTVisualization: () => {
      set(state => ({ showASTVisualization: !state.showASTVisualization }));
    },
    
    toggleUseSymbolsInTruthTable: () => {
      set(state => ({ useSymbolsInTruthTable: !state.useSymbolsInTruthTable }));
    },
    
    toggleAutoGenerateTruthTable: () => {
      set(state => ({ autoGenerateTruthTable: !state.autoGenerateTruthTable }));
    },
    
    // History management
    addToHistory: (expr: string) => {
      set(state => {
        const newHistory = [expr, ...state.expressionHistory.filter(h => h !== expr)];
        return { expressionHistory: newHistory.slice(0, 20) }; // Keep last 20
      });
    },
    
    clearHistory: () => {
      set({ expressionHistory: [] });
    },
    
    loadFromHistory: (expr: string) => {
      get().setCurrentExpression(expr);
    },
  }))
);
