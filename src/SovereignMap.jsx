import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { ArrowRightLeft, Eye, EyeOff, Activity, RefreshCw, Shield } from 'lucide-react';

const nodeTypes = {
    pageNode: PageNode,
    externalNode: ExternalNode,
};

const ANALYTICS_API = "https://www.amlazr.com/api/analytics/realtime?period=24h";

// Fetch analytics data from Supabase via the API
async function fetchAnalytics() {
    try {
        const res = await fetch(ANALYTICS_API);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.success) return null;

        // Build path → analytics map
        const pathMap = {};

        // Active visitors by page
        if (data.realtime?.active_pages) {
            Object.entries(data.realtime.active_pages).forEach(([path, count]) => {
                if (!pathMap[path]) pathMap[path] = {};
                pathMap[path].active = count;
            });
        }

        // Active detail (per-session)
        if (data.realtime?.active_detail) {
            data.realtime.active_detail.forEach((s) => {
                const p = s.current_path || '/';
                if (!pathMap[p]) pathMap[p] = {};
                pathMap[p].active = (pathMap[p].active || 0) + (pathMap[p]._counted ? 0 : 1);
                pathMap[p]._counted = true;
            });
        }

        // Top pages stats (24h)
        if (data.top_pages) {
            data.top_pages.forEach((pg) => {
                const p = pg.path;
                if (!pathMap[p]) pathMap[p] = {};
                pathMap[p].views = pg.views;
                pathMap[p].avg_duration = pg.avg_duration;
                pathMap[p].bounce_rate = pg.bounce_rate;
                pathMap[p].avg_scroll = pg.avg_scroll;
                pathMap[p].title = pg.title;
            });
        }

        return {
            pathMap,
            totalActive: data.realtime?.active_visitors || 0,
            uniqueVisitors24h: data.period?.unique_visitors || 0,
            totalPageviews24h: data.period?.total_pageviews || 0,
            avgDuration: data.period?.avg_duration_seconds || 0,
            bounceRate: data.period?.bounce_rate || 0,
        };
    } catch (err) {
        console.warn('[Sovereign Map] Analytics fetch failed:', err);
        return null;
    }
}

