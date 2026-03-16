import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const TYPE_ICONS = {
    database: '🗄️',
    server: '🖥️',
    gpu: '⚡',
    ai: '🧠',
    payment: '💳',
    integration: '🔗',
    hosting: '☁️',
    compute: '🧩',
};

function BackendNode({ data }) {
    const icon = TYPE_ICONS[data.backendType] || '⚙️';

    return (
        <div
            style={{
                background: `linear-gradient(135deg, ${data.color}15 0%, #0a0a1a 100%)`,
                border: `2px solid ${data.color}90`,
                borderRadius: 12,
                padding: '10px 14px',
                minWidth: 160,
                maxWidth: 200,
                cursor: 'default',
                boxShadow: `0 0 20px ${data.color}20, inset 0 0 30px ${data.color}05`,
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: data.color, width: 8, height: 8 }} />
            <Handle type="target" position={Position.Left} id="left" style={{ background: data.color, width: 6, height: 6 }} />
            <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 6, height: 6 }} />
            <Handle type="source" position={Position.Right} id="right" style={{ background: data.color, width: 6, height: 6 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{
                    fontSize: 8, padding: '1px 5px', borderRadius: 3,
                    background: `${data.color}25`, color: data.color,
                    fontWeight: 700, textTransform: 'uppercase',
                }}>
                    {data.backendType}
                </span>
                {data.apiCount > 0 && (
                    <span style={{
                        fontSize: 8, padding: '1px 5px', borderRadius: 3,
                        background: '#3b82f620', color: '#60a5fa',
                        fontWeight: 600, marginLeft: 'auto',
                    }}>
                        {data.apiCount} APIs
                    </span>
                )}
            </div>

            <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', lineHeight: 1.3 }}>
                {data.label}
            </div>

            {data.desc && (
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 3, lineHeight: 1.3 }}>
                    {data.desc}
                </div>
            )}
        </div>
    );
}

export default memo(BackendNode);
