import React, { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, Panel,
    useNodesState, useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PageNode from './components/PageNode';
import ExternalNode from './components/ExternalNode';
import BackendNode from './components/BackendNode';
import { pages, navigationEdges, externalUrls, backends, CATEGORIES_META, SITE_DOMAIN, apiBackendMap, globalApis } from './data/siteMap';
import { ArrowRightLeft, Eye, EyeOff, Activity, RefreshCw, Shield, Server, Layers } from 'lucide-react';

const nodeTypes = { pageNode: PageNode, externalNode: ExternalNode, backendNode: BackendNode };

const MAP_STYLES = `
  @keyframes pulseGlow {
    0% { filter: drop-shadow(0 0 2px #ef444450); stroke-opacity: 0.6; }
    50% { filter: drop-shadow(0 0 8px #ef4444); stroke-opacity: 1; stroke-width: 1.5; }
    100% { filter: drop-shadow(0 0 2px #ef444450); stroke-opacity: 0.6; }
  }
  .wire-edge { animation: pulseGlow 3s ease-in-out infinite; stroke-linecap: round; }
  .nav-edge { stroke-dasharray: 5; animation: dashMove 20s linear infinite; }
  @keyframes dashMove { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
  .react-flow__edge-path { transition: stroke 0.3s, stroke-width 0.3s; }
`;

const ANALYTICS_API = "https://www.amlazr.com/api/analytics/realtime?period=24h";

async function fetchAnalytics() {
    try {
        const res = await fetch(ANALYTICS_API);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.success) return null;
        const pathMap = {};
        if (data.realtime?.active_pages) {
            Object.entries(data.realtime.active_pages).forEach(([path, count]) => {
                if (!pathMap[path]) pathMap[path] = {};
                pathMap[path].active = count;
            });
        }
        if (data.top_pages) {
            data.top_pages.forEach((pg) => {
                const p = pg.path;
                if (!pathMap[p]) pathMap[p] = {};
                pathMap[p].views = pg.views;
                pathMap[p].avg_duration = pg.avg_duration;
                pathMap[p].bounce_rate = pg.bounce_rate;
            });
        }
        return {
            pathMap,
            totalActive: data.realtime?.active_visitors || 0,
            uniqueVisitors24h: data.period?.unique_visitors || 0,
            totalPageviews24h: data.period?.total_pageviews || 0,
            bounceRate: data.period?.bounce_rate || 0,
        };
    } catch { return null; }
}

// Count APIs per backend
function countApisPerBackend() {
    const counts = {};
    Object.values(apiBackendMap).forEach(blist => {
        blist.forEach(bid => { counts[bid] = (counts[bid] || 0) + 1; });
    });
    return counts;
}

// Count APIs per frontend page
function countApisPerPage() {
    const counts = {};
    pages.forEach(p => { counts[p.id] = (p.apis || []).length; });
    return counts;
}

// Collect unique APIs across all pages
function collectAllApis() {
    const apiSet = new Set();
    pages.forEach(p => (p.apis || []).forEach(a => apiSet.add(a)));
    return [...apiSet].sort();
}