// Auto-layout: arrange nodes by category in a grid
function buildLayout(pageList, externals, catFilter, analyticsMap) {
    const filtered = catFilter === 'all'
        ? pageList
        : pageList.filter(p => p.cat === catFilter);

    const groups = {};
    filtered.forEach(p => {
        if (!groups[p.cat]) groups[p.cat] = [];
        groups[p.cat].push(p);
    });

    const catKeys = Object.keys(groups);
    const nodes = [];
    const COLS = 5;
    const W = 210;
    const H = 100;

    let y = 0;

    catKeys.forEach((catKey) => {
        const catMeta = CATEGORIES_META[catKey] || { label: catKey, color: '#64748b' };
        const catPages = groups[catKey];

        // Count analytics for this category
        let catViews = 0;
        let catActive = 0;
        catPages.forEach(p => {
            const a = analyticsMap?.[p.path];
            if (a) {
                catViews += a.views || 0;
                catActive += a.active || 0;
            }
        });

        const statsLabel = catActive > 0
            ? `${catMeta.label} (${catPages.length}) — 🟢 ${catActive} live · ${catViews} views`
            : catViews > 0
                ? `${catMeta.label} (${catPages.length}) — ${catViews} views`
                : `${catMeta.label} (${catPages.length})`;

        nodes.push({
            id: `cat-${catKey}`,
            type: 'default',
            position: { x: 0, y },
            data: { label: statsLabel },
            style: {
                background: `${catMeta.color}15`,
                border: `2px solid ${catMeta.color}`,
                borderRadius: 12,
                color: catMeta.color,
                fontWeight: 700,
                fontSize: 13,
                padding: '8px 20px',
                minWidth: COLS * W,
                textAlign: 'center',
                pointerEvents: 'none',
            },
            selectable: false,
            draggable: false,
        });

        y += 50;

        catPages.forEach((p, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const pageAnalytics = analyticsMap?.[p.path] || null;

            nodes.push({
                id: p.id,
                type: 'pageNode',
                position: { x: col * (W + 15), y: y + row * (H + 14) },
                data: {
                    label: p.label,
                    path: p.path,
                    auth: p.auth,
                    catLabel: catMeta.label,
                    catColor: catMeta.color,
                    url: `${SITE_DOMAIN}${p.path}`,
                    analytics: pageAnalytics,
                },
            });
        });

        const rows = Math.ceil(catPages.length / COLS);
        y += rows * (H + 14) + 70;
    });

    // External section
    if (catFilter === 'all') {
        nodes.push({
            id: 'cat-external',
            type: 'default',
            position: { x: 0, y },
            data: { label: `External Services (${externals.length})` },
            style: {
                background: '#78716c15',
                border: '2px dashed #78716c',
                borderRadius: 12,
                color: '#78716c',
                fontWeight: 700,
                fontSize: 13,
                padding: '8px 20px',
                minWidth: COLS * W,
                textAlign: 'center',
                pointerEvents: 'none',
            },
            selectable: false,
            draggable: false,
        });
        y += 50;

        externals.forEach((ext, i) => {
            nodes.push({
                id: ext.id,
                type: 'externalNode',
                position: { x: (i % COLS) * (W + 15), y: y + Math.floor(i / COLS) * (90 + 14) },
                data: { label: ext.label, url: ext.url, type: ext.type },
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
            labelBgStyle: { fill: '#0a0a1a', fillOpacity: 0.9 },
            style: { stroke: '#3b82f650', strokeWidth: 1.5 },
            type: 'smoothstep',
        }));
}

function SovereignMapBoard() {
    const [catFilter, setCatFilter] = useState('all');
    const [showEdges, setShowEdges] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch analytics on mount + every 30s
    const refreshAnalytics = useCallback(async () => {
        setIsRefreshing(true);
        const data = await fetchAnalytics();
        if (data) {
            setAnalyticsData(data);
            setLastRefresh(new Date());
        }
        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        refreshAnalytics();
        const interval = setInterval(refreshAnalytics, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, [refreshAnalytics]);

    const analyticsMap = analyticsData?.pathMap || {};
    // Stable key to avoid infinite loop from object identity
    const analyticsKey = JSON.stringify(analyticsMap);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const parsedMap = JSON.parse(analyticsKey);
        setNodes(buildLayout(pages, externalUrls, catFilter, parsedMap));
        setEdges(showEdges ? buildEdges(navigationEdges, pages.map(p => p.id)) : []);
    }, [catFilter, showEdges, analyticsKey, setNodes, setEdges]);

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
                minZoom={0.08}
                maxZoom={2.5}
            >
                <Background gap={30} size={1} color="rgba(255,255,255,0.03)" />
                <Controls showInteractive={false} />
                <MiniMap
                    zoomable pannable
                    style={{ background: '#0f0f1a', border: '1px solid #1e293b' }}
                    nodeColor={(n) => {
                        if (n.type === 'pageNode') {
                            if (n.data?.analytics?.active > 0) return '#22c55e';
                            return n.data?.catColor || '#3b82f6';
                        }
                        if (n.type === 'externalNode') return '#78716c';
                        return '#1e293b';
                    }}
                />

                {/* Top Bar */}
                <Panel position="top-left" style={{ width: '100%', pointerEvents: 'none' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 16px',
                        background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid #1e293b', pointerEvents: 'auto',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ArrowRightLeft size={20} color="#8b5cf6" />
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
                                AMLAZR Sovereign Map
                            </span>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#3b82f620', color: '#3b82f6', fontWeight: 600 }}>
                                {stats.total} pages
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Real-time analytics bar */}
                            {analyticsData && (
                                <div style={{
                                    display: 'flex', gap: 8, alignItems: 'center',
                                    padding: '3px 10px', borderRadius: 8,
                                    background: 'rgba(15,15,26,0.8)', border: '1px solid #1e293b',
                                }}>
                                    <Activity size={12} color="#22c55e" />
                                    <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>
                                        {analyticsData.totalActive} live
                                    </span>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>|</span>
                                    <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600 }}>
                                        {analyticsData.uniqueVisitors24h} visitors
                                    </span>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>|</span>
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                        {analyticsData.totalPageviews24h} views
                                    </span>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>|</span>
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                        {analyticsData.bounceRate}% bounce
                                    </span>
                                </div>
                            )}

                            {/* Refresh button */}
                            <button
                                onClick={refreshAnalytics}
                                disabled={isRefreshing}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 8px', borderRadius: 6, border: '1px solid #1e293b',
                                    background: isRefreshing ? '#1e293b' : 'transparent',
                                    color: '#94a3b8', cursor: 'pointer', fontSize: 10,
                                }}
                                title="Refresh analytics"
                            >
                                <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                            </button>

                            {/* Auth stats */}
                            <div style={{ display: 'flex', gap: 4 }}>
                                <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: '#22c55e20', color: '#22c55e' }}>🔓{stats.public}</span>
                                <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: '#f9731620', color: '#f97316' }}>🔑{stats.paid}</span>
                                <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: '#ef444420', color: '#ef4444' }}>🔒{stats.e2f}</span>
                                <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: '#64748b20', color: '#64748b' }}>📄{stats.other}</span>
                            </div>

                            {/* Edge toggle */}
                            <button
                                onClick={() => setShowEdges(!showEdges)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 3,
                                    padding: '4px 8px', borderRadius: 6, border: '1px solid #1e293b',
                                    background: showEdges ? '#3b82f620' : 'transparent',
                                    color: showEdges ? '#3b82f6' : '#64748b',
                                    cursor: 'pointer', fontSize: 10, fontWeight: 600,
                                }}
                            >
                                {showEdges ? <Eye size={12} /> : <EyeOff size={12} />}
                                Links
                            </button>

                            {/* Filter */}
                            <select
                                value={catFilter}
                                onChange={(e) => setCatFilter(e.target.value)}
                                style={{
                                    padding: '4px 8px', borderRadius: 6, border: '1px solid #1e293b',
                                    background: '#0f0f1a', color: '#e2e8f0', fontSize: 10,
                                    fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <option value="all">All Categories</option>
                                {Object.keys(CATEGORIES_META).map(k => (
                                    <option key={k} value={k}>{CATEGORIES_META[k].label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Panel>

                {/* Legend + GDPR */}
                <Panel position="bottom-left">
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(10,10,26,0.92)', backdropFilter: 'blur(8px)',
                        borderRadius: 10, border: '1px solid #1e293b', maxWidth: 280,
                    }}>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                            Legend & Controls
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🔓 Public — No auth</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🔑 Paid — Bypassed on amlazr.com</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🔒 E2F — PIN-based A2F</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>📄 Other — No explicit gate</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🟢 Pulse — Active visitors now</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>🖼 Hover 400ms → Live preview</span>
                        </div>
                        <div style={{
                            fontSize: 8, color: '#475569', marginTop: 6,
                            borderTop: '1px solid #1e293b', paddingTop: 6,
                            display: 'flex', alignItems: 'flex-start', gap: 4,
                        }}>
                            <Shield size={10} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>
                                GDPR EU 2016/679 & AI Act 2026 compliant.
                                Cookie-free analytics via first-party Supabase.
                                No PII collected. No cross-site tracking.
                                Data retained 90 days max. Auto-refresh 30s.
                                {lastRefresh && (
                                    <span> Last: {lastRefresh.toLocaleTimeString()}</span>
                                )}
                            </span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
