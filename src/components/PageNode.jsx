import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const AUTH_BADGES = {
    public: { label: '🔓', bg: '#22c55e30', border: '#22c55e' },
    paid: { label: '🔑', bg: '#f9731630', border: '#f97316' },
    e2f: { label: '🔒', bg: '#ef444430', border: '#ef4444' },
    other: { label: '📄', bg: '#64748b30', border: '#64748b' },
    redirect: { label: '↗️', bg: '#78716c30', border: '#78716c' },
};

function PageNode({ data }) {
    const auth = AUTH_BADGES[data.auth] || AUTH_BADGES.other;
    const catColor = data.catColor || '#3b82f6';

    return (
        <div
            style={{
                background: `linear-gradient(135deg, ${catColor}18 0%, #0a0a1a 100%)`,
                border: `1px solid ${catColor}60`,
                borderRadius: 10,
                padding: '8px 12px',
                minWidth: 120,
                maxWidth: 180,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: `0 0 12px ${catColor}20, inset 0 0 20px ${catColor}08`,
                position: 'relative',
            }}
            className="page-node"
            onClick={() => {
                if (data.url) window.open(data.url, '_blank');
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = `0 0 24px ${catColor}50, inset 0 0 30px ${catColor}15`;
                e.currentTarget.style.borderColor = catColor;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 0 12px ${catColor}20, inset 0 0 20px ${catColor}08`;
                e.currentTarget.style.borderColor = `${catColor}60`;
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: catColor, width: 6, height: 6 }} />
            <Handle type="source" position={Position.Bottom} style={{ background: catColor, width: 6, height: 6 }} />
            <Handle type="target" position={Position.Left} id="left" style={{ background: catColor, width: 6, height: 6 }} />
            <Handle type="source" position={Position.Right} id="right" style={{ background: catColor, width: 6, height: 6 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                    style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: auth.bg,
                        border: `1px solid ${auth.border}`,
                        color: auth.border,
                        fontWeight: 600,
                    }}
                >
                    {auth.label}
                </span>
                <span
                    style={{
                        fontSize: 9,
                        padding: '1px 4px',
                        borderRadius: 3,
                        background: `${catColor}25`,
                        color: catColor,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                    }}
                >
                    {data.catLabel}
                </span>
            </div>

            <div style={{ fontWeight: 600, fontSize: 12, color: '#e2e8f0', lineHeight: 1.3 }}>
                {data.label}
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {data.path}
            </div>
        </div>
    );
}

export default memo(PageNode);