// Build the full graph
function buildLayout(catFilter, analyticsMap, showBackend, showApiEdges) {
    const filtered = catFilter === 'all' ? pages : pages.filter(p => p.cat === catFilter);
    const groups = {};
    filtered.forEach(p => {
        if (!groups[p.cat]) groups[p.cat] = [];
        groups[p.cat].push(p);
    });

    const nodes = [];
    const COLS = 5;
    const W = 210;
    const H = 110;
    let y = 0;

    // Frontend pages by category
    Object.keys(groups).forEach((catKey) => {
        const catMeta = CATEGORIES_META[catKey] || { label: catKey, color: '#64748b' };
        const catPages = groups[catKey];

        let catViews = 0, catApis = 0;
        catPages.forEach(p => {
            const a = analyticsMap?.[p.path];
            if (a) catViews += a.views || 0;
            catApis += (p.apis || []).length;
        });

        const statsLabel = `${catMeta.label} (${catPages.length}) — ${catApis} APIs` +
            (catViews > 0 ? ` · ${catViews} views` : '');

        nodes.push({
            id: `cat-${catKey}`, type: 'default',
            position: { x: 0, y },
            data: { label: statsLabel },
            style: {
                background: `${catMeta.color}15`, border: `2px solid ${catMeta.color}`, borderRadius: 12,
                color: catMeta.color, fontWeight: 800, fontSize: 13, padding: '8px 20px',
                minWidth: COLS * W + 40, textAlign: 'center', pointerEvents: 'none',
                textTransform: 'uppercase', letterSpacing: '0.05em',
            },
            selectable: false, draggable: false,
        });

        y += 45;
        catPages.forEach((page, i) => {
            const px = (i % COLS) * (W + 15);
            const py = y + Math.floor(i / COLS) * (H + 15);
            nodes.push({
                id: page.id, type: 'pageNode',
                position: { x: px, y: py },
                data: {
                    ...page,
                    catColor: catMeta.color,
                    analytics: analyticsMap?.[page.path] || { active: 0, views: 0 },
                    apiCount: (page.apis || []).length,
                },
            });
        });

        const rows = Math.ceil(catPages.length / COLS);
        y += rows * (H + 15) + 35;
    });

    // EXTERNAL SERVICES section
    if (catFilter === 'all') {
        const extY = y;
        nodes.push({
            id: 'cat-external', type: 'default',
            position: { x: 0, y: extY },
            data: { label: `External Cloud Ecosystem (${externalUrls.length})` },
            style: {
                background: '#10b98115', border: '2px dashed #10b981', borderRadius: 12,
                color: '#10b981', fontWeight: 800, fontSize: 13, padding: '8px 20px',
                minWidth: COLS * W + 40, textAlign: 'center', pointerEvents: 'none',
            },
            selectable: false, draggable: false,
        });

        externalUrls.forEach((ext, i) => {
            nodes.push({
                id: ext.id, type: 'externalNode',
                position: { x: (i % COLS) * (W + 15), y: extY + 45 + Math.floor(i / COLS) * 75 },
                data: { label: ext.label, url: ext.url, type: ext.type },
            });
        });

        y = extY + Math.ceil(externalUrls.length / COLS) * 75 + 80;
    }

    // BACKEND INFRASTRUCTURE SECTION — positioned to the RIGHT
    if (showBackend && catFilter === 'all') {
        const apiCounts = countApisPerBackend();
        const bCOLS = 2;
        const bW = 220;
        const rightX = COLS * (W + 15) + 120; // right of frontend pages
        const globalY = (backends.length / bCOLS) * 115 + 100;

        nodes.push({
            id: 'cat-backend', type: 'default',
            position: { x: rightX, y: 0 },
            data: { label: `Engine Clusters (${backends.length})` },
            style: {
                background: '#ef444415', border: '2px solid #ef4444', borderRadius: 12,
                color: '#ef4444', fontWeight: 800, fontSize: 14, padding: '10px 20px',
                minWidth: bCOLS * bW + 40, textAlign: 'center', pointerEvents: 'none',
                textTransform: 'uppercase', letterSpacing: '0.05em',
            },
            selectable: false, draggable: false,
        });

        backends.forEach((be, i) => {
            nodes.push({
                id: be.id, type: 'backendNode',
                position: { x: rightX + (i % bCOLS) * (bW + 15), y: 50 + Math.floor(i / bCOLS) * 115 },
                data: {
                    label: be.label, backendType: be.type, color: be.color,
                    desc: be.desc, apiCount: apiCounts[be.id] || 0,
                },
            });
        });

        // GLOBAL COMPONENTS section
        nodes.push({
            id: 'cat-global', type: 'default',
            position: { x: rightX, y: globalY },
            data: { label: `System Components (${globalApis.length}) — High Availability` },
            style: {
                background: '#f9731615', border: '2px dashed #f97316', borderRadius: 12,
                color: '#f97316', fontWeight: 800, fontSize: 13, padding: '8px 20px',
                minWidth: bCOLS * bW + 40, textAlign: 'center', pointerEvents: 'none',
                textTransform: 'uppercase',
            },
            selectable: false, draggable: false,
        });

        globalApis.forEach((g, i) => {
            nodes.push({
                id: g.id, type: 'default',
                position: { x: rightX + (i % bCOLS) * (bW + 15), y: globalY + 45 + Math.floor(i / bCOLS) * 60 },
                data: { label: `${g.label} → Multi-lane` },
                style: {
                    background: '#f9731610', border: '1px solid #f9731640', borderRadius: 8,
                    color: '#f97316', fontWeight: 600, fontSize: 11, padding: '8px 14px',
                },
            });
        });
    }

    return nodes;
}

