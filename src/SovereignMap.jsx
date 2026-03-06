import React, { useState, useCallback, useMemo } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    Panel,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PageNode from './components/PageNode';
import ExternalNode from './components/ExternalNode';
import { pages, navigationEdges, externalUrls, CATEGORIES_META, SITE_DOMAIN } from './data/siteMap';
import { ArrowRightLeft, Filter, Eye, EyeOff, ExternalLink, Layers, BarChart3 } from 'lucide-react';

const nodeTypes = {
    pageNode: PageNode,
    externalNode: ExternalNode,
};

// Auto-layout: arrange nodes by category in a grid
function buildLayout(pageList, externals, catFilter) {
    const filtered = catFilter === 'all'
        ? pageList
        : pageList.filter(p => p.cat === catFilter);

    // Group by category
    const groups = {};
    filtered.forEach(p => {
        if (!groups[p.cat]) groups[p.cat] = [];
        groups[p.cat].push(p);
    });

    const catKeys = Object.keys(groups);
    const nodes = [];
    const COLS_PER_CAT = 5;
    const NODE_W = 200;
    const NODE_H = 90;
    const CAT_GAP_X = 120;
    const CAT_GAP_Y = 80;

    let globalY = 0;

    catKeys.forEach((catKey) => {
        const catMeta = CATEGORIES_META[catKey] || { label: catKey, color: '#64748b' };
        const catPages = groups[catKey];

        // Category header node
        nodes.push({
            id: `cat-${catKey}`,
            type: 'default',
            position: { x: 0, y: globalY },
            data: { label: `${catMeta.label} (${catPages.length})` },
            style: {
                background: `${catMeta.color}20`,
                border: `2px solid ${catMeta.color}`,
                borderRadius: 12,
                color: catMeta.color,
                fontWeight: 700,
                fontSize: 14,
                padding: '8px 20px',
                minWidth: COLS_PER_CAT * NODE_W + (COLS_PER_CAT - 1) * 20,
                textAlign: 'center',
                pointerEvents: 'none',
            },
            selectable: false,
            draggable: false,
        });

        globalY += 50;

        catPages.forEach((p, i) => {
            const col = i % COLS_PER_CAT;
            const row = Math.floor(i / COLS_PER_CAT);
            nodes.push({
                id: p.id,
                type: 'pageNode',
                position: {
                    x: col * (NODE_W + 20),
                    y: globalY + row * (NODE_H + 16),
                },
                data: {
                    label: p.label,
                    path: p.path,
                    auth: p.auth,
                    catLabel: catMeta.label,
                    catColor: catMeta.color,
                    url: `${SITE_DOMAIN}${p.path}`,
                },
            });
        });

        const rows = Math.ceil(catPages.length / COLS_PER_CAT);
        globalY += rows * (NODE_H + 16) + CAT_GAP_Y;
    });

    // External URLs at the bottom
    if (catFilter === 'all') {
        nodes.push({
            id: 'cat-external',
            type: 'default',
            position: { x: 0, y: globalY },
            data: { label: `External Services (${externals.length})` },
            style: {
                background: '#78716c20',
                border: '2px dashed #78716c',
                borderRadius: 12,
                color: '#78716c',
                fontWeight: 700,
                fontSize: 14,
                padding: '8px 20px',
                minWidth: COLS_PER_CAT * NODE_W,
                textAlign: 'center',
                pointerEvents: 'none',
            },
            selectable: false,
            draggable: false,
        });
        globalY += 50;

        externals.forEach((ext, i) => {
            const col = i % COLS_PER_CAT;
            const row = Math.floor(i / COLS_PER_CAT);
            nodes.push({
                id: ext.id,
                type: 'externalNode',
                position: {
                    x: col * (NODE_W + 20),
                    y: globalY + row * (NODE_H + 16),
                },
                data: {
                    label: ext.label,
                    url: ext.url,
                    type: ext.type,
                },
            });
        });
    }

    return nodes;
}

function buildEdges(navEdges, pageIds) {
    const idSet = new Set(pageIds);
    return navEdges
        .filter(e => idSet.has(e.from) && idSet.has(e.to))
        .map((e, i) => ({
            id: `nav-${i}`,
            source: e.from,
            target: e.to,
            animated: true,
            label: e.label,
            labelStyle: { fontSize: 8, fill: '#94a3b8' },
            labelBgStyle: { fill: '#0a0a1a', fillOpacity: 0.8 },
            style: {
                stroke: '#3b82f680',
                strokeWidth: 1.5,
            },
            type: 'smoothstep',
        }));
}

