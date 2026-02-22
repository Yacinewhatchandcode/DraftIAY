import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import StickyNode from './components/StickyNode';
import GroupNode from './components/GroupNode';
import SwarmLog from './components/SwarmLog';
import {
  Plus, Settings, MousePointer2, Hand, SquareSquare,
  Image as ImageIcon, MessageSquareText, PenTool,
  Type, Zap, BoxSelect, Link, Layers, ArrowRightLeft,
  Share2
} from 'lucide-react';
import './App.css';

const nodeTypes = {
  sticky: StickyNode,
  groupNode: GroupNode,
};

const initialNodes = [
  {
    id: 'group-1',
    type: 'groupNode',
    data: { label: 'Benchmark & Research', color: 'orange', width: 450, height: 350 },
    position: { x: -300, y: -50 },
    style: { zIndex: -1 },
  },
  {
    id: 'node-1',
    type: 'sticky',
    data: { label: 'Competitor analysis shows 3 gaps in current AI tooling for draft composition. Need seamless node bridging.', color: 'yellow', tag: 'Analysis' },
    position: { x: -270, y: 30 },
    parentId: 'group-1',
    extent: 'parent',
  },
  {
    id: 'node-2',
    type: 'sticky',
    data: { label: 'Integration of real-time multi-agent interactions could provide a 10x ROI for project velocity.', color: 'orange', tag: 'Strategy' },
    position: { x: -100, y: 150 },
    parentId: 'group-1',
    extent: 'parent',
  },
  {
    id: 'group-2',
    type: 'groupNode',
    data: { label: 'Inspiration (Zero Illusion)', color: 'green', width: 500, height: 400 },
    position: { x: 250, y: -100 },
    style: { zIndex: -1 },
  },
  {
    id: 'node-3',
    type: 'sticky',
    data: { label: 'Agent zero-illusion policy enforcement UI concept. Must guarantee trace logs via Sovereign Tier.', color: 'green', tag: 'Concept' },
    position: { x: 300, y: 0 },
    parentId: 'group-2',
    extent: 'parent',
  },
  {
    id: 'node-4',
    type: 'sticky',
    data: { label: 'Visual language: Glassmorphism, Neon lines, deep dark void background (#0a0a0f). Reacting organically to hovering.', color: 'blue', tag: 'UI/UX' },
    position: { x: 450, y: 160 },
    parentId: 'group-2',
    extent: 'parent',
  },
  {
    id: 'node-5',
    type: 'sticky',
    data: { label: 'Connect to Vagabond API: H200 Swarm mapping.', color: 'purple', tag: 'API' },
    position: { x: 400, y: 400 },
  }
];

const initialEdges = [
  { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#fbbf24', strokeWidth: 2 } },
  { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, type: 'smoothstep' },
  { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#34d399', strokeWidth: 2 } },
  { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 }, type: 'smoothstep' },
];

const COLORS = ['yellow', 'blue', 'green', 'pink', 'purple'];

function DraftBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeTool, setActiveTool] = useState('select');
  const [draftMode, setDraftMode] = useState(false);
  const [isLogVisible, setIsLogVisible] = useState(true); // Default open to showcase logs
  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback((params) => {
    // Random color for new edges
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#34d399', '#fbbf24'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: randomColor, strokeWidth: 2 } }, eds));
  }, [setEdges]);

  const addStickyNote = () => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newNode = {
      id: uuidv4(),
      type: 'sticky',
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: '', color: randomColor, tag: 'Draft' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addGroupNode = () => {
    const newNode = {
      id: uuidv4(),
      type: 'groupNode',
      position: { x: -100, y: 100 },
      data: { label: 'New Section', color: 'grey', width: 400, height: 300 },
      style: { zIndex: -1 },
    };
    setNodes((nds) => [newNode, ...nds]); // Add to back
  };

  return (
    <div className="react-flow-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="draft-canvas"
        proOptions={{ hideAttribution: true }}
        panOnScroll={true}
        selectionOnDrag={activeTool === 'select'}
      >
        <Background gap={24} size={1} color="rgba(255, 255, 255, 0.1)" />
        <Controls showInteractive={false} />
        <MiniMap zoomable pannable />

        {/* Top Navigation Panel */}
        <Panel position="top-left" className="w-full pointer-events-none">
          <nav className="navbar pointer-events-auto" style={{ borderBottom: '1px solid var(--border-glass)' }}>
            <div className="nav-brand">
              <ArrowRightLeft size={24} color="#8b5cf6" />
              <span>Draft AIY</span>
            </div>
            <div className="nav-actions">
              <button className="btn-secondary">
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button className="btn-secondary">
                <Settings size={16} />
                <span>Workspace</span>
              </button>
              <button className="btn-primary" onClick={addStickyNote}>
                <Plus size={16} />
                <span>New Draft</span>
              </button>
            </div>
          </nav>
        </Panel>

        {/* Left Toolbar Panel */}
        <Panel position="left" className="pointer-events-none">
          <div className="left-sidebar pointer-events-auto">
            <button
              className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTool('select')}
              title="Select & Move (V)"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              className={`tool-btn ${activeTool === 'hand' ? 'active' : ''}`}
              onClick={() => setActiveTool('hand')}
              title="Pan Canvas (Space)"
            >
              <Hand size={18} />
            </button>

            <div className="tool-divider"></div>

            <button
              className="tool-btn"
              onClick={addGroupNode}
              title="Add Section / Group"
            >
              <SquareSquare size={18} />
            </button>
            <button
              className="tool-btn"
              onClick={addStickyNote}
              title="Sticky Note (S)"
            >
              <MessageSquareText size={18} />
            </button>
            <button className="tool-btn" title="Text Area (T)">
              <Type size={18} />
            </button>
            <button className="tool-btn" title="Add Image (I)">
              <ImageIcon size={18} />
            </button>

            <div className="tool-divider"></div>

            <button className="tool-btn" title="Draw Connection (L)">
              <Link size={18} />
            </button>
            <button
              className={`tool-btn ${isLogVisible ? 'active' : ''}`}
              title="Agent Swarm Brain Matrix"
              onClick={() => setIsLogVisible(prev => !prev)}
            >
              <Zap size={18} color={isLogVisible ? "#fff" : "#ec4899"} />
            </button>
          </div>
        </Panel>

      </ReactFlow>

      {/* Absolute overlay over the workspace */}
      <SwarmLog isVisible={isLogVisible} toggleVisibility={() => setIsLogVisible(false)} />
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <ReactFlowProvider>
        <DraftBoard />
      </ReactFlowProvider>
    </div>
  );
}
