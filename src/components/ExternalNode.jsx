import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function ExternalNode({ data }) {
    const typeColors = {
        vercel: '#000000',
        render: '#46e3b7',
        fly: '#8b5cf6',
        supabase: '#3ecf8e',
    };
    const color = typeColors[data.type] || '#78716c';

    return (
        <div
            style={{
                background: `linear-gradient(135deg, ${color}20 0%, #0a0a1a 100%)`,
                border: `1px dashed ${color}80`,
                borderRadius: 10,
                padding: '8px 12px',
                minWidth: 140,
                maxWidth: 200,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: `0 0 12px ${color}15`,
            }}
            onClick={() => {
                if (data.url) window.open(data.url, '_blank');
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = `0 0 24px ${color}40`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 0 12px ${color}15`;
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: color, width: 6, height: 6 }} />
            <Handle type="source" position={Position.Bottom} style={{ background: color, width: 6, height: 6 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>🌐</span>
                <span style={{
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: `${color}30`,
                    color: color === '#000000' ? '#fff' : color,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                }}>
                    {data.type}
                </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 11, color: '#e2e8f0', lineHeight: 1.3 }}>
                {data.label}
            </div>
        </div>
    );
}

export default memo(ExternalNode);
