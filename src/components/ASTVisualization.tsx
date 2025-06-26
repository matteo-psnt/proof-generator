import React, { useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  ConnectionMode,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  BooleanExpression,
  Variable,
  Negation,
  BinaryOperation,
  TrueConstant,
  FalseConstant,
} from '../logic/expressions';

interface ASTVisualizationProps {
  expression: BooleanExpression | null;
  className?: string;
}

interface ASTNode {
  id: string;
  type: 'input' | 'default' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    expressionType: string;
    value?: boolean;
  };
  style?: React.CSSProperties;
  sourcePosition?: Position;
  targetPosition?: Position;
}

interface ASTEdge {
  id: string;
  source: string;
  target: string;
  markerEnd?: {
    type: MarkerType;
  };
  style?: React.CSSProperties;
}

const nodeStyles = {
  variable: {
    background: '#10b981', // emerald-500
    color: 'white',
    border: '2px solid #059669', // emerald-600
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  constant: {
    background: '#3b82f6', // blue-500
    color: 'white',
    border: '2px solid #2563eb', // blue-600
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  unary: {
    background: '#f59e0b', // amber-500
    color: 'white',
    border: '2px solid #d97706', // amber-600
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  binary: {
    background: '#ef4444', // red-500
    color: 'white',
    border: '2px solid #dc2626', // red-600
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

const operatorSymbols: Record<string, string> = {
  'AND': '∧',
  'OR': '∨',
  'NOT': '¬',
  'IMP': '→',
  'IFF': '↔',
};

function convertExpressionToNodes(
  expr: BooleanExpression,
  nodeId = '0',
  x = 0,
  y = 0,
  level = 0
): { nodes: ASTNode[]; edges: ASTEdge[]; width: number } {
  const nodes: ASTNode[] = [];
  const edges: ASTEdge[] = [];
  let currentWidth = 0;

  // Ensure proper vertical spacing for tree levels
  const VERTICAL_SPACING = 120;
  const HORIZONTAL_SPACING = 150;

  if (expr instanceof Variable) {
    nodes.push({
      id: nodeId,
      type: 'default', // Changed to 'default' to allow incoming connections
      position: { x, y },
      data: {
        label: expr.name,
        expressionType: 'variable',
      },
      style: nodeStyles.variable,
      sourcePosition: Position.Bottom, // Not used since it's a leaf
      targetPosition: Position.Top, // Arrows point down TO this node
    });
    currentWidth = 120;
  } else if (expr instanceof TrueConstant || expr instanceof FalseConstant) {
    nodes.push({
      id: nodeId,
      type: 'default', // Changed to 'default' to allow incoming connections
      position: { x, y },
      data: {
        label: expr.toString(),
        expressionType: 'constant',
        value: expr instanceof TrueConstant,
      },
      style: nodeStyles.constant,
      sourcePosition: Position.Bottom, // Not used since it's a leaf
      targetPosition: Position.Top, // Arrows point down TO this node
    });
    currentWidth = 80;
  } else if (expr instanceof Negation) {
    // Add the operator node
    nodes.push({
      id: nodeId,
      type: 'default',
      position: { x, y },
      data: {
        label: '¬',
        expressionType: 'unary',
      },
      style: nodeStyles.unary,
      sourcePosition: Position.Bottom, // Connections go down to children
      targetPosition: Position.Top, // Connections come from above (parent)
    });

    // Add the operand subtree
    const operandId = `${nodeId}_operand`;
    const operandResult = convertExpressionToNodes(
      expr.expression,
      operandId,
      x,
      y + VERTICAL_SPACING, // Use consistent spacing
      level + 1
    );

    // If the operand is a Variable or constant, adjust its position
    if (
      operandResult.nodes[0].data.expressionType === 'variable' ||
      operandResult.nodes[0].data.expressionType === 'constant'
    ) {
      operandResult.nodes[0].position = { x: x - 50, y: y + VERTICAL_SPACING };
    }

    nodes.push(...operandResult.nodes);
    edges.push(...operandResult.edges);

    // Connect operator to operand (parent -> child)
    edges.push({
      id: `${nodeId}_to_${operandId}`,
      source: nodeId,
      target: operandId,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 },
    });

    currentWidth = Math.max(120, operandResult.width);
  } else if (expr instanceof BinaryOperation) {
    // Add the operator node
    nodes.push({
      id: nodeId,
      type: 'default',
      position: { x, y },
      data: {
        label: operatorSymbols[expr.getOperatorName()] || expr.getOperatorSymbol(),
        expressionType: 'binary',
      },
      style: nodeStyles.binary,
      sourcePosition: Position.Bottom, // Connections go down to children
      targetPosition: Position.Top, // Connections come from above (parent)
    });

    // Add left operand subtree
    const leftId = `${nodeId}_left`;
    const leftResult = convertExpressionToNodes(
      expr.left,
      leftId,
      x - HORIZONTAL_SPACING, // Use consistent spacing
      y + VERTICAL_SPACING,
      level + 1
    );

    // Add right operand subtree
    const rightId = `${nodeId}_right`;
    const rightResult = convertExpressionToNodes(
      expr.right,
      rightId,
      x + HORIZONTAL_SPACING - 50,
      y + VERTICAL_SPACING,
      level + 1
    );

    nodes.push(...leftResult.nodes, ...rightResult.nodes);
    edges.push(...leftResult.edges, ...rightResult.edges);

    // Connect operator to operands (parent -> children)
    edges.push(
      {
        id: `${nodeId}_to_${leftId}`,
        source: nodeId,
        target: leftId,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#6b7280', strokeWidth: 2 },
      },
      {
        id: `${nodeId}_to_${rightId}`,
        source: nodeId,
        target: rightId,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#6b7280', strokeWidth: 2 },
      }
    );

    currentWidth = leftResult.width + rightResult.width + 200;
  }

  return { nodes, edges, width: currentWidth };
}

export default function ASTVisualization({
  expression,
  className = '',
}: Readonly<ASTVisualizationProps>) {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!expression) {
      return { nodes: [], edges: [] };
    }

    const result = convertExpressionToNodes(expression, 'root', 0, 0);

    // Center the tree horizontally
    const minX = Math.min(...result.nodes.map((n) => n.position.x));
    const maxX = Math.max(...result.nodes.map((n) => n.position.x));
    const centerOffset = -(minX + maxX) / 2;

    const centeredNodes = result.nodes.map((node) => ({
      ...node,
      position: {
        ...node.position,
        x: node.position.x + centerOffset + 300, // Add some padding
      },
    }));

    return {
      nodes: centeredNodes,
      edges: result.edges,
    };
  }, [expression]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when expression changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    // Fit view to new nodes after a short delay to ensure nodes are rendered
    if (reactFlowInstance.current && initialNodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.current?.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          duration: 300, // Smooth transition
        });
      }, 100);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onConnect = useCallback(() => {
    // Prevent connections in AST view
  }, []);

  if (!expression) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
      >
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🌳</div>
          <div className="text-lg font-semibold mb-2">No Expression</div>
          <div className="text-sm">Enter a Boolean expression to see its AST visualization</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="#e5e7eb" />
          <Controls
            position="top-left"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
