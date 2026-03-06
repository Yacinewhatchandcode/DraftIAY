import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const AUTH_BADGES = {
    public: { label: '🔓', bg: '#22c55e30', border: '#22c55e' },
    paid: { label: '🔑', bg: '#f9731630', border: '#f97316' },
    e2f: { label: '🔒', bg: '#ef444430', border: '#ef4444' },
    other: { label: '📄', bg: '#64748b30', border: '#64748b' },
};

function PageNode({ data }) {
    const auth = AUTH_BADGES[data.auth] || AUTH_BADGES.other;
    const catColor = data.catColor || '#3b82f6';
    const [hovered, setHovered] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);
    const hoverTimeout = useRef(null);
    const iframeRef = useRef(null);

    // Analytics data is injected via data.analytics (from parent)
    const analytics = data.analytics || null;
    const hasLive = analytics && analytics.active > 0;
    const hasViews = analytics && analytics.views > 0;

    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(() => {
            setHovered(true);
        }, 400); // 400ms delay to avoid accidental triggers
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeout.current);
        setHovered(false);
        setPreviewLoaded(false);
    };

    return (
        <div
            style={{
                position: 'relative',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Main node */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${catColor}18 0%, #0a0a1a 100%)`,
                    border: `1px solid ${hasLive ? '#22c55e' : catColor + '60'}`,
                    borderRadius: 10,
                    padding: '8px 12px',
                    minWidth: 140,
                    maxWidth: 190,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: hasLive
                        ? `0 0 16px #22c55e40, inset 0 0 20px #22c55e08`
                        : `0 0 12px ${catColor}20, inset 0 0 20px ${catColor}08`,
                    position: 'relative',
                    zIndex: hovered ? 50 : 1,
                }}
                onClick={() => {
                    if (data.url) window.open(data.url, '_blank');
                }}
            >
                <Handle type="target" position={Position.Top} style={{ background: catColor, width: 6, height: 6 }} />
                <Handle type="source" position={Position.Bottom} style={{ background: catColor, width: 6, height: 6 }} />
                <Handle type="target" position={Position.Left} id="left" style={{ background: catColor, width: 6, height: 6 }} />
                <Handle type="source" position={Position.Right} id="right" style={{ background: catColor, width: 6, height: 6 }} />

                {/* Live indicator pulse */}
                {hasLive && (
                    <div style={{
                        position: 'absolute', top: -4, right: -4, width: 10, height: 10,
                        borderRadius: '50%', background: '#22c55e',
                        boxShadow: '0 0 8px #22c55e80',
                        animation: 'pulse-live 1.5s infinite',
                    }} />
                )}

                {/* Top row: auth + category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span style={{
                        fontSize: 10, padding: '1px 5px', borderRadius: 4,
                        background: auth.bg, border: `1px solid ${auth.border}`,
                        color: auth.border, fontWeight: 600,
                    }}>
                        {auth.label}
                    </span>
                    <span style={{
                        fontSize: 8, padding: '1px 4px', borderRadius: 3,
                        background: `${catColor}25`, color: catColor,
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                        {data.catLabel}
                    </span>
                    {hasViews && (
                        <span style={{
                            fontSize: 8, padding: '1px 5px', borderRadius: 3,
                            background: '#3b82f620', color: '#60a5fa',
                            fontWeight: 600, marginLeft: 'auto',
                        }}>
                            {analytics.views} views
                        </span>
                    )}
                </div>

                {/* Label */}
                <div style={{ fontWeight: 600, fontSize: 12, color: '#e2e8f0', lineHeight: 1.3 }}>
                    {data.label}
                </div>

                {/* Path */}
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {data.path}
                </div>

                {/* Analytics mini-bar */}
                {hasViews && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, marginTop: 5,
                        padding: '3px 0', borderTop: '1px solid #1e293b20',
                    }}>
                        {hasLive && (
                            <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>
                                ● {analytics.active} live
                            </span>
                        )}
                        {analytics.avg_duration > 0 && (
                            <span style={{ fontSize: 8, color: '#64748b' }}>
                                {Math.round(analytics.avg_duration)}s avg
                            </span>
                        )}
                        {analytics.bounce_rate > 0 && (
                            <span style={{ fontSize: 8, color: analytics.bounce_rate > 70 ? '#ef4444' : '#64748b' }}>
                                {analytics.bounce_rate}% bounce
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Hover preview iframe — only renders after 400ms hover */}
            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: -320,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 380,
                        height: 280,
                        zIndex: 1000,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `2px solid ${catColor}80`,
                        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${catColor}30`,
                        background: '#0a0a1a',
                        transition: 'opacity 0.3s ease',
                        opacity: previewLoaded ? 1 : 0.7,
                    }}
                >
                    {/* Preview header */}
                    <div style={{
                        padding: '4px 10px',
                        background: 'rgba(15,15,26,0.95)',
                        borderBottom: `1px solid ${catColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'monospace' }}>
                            {data.url}
                        </span>
                        {hasLive && (
                            <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>
                                ● {analytics.active} live
                            </span>
                        )}
                    </div>

                    {/* Scaled iframe — renders actual page */}
                    <div style={{
                        width: 1280,
                        height: 800,
                        transform: 'scale(0.29)',
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                    }}>
                        <iframe
                            ref={iframeRef}
                            src={data.url}
                            title={`Preview: ${data.label}`}
                            width="1280"
                            height="800"
                            style={{
                                border: 'none',
                                background: '#0a0a1a',
                            }}
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin"
                            onLoad={() => setPreviewLoaded(true)}
                        />
                    </div>

                    {/* Loading indicator */}
                    {!previewLoaded && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 11, color: '#64748b',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <div style={{
                                width: 14, height: 14, borderRadius: '50%',
                                border: '2px solid #3b82f640',
                                borderTopColor: '#3b82f6',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            Loading preview...
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default memo(PageNode);