// Build edges: nav + api→backend wiring
function buildEdges(showNav, showApiWire, catFilter) {
    const edges = [];
    const filtered = catFilter === 'all' ? pages : pages.filter(p => p.cat === catFilter);
    const idSet = new Set(filtered.map(p => p.id));

    // Navigation edges
    if (showNav) {
        navigationEdges
            .filter(e => idSet.has(e.from) && idSet.has(e.to))
            .forEach((e, i) => {
                edges.push({
                    id: `nav-${i}`, source: e.from, target: e.to,
                    animated: true, label: e.label,
                    className: 'nav-edge',
                    labelStyle: { fontSize: 8, fill: '#94a3b8' },
                    labelBgStyle: { fill: '#0a0a1a', fillOpacity: 0.9 },
                    style: { stroke: '#3b82f640', strokeWidth: 1.5 },
                    type: 'smoothstep',
                });
            });
    }

    // API → Backend wiring edges
    if (showApiWire && catFilter === 'all') {
        const connectedBackends = new Set();

        filtered.forEach(page => {
            (page.apis || []).forEach(api => {
                const beList = apiBackendMap[api] || [];
                beList.forEach(beId => {
                    const edgeId = `wire-${page.id}-${beId}`;
                    if (!connectedBackends.has(edgeId)) {
                        connectedBackends.add(edgeId);
                        edges.push({
                            id: edgeId, source: page.id, target: beId,
                            className: 'wire-edge',
                            style: { stroke: '#ef4444', strokeWidth: 1.2, strokeDasharray: '4 4' },
                            type: 'straight',
                        });
                    }
                });
            });
        });
    }

    return edges;
}

