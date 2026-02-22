import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Wand2, RefreshCw } from 'lucide-react';

const simulateAiRephrase = async (text) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!text || text.trim() === '') {
                resolve("Empty Context");
                return;
            }
            const words = text.split(/[\s,.]+/).filter(w => w.trim().length > 3);
            if (words.length === 0) resolve("Brainstorming");
            const uniqueKeywords = [...new Set(words)];
            const topWords = uniqueKeywords.sort(() => 0.5 - Math.random()).slice(0, Math.min(5, uniqueKeywords.length));
            const keywords = topWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
            resolve(keywords.join(' · '));
        }, 1200);
    });
};

export default function StickyNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [glow, setGlow] = useState(false);

    const onChange = (evt) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: { ...node.data, label: evt.target.value },
                    };
                }
                return node;
            })
        );
    };

    const handleRephrase = async () => {
        setIsAiLoading(true);
        setGlow(false);
        const result = await simulateAiRephrase(data.label);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: { ...node.data, label: result, tag: 'Rephrased' },
                    };
                }
                return node;
            })
        );
        setIsAiLoading(false);
        setGlow(true);
        setTimeout(() => setGlow(false), 1500);
    };

    return (
        <div className={`sticky-node node-color-${data.color || 'yellow'} ${selected ? 'selected' : ''} ${glow ? 'glitch-glow' : ''}`}>
            <Handle type="target" position={Position.Top} className="handle-target" />
            <Handle type="target" position={Position.Left} id="left" className="handle-target" />

            <div className="drag-handle node-header">
                <span className="node-tag">{data.tag || 'Draft'}</span>
            </div>

            <div className="node-content custom-drag">
                <textarea
                    value={data.label}
                    onChange={onChange}
                    className="node-textarea nodrag"
                    placeholder="New idea..."
                />
            </div>

            <div className="node-footer">
                <span className="node-author">By AIY Swarm</span>
                <button className="btn-ai nodrag" onClick={handleRephrase} disabled={isAiLoading}>
                    {isAiLoading ? <RefreshCw size={12} className="spin" /> : <Wand2 size={12} />}
                    <span>Rephrase</span>
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="handle-source" />
            <Handle type="source" position={Position.Right} id="right" className="handle-source" />
        </div>
    );
}
