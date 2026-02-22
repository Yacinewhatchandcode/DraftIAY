import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { RefreshCw, Image as ImageIcon } from 'lucide-react';

const performGenerativeOrbit = async (prompt) => {
    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Generative Error');
        return data.url;
    } catch (err) {
        console.error("VPS Proxy Timeout:", err);
        return `https://picsum.photos/seed/${encodeURIComponent(prompt || 'sovereign')}/400/300`;
    }
};

export default function ImageNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const [isGenerating, setIsGenerating] = useState(false);
    const [glow, setGlow] = useState(false);

    const onPromptChange = (evt) => {
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === id) {
                    return {
                        ...n,
                        data: { ...n.data, prompt: evt.target.value }
                    };
                }
                return n;
            })
        );
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGlow(false);
        const imageUrl = await performGenerativeOrbit(data.prompt || "Abstract quantum cyber swarm node glassmorphism");

        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === id) {
                    return {
                        ...n,
                        data: { ...n.data, imageUrl }
                    };
                }
                return n;
            })
        );

        setIsGenerating(false);
        setGlow(true);
        setTimeout(() => setGlow(false), 2000);
    };

    return (
        <div className={`sticky-node node-color-purple ${selected ? 'selected' : ''} ${glow ? 'glitch-glow' : ''}`} style={{ width: 320 }}>
            <Handle type="target" position={Position.Top} className="handle-target" />
            <Handle type="target" position={Position.Left} id="left" className="handle-target" />

            <div className="drag-handle node-header">
                <span className="node-tag">Edge Generative</span>
            </div>

            <div className="node-content custom-drag flex flex-col gap-2">
                {data.imageUrl ? (
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-white/10 mb-2 nodrag">
                        <img src={data.imageUrl} alt="Generated Edge Art" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-full h-40 rounded-lg border border-dashed border-white/20 mb-2 flex flex-col items-center justify-center text-white/50 nodrag">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-xs">Awaiting Swarm Artifact</span>
                    </div>
                )}

                <input
                    value={data.prompt}
                    onChange={onPromptChange}
                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400 nodrag placeholder-white/30"
                    placeholder="Enter visual directive..."
                />
            </div>

            <div className="node-footer mt-2">
                <span className="node-author">VPS (31.97.52.22)</span>
                <button className="btn-ai nodrag" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <RefreshCw size={12} className="spin" /> : <ImageIcon size={12} />}
                    <span>{data.imageUrl ? 'Regenerate' : 'Generate'}</span>
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="handle-source" />
            <Handle type="source" position={Position.Right} id="right" className="handle-source" />
        </div>
    );
}