function SovereignMapBoard() {
    const [catFilter, setCatFilter] = useState('all');
    const [showEdges, setShowEdges] = useState(false);
    const [showBackend, setShowBackend] = useState(true);
    const [showApiWire, setShowApiWire] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshAnalytics = useCallback(async () => {
        setIsRefreshing(true);
        const data = await fetchAnalytics();
        if (data) { setAnalyticsData(data); setLastRefresh(new Date()); }
        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        refreshAnalytics();
        const interval = setInterval(refreshAnalytics, 30000);
        return () => clearInterval(interval);
    }, [refreshAnalytics]);

    const analyticsMap = analyticsData?.pathMap || {};
    const analyticsKey = JSON.stringify(analyticsMap);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const parsedMap = JSON.parse(analyticsKey);
        setNodes(buildLayout(catFilter, parsedMap, showBackend, showApiWire));
        setEdges(buildEdges(showEdges, showApiWire, catFilter));
    }, [catFilter, showEdges, showBackend, showApiWire, analyticsKey, setNodes, setEdges]);

    // Wiring ratio calculations
    const pagesWithApis = pages.filter(p => (p.apis || []).length > 0).length;
    const stats = {
        total: pages.length,
        public: pages.filter(p => p.auth === 'public').length,
        paid: pages.filter(p => p.auth === 'paid').length,
        e2f: pages.filter(p => p.auth === 'e2f').length,
        other: pages.filter(p => p.auth === 'other').length,
        totalApis: collectAllApis().length,
        totalBackends: backends.length,
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a1a', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.05}
                maxZoom={2.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#1e293b" variant="dots" gap={25} size={1} />
                <Controls showInteractive={false} position="bottom-right" />
                <MiniMap
                    style={{ background: '#0a0a1a', border: '1px solid #1e293b', borderRadius: 12 }}
                    nodeColor={(n) => {
                        if (n.type === 'backendNode') return '#ef4444';
                        if (n.type === 'pageNode') return n.data?.catColor || '#3b82f6';
                        return '#1e293b';
                    }}
                    maskColor="rgba(0, 0, 0, 0.7)"
                    zoomable pannable
                />

                <Panel position="top-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '12px 20px', background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(12px)', borderRadius: 14, border: '1px solid #1e293b', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ArrowRightLeft color="#8b5cf6" size={24} />
                            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', color: '#f8fafc' }}>
                                AMLAZR <span style={{ fontWeight: 400, color: '#64748b' }}>Sovereign Map</span>
                            </h1>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 12, background: '#3b82f620', color: '#60a5fa', fontWeight: 700, border: '1px solid #3b82f630' }}>{pages.length} PAGES</span>
                            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 12, background: '#ef444420', color: '#f87171', fontWeight: 700, border: '1px solid #ef444430' }}>{stats.totalApis} APIs</span>
                            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 12, background: '#8b5cf620', color: '#a78bfa', fontWeight: 700, border: '1px solid #8b5cf630' }}>{backends.length} BACKENDS</span>
                        </div>
                    </div>
                </Panel>

                <Panel position="top-right">
                    <div style={{ display: 'flex', gap: 10, padding: '10px 15px', background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(12px)', borderRadius: 12, border: '1px solid #1e293b', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        {analyticsData && (
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 800 }}>{analyticsData.totalActive} LIVE</span>
                                </div>
                                <div style={{ display: 'flex', gap: 10, borderLeft: '1px solid #1e293b', paddingLeft: 12 }}>
                                    <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600 }}>{analyticsData.uniqueVisitors24h} VISITORS</span>
                                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{analyticsData.totalPageviews24h} VIEWS</span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 5, borderLeft: '1px solid #1e293b', paddingLeft: 12 }}>
                            <button onClick={() => setShowEdges(!showEdges)} title="Navigation Links" style={{
                                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                                border: '1px solid #1e293b', background: showEdges ? '#3b82f625' : 'transparent',
                                color: showEdges ? '#60a5fa' : '#475569', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <Eye size={14} />
                            </button>
                            <button onClick={() => setShowBackend(!showBackend)} title="Engine Clusters" style={{
                                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                                border: '1px solid #1e293b', background: showBackend ? '#ef444425' : 'transparent',
                                color: showBackend ? '#f87171' : '#475569', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <Server size={14} />
                            </button>
                            <button onClick={() => setShowApiWire(!showApiWire)} title="API Infrastructure Wiring" style={{
                                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                                border: '1px solid #1e293b', background: showApiWire ? '#8b5cf625' : 'transparent',
                                color: showApiWire ? '#a78bfa' : '#475569', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <Layers size={14} />
                            </button>
                        </div>

                        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{
                            padding: '6px 12px', borderRadius: 8, border: '1px solid #1e293b',
                            background: '#0f0f1a', color: '#f8fafc', fontSize: 11, fontWeight: 700, cursor: 'pointer', outline: 'none'
                        }}>
                            <option value="all">FULL NETWORK ARCHITECTURE</option>
                            {Object.keys(CATEGORIES_META).filter(k => k !== 'api' && k !== 'backend').map(k => (
                                <option key={k} value={k}>{CATEGORIES_META[k].label.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </Panel>

                {/* Legend + Wiring Ratio */}
                <Panel position="bottom-left">
                    <div style={{
                        padding: '16px 20px', background: 'rgba(10,10,26,0.92)', backdropFilter: 'blur(16px)',
                        borderRadius: 16, border: '1px solid #1e293b', maxWidth: 340,
                        boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                    }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            System Integrity Dashboard
                        </div>

                        {/* Ratio bar and Metrics */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>{pagesWithApis} WIRED</span>
                                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>{pages.length - pagesWithApis} BLIND</span>
                            </div>
                            <div style={{ height: 10, borderRadius: 5, background: '#1e293b', overflow: 'hidden', display: 'flex', border: '1px solid #1e293b' }}>
                                <div style={{
                                    width: `${(pagesWithApis / pages.length) * 100}%`, height: '100%',
                                    background: 'linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)', borderRadius: 5,
                                    boxShadow: '0 0 15px #22c55e60',
                                }} />
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: '#f8fafc', marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                {Math.round((pagesWithApis / pages.length) * 100)}%
                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: '0.02em' }}>WIRING HEALTH</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            <div style={{ padding: '10px', background: '#0f0f1a', borderRadius: 10, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>API/Page Ratio</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#60a5fa' }}>{(stats.totalApis / pages.length).toFixed(2)} pts</div>
                            </div>
                            <div style={{ padding: '10px', background: '#0f0f1a', borderRadius: 10, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Engine Density</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{(stats.totalBackends / stats.totalApis).toFixed(2)}x clusters</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, borderTop: '1px solid #1e293b', paddingTop: 14 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>🔓 PUB</span>
                                <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>🔑 PAID</span>
                                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>🔒 E2F</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> ACTIVE REAL-TIME STREAM
                                </span>
                                <span style={{ fontSize: 11, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} /> INFRA WIRING (GLOWING)
                                </span>
                                <span style={{ fontSize: 11, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                                    <div style={{ width: 12, height: 3, background: '#3b82f680', borderRadius: 2 }} /> NAV FLOW (ANIMATED)
                                </span>
                            </div>
                        </div>

                        <div style={{
                            fontSize: 9, color: '#475569',
                            borderTop: '1px solid #1e293b', paddingTop: 12,
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                            <Shield size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ lineHeight: 1.5, fontWeight: 500 }}>
                                <b style={{ color: '#64748b' }}>SEC PROTOCOL v3.2</b>: EU AI Act 2026 Compliant.
                                Sovereign Data Lake orchestration.
                                {lastRefresh && <div style={{ marginTop: 4, color: '#334155' }}>TELEMETRY SYNC: {lastRefresh.toLocaleTimeString()}</div>}
                            </span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
                ${MAP_STYLES}
            `}</style>
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