function SovereignMapBoard() {
    const [catFilter, setCatFilter] = useState('all');
    const [showEdges, setShowEdges] = useState(true);

    const initialNodes = useMemo(
        () => buildLayout(pages, externalUrls, catFilter),
        [catFilter]
    );
    const initialEdges = useMemo(
        () => showEdges ? buildEdges(navigationEdges, pages.map(p => p.id)) : [],
        [showEdges]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Reset when filter changes
    React.useEffect(() => {
        setNodes(buildLayout(pages, externalUrls, catFilter));
        setEdges(showEdges ? buildEdges(navigationEdges, pages.map(p => p.id)) : []);
    }, [catFilter, showEdges, setNodes, setEdges]);

    const catKeys = Object.keys(CATEGORIES_META);
    const stats = {
        total: pages.length,
        public: pages.filter(p => p.auth === 'public').length,
        paid: pages.filter(p => p.auth === 'paid').length,
        e2f: pages.filter(p => p.auth === 'e2f').length,
        other: pages.filter(p => p.auth === 'other').length,
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a12' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                proOptions={{ hideAttribution: true }}
                panOnScroll={true}
                minZoom={0.1}
                maxZoom={2}
            >
                <Background gap={30} size={1} color="rgba(255,255,255,0.04)" />
                <Controls showInteractive={false} />
                <MiniMap
                    zoomable
                    pannable
                    style={{ background: '#0f0f1a', border: '1px solid #1e293b' }}
                    nodeColor={(n) => {
                        if (n.type === 'pageNode') return n.data?.catColor || '#3b82f6';
                        if (n.type === 'externalNode') return '#78716c';
                        return '#1e293b';
                    }}
                />

                {/* Top Bar */}
                <Panel position="top-left" style={{ width: '100%', pointerEvents: 'none' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: 'rgba(10,10,26,0.95)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid #1e293b',
                        pointerEvents: 'auto',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ArrowRightLeft size={22} color="#8b5cf6" />
                            <span style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
                                AMLAZR Sovereign Map
                            </span>
                            <span style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: '#3b82f620',
                                color: '#3b82f6',
                                fontWeight: 600,
                            }}>
                                {stats.total} pages
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Stats */}
                            <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#22c55e20', color: '#22c55e' }}>🔓 {stats.public}</span>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#f9731620', color: '#f97316' }}>🔑 {stats.paid}</span>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ef444420', color: '#ef4444' }}>🔒 {stats.e2f}</span>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#64748b20', color: '#64748b' }}>📄 {stats.other}</span>
                            </div>

                            {/* Edge toggle */}
                            <button
                                onClick={() => setShowEdges(!showEdges)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 10px', borderRadius: 6, border: '1px solid #1e293b',
                                    background: showEdges ? '#3b82f620' : 'transparent',
                                    color: showEdges ? '#3b82f6' : '#64748b',
                                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                }}
                            >
                                {showEdges ? <Eye size={14} /> : <EyeOff size={14} />}
                                Links
                            </button>

                            {/* Filter dropdown */}
                            <select
                                value={catFilter}
                                onChange={(e) => setCatFilter(e.target.value)}
                                style={{
                                    padding: '4px 10px', borderRadius: 6, border: '1px solid #1e293b',
                                    background: '#0f0f1a', color: '#e2e8f0', fontSize: 11,
                                    fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <option value="all">All Categories</option>
                                {catKeys.map(k => (
                                    <option key={k} value={k}>{CATEGORIES_META[k].label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Panel>

                {/* Legend */}
                <Panel position="bottom-left">
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(10,10,26,0.92)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 10,
                        border: '1px solid #1e293b',
                    }}>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                            Legend
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🔓 Public — No auth</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🔑 Paid — Subscription (bypassed on amlazr.com)</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🔒 E2F — PIN-based A2F</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>📄 Other — No explicit gate</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🌐 External — Vercel/Render/Fly/Supabase</span>
                            <div style={{ fontSize: 9, color: '#475569', marginTop: 4, borderTop: '1px solid #1e293b', paddingTop: 4 }}>
                                Click any node → opens live URL
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function SovereignMap() {
    return (
        <ReactFlowProvider>
            <SovereignMapBoard />
        </ReactFlowProvider>
    );
}
