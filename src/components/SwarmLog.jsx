import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Network, CheckCircle2, ChevronRight, X, Maximize2, Minimize2 } from 'lucide-react';

const mockLogs = [
    { id: 1, agent: 'Sovereign Node', type: 'system', text: 'Initializing multi-agent ecosystem brain (Vast.ai). Establishing secure H200 mapping protocol...', time: '00:00:01' },
    { id: 2, agent: 'Asset Generator', type: 'thinking', text: 'Scanning competitor analysis node. Extracting 3 unique gaps for UI composition logic.', time: '00:00:05' },
    { id: 3, agent: 'Logic Analyzer', type: 'executing', text: 'Bridging Node-1 to Node-2. Establishing real-time sync with 10x ROI architectural framework.', time: '00:00:12' },
    { id: 4, agent: 'Architecture Overseer', type: 'verified', text: 'Zero-illusion policy enforced on Group Node "Inspiration". All trace logs validated locally.', time: '00:00:15' },
];

const newThoughts = [
    { agent: 'Vagabond API', type: 'thinking', text: 'Routing new request to Asian Sovereign Tier. Bypassing risk control mechanisms...', time: '00:00:00' },
    { agent: 'Sentiens V2', type: 'executing', text: 'Diffusing generative output layer over React Flow nodes. Setting #0a0a0f void matrix.', time: '00:00:00' },
    { agent: 'Cognitive Core', type: 'thinking', text: 'Analyzing text data. Suggesting keywords: Glassmorphism, Reacting, Void.', time: '00:00:00' },
    { agent: 'Validation Node', type: 'verified', text: 'State updated successfully. Green truth verified across all sub-components.', time: '00:00:00' },
    { agent: 'UX Architect', type: 'thinking', text: 'Evaluating visual hierarchy. Elevating Z-index of navigation constructs for structural integrity.', time: '00:00:00' },
    { agent: 'Network Swarm', type: 'executing', text: 'Orchestrating concurrent edge-spline rendering between distributed sticky zones...', time: '00:00:00' },
    { agent: 'DeepSearch Graph', type: 'system', text: 'Recursive sync to Cognee Knowledge Graph complete. Absolute context locked.', time: '00:00:00' }
];

export default function SwarmLog({ isVisible, toggleVisibility }) {
    const [logs, setLogs] = useState(mockLogs);
    const [expanded, setExpanded] = useState(false);
    const logsEndRef = useRef(null);

    // Auto-scroll logic
    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs, expanded, isVisible]);

    // Simulate incoming agent thoughts
    useEffect(() => {
        if (!isVisible) return;

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < newThoughts.length) {
                setLogs(prev => {
                    const now = new Date();
                    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                    return [...prev, { ...newThoughts[currentIndex], id: Date.now(), time: timeString }];
                });
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 4500); // New thought every 4.5 seconds

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'system': return <Terminal size={12} className="text-blue-400" color="#60a5fa" />;
            case 'thinking': return <Cpu size={12} className="text-yellow-400" color="#fbbf24" />;
            case 'executing': return <Network size={12} className="text-purple-400" color="#c084fc" />;
            case 'verified': return <CheckCircle2 size={12} className="text-green-400" color="#34d399" />;
            default: return <ChevronRight size={12} color="#9ca3af" />;
        }
    };

    const getBadgeClass = (type) => {
        switch (type) {
            case 'system': return 'badge-blue';
            case 'thinking': return 'badge-yellow';
            case 'executing': return 'badge-purple';
            case 'verified': return 'badge-green';
            default: return 'badge-grey';
        }
    };

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`swarm-log-panel ${expanded ? 'expanded' : ''}`}
        >
            <div className="log-header">
                <div className="flex items-center gap-2 log-title">
                    <Network size={16} color="#ec4899" />
                    <span>Swarm Brain Logger</span>
                    <span className="live-pulse"></span>
                </div>
                <div className="flex gap-2">
                    <button className="log-btn" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button className="log-btn exit-btn" onClick={toggleVisibility}>
                        <X size={14} />
                    </button>
                </div>
            </div>

            <div className="log-content custom-scrollbar">
                <AnimatePresence>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="log-entry"
                        >
                            <div className="log-meta">
                                <span className="log-time">[{log.time}]</span>
                                <span className={`log-badge ${getBadgeClass(log.type)}`}>
                                    {getIcon(log.type)}
                                    <span>{log.agent}</span>
                                </span>
                            </div>
                            <div className="log-text">
                                <span className="log-chevron">›</span>
                                {log.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={logsEndRef} />
            </div>
        </motion.div>
    );
}
