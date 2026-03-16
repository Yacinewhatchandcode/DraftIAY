import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Volume2, Sparkles, Video, Code, Terminal, Play, X, ChevronRight, Wand2, Minimize2, Maximize2 } from 'lucide-react';
import './SovereignOrb.css';

/**
 * SOVEREIGN ORB v3.2
 * Primary Interface for M4/Metal GPU Model Fleet
 */
export default function SovereignOrb() {
    const [status, setStatus] = useState('idle'); // idle | listening | thinking | generating | success
    const [inputValue, setInputValue] = useState('');
    const [activeIntent, setActiveIntent] = useState(null); // 'video' | 'code' | 'voice'
    const [output, setOutput] = useState(null);
    const canvasRef = useRef(null);
    const [isInterfaceVisible, setIsInterfaceVisible] = useState(true);

    // Dynamic Orb Animation Logic (Procedural Canvas)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frame = 0;
        let animationFrameId;

        const render = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const baseRadius = 60;

            // Pulse logic based on status
            const pulse = status === 'thinking' ? Math.sin(frame * 0.1) * 10 : 0;
            const wave = status === 'listening' ? Math.sin(frame * 0.2) * 5 : 0;

            // Gradient creation
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius + pulse);

            if (status === 'thinking') {
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Purple
                gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');  // Pink Fade
            } else if (status === 'listening') {
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');  // Blue
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');   // Green Fade
            } else if (status === 'generating') {
                gradient.addColorStop(0, 'rgba(244, 63, 94, 0.8)');   // Red
                gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');   // Orange Fade
            } else if (status === 'success') {
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');  // Green
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)'); // Idle Purple
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            }

            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + pulse + wave, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Core Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'white';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.shadowBlur = 0;

            animationFrameId = window.requestAnimationFrame(render);
        };

        render();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [status]);

    const handleSend = async (textOverride = null) => {
        const textToProcess = textOverride || inputValue;
        if (!textToProcess.trim()) return;

        setStatus('thinking');
        setInputValue('');

        try {
            // ── Call the REAL Sovereign Dispatch ──
            const response = await fetch('/api/orb-dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToProcess,
                    mode: 'enterprise', // Power mode
                    language: 'en-US'
                })
            });

            if (!response.ok) throw new Error('Dispatch sync failed.');
            const data = await response.json();

            // ── Synthesis Layer (TTS) ──
            if (data.response) {
                const utterance = new SpeechSynthesisUtterance(data.response);
                utterance.rate = 1.1;
                utterance.pitch = 0.9; // Deeper, more authority
                window.speechSynthesis.speak(utterance);
            }

            setStatus('generating');

            // Map the unified response to the UI
            setOutput({
                type: data.action?.category || 'talk',
                content: data.response,
                action: data.action,
                modules: data.activeModules
            });

            setStatus('success');

            // Auto-reset after a while
            setTimeout(() => setStatus('idle'), 8000);

        } catch (err) {
            console.error('[Sovereign Log] Dispatch Error:', err);
            setStatus('idle');
            setOutput({
                type: 'error',
                content: 'Sync interrupted. Local LLM fallback engaged.'
            });
        }
    };

    // Speech Recognition Integration
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setStatus('listening');
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSend(transcript);
        };
        recognition.onerror = () => setStatus('idle');
        recognition.start();
    };

    return (
        <div className="sovereign-orb-container">
            <AnimatePresence>
                {isInterfaceVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="orb-main-wrapper"
                    >
                        {/* THE ORB */}
                        <div className={`orb-visual-ring status-${status}`}>
                            <canvas ref={canvasRef} width={300} height={300} className="orb-canvas" />
                            <div className="orb-inner-sparkle">
                                {status === 'idle' && <Sparkles size={24} color="white" />}
                                {status === 'thinking' && <Wand2 size={24} color="white" className="spin" />}
                                {status === 'success' && <Play size={24} color="white" />}
                            </div>
                        </div>

                        {/* STATUS MESSAGE */}
                        <div className="status-label">
                            {status === 'idle' && "SOVEREIGN v3.2 · READY"}
                            {status === 'listening' && "LISTENING TO INTENT..."}
                            {status === 'thinking' && "ROUTING TO M4 GPU..."}
                            {status === 'generating' && "SYNTHESIZING AGENTIC OUTPUT..."}
                            {status === 'success' && "INTENT MATERIALIZED"}
                        </div>

                        {/* INPUT BAY */}
                        <div className="orb-input-bay">
                            <button className="icon-btn" onClick={startListening}>
                                <Mic size={20} color={status === 'listening' ? '#ef4444' : '#94a3b8'} />
                            </button>
                            <input
                                type="text"
                                placeholder="Describe intent (Video, Code, Voice)..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="orb-input"
                            />
                            <button className="send-btn" onClick={handleSend}>
                                <Send size={20} />
                            </button>
                        </div>

                        {/* ARTIFACTS / OUTPUT CARDS */}
                        <AnimatePresence>
                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="output-card"
                                >
                                    <div className="card-header">
                                        {output.type === 'video' ? <Video size={14} /> :
                                            output.type === 'code' ? <Code size={14} /> : <Terminal size={14} />}
                                        <span>AGENCY PROOF</span>
                                        <button className="close-card" onClick={() => setOutput(null)}><X size={12} /></button>
                                    </div>
                                    <div className="card-body">
                                        <div className="artifact-pill">{output.content}</div>
                                        <div className="card-actions">
                                            <button className="action-btn">
                                                <Play size={12} />
                                                <span>EXECUTE</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TELEMETRY */}
                        <div className="orb-telemetry">
                            <div className="tele-item">
                                <span className="tele-dot green"></span>
                                <span>M4 METAL: 27GB WIRED</span>
                            </div>
                            <div className="tele-item">
                                <span className="tele-dot blue"></span>
                                <span>RESERVOIR: MOUNTED</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button className="orb-visibility-toggle" onClick={() => setIsInterfaceVisible(!isInterfaceVisible)}>
                {isInterfaceVisible ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
        </div>
    );
}
