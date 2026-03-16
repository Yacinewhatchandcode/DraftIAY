import React, { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_USER = 'MR ROBOT';
const AGENT_API = '/api/imac-agent';

export default function IMacAgent() {
    const [sshConnected, setSshConnected] = useState(null); // null=connecting, true=ok, false=failed
    const [showPasswordSetup, setShowPasswordSetup] = useState(false);
    const [sshUser, setSshUser] = useState(DEFAULT_USER);
    const [imacIp, setImacIp] = useState('192.168.1.186');
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordStatus, setPasswordStatus] = useState(''); // '', 'saving', 'success', 'error'

    // ── Claw Control State ──
    const [clawPrompt, setClawPrompt] = useState('');
    const [clawLogs, setClawLogs] = useState([]);
    const [isClawRunning, setIsClawRunning] = useState(false);

    // ══════════════════════════════════════════
    // CORE: Execute SSH command on iMac
    // ══════════════════════════════════════════
    const executeCommand = useCallback(async (cmd) => {
        try {
            const res = await fetch(AGENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'execute', command: "cmd.exe /c " + cmd, host: imacIp, user: sshUser }),
            });
            return await res.json().catch(() => ({ success: false }));
        } catch (err) {
            return { error: err.message, success: false };
        }
    }, [sshUser, imacIp]);

    const runClawAgent = async () => {
        const intent = clawPrompt.trim();
        if (!intent || !sshConnected) return;

        setIsClawRunning(true);
        setClawLogs([{ time: new Date().toLocaleTimeString(), text: `🚀 Initializing Autonomous Claw for intent: "${intent}"`, type: 'system' }]);
        setClawPrompt('');

        try {
            setClawLogs(p => [...p, { time: new Date().toLocaleTimeString(), text: `🧠 Reasoning via PrimeAI API... Translating intent into physical constraints...`, type: 'info' }]);

            const res = await fetch(AGENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'claw-intent', host: imacIp, user: sshUser, prompt: intent })
            });

            const data = await res.json();

            if (data.success) {
                setClawLogs(p => [...p, { time: new Date().toLocaleTimeString(), text: `⚡ AI Pipeline generated ${data.actions?.length || 0} action(s). Executing...`, type: 'success' }]);

                if (data.actions) {
                    data.actions.forEach((act, idx) => {
                        setTimeout(() => {
                            let desc = '';
                            if (act.type === 'execute') desc = `Executing CMD: ${act.command}`;
                            else if (act.type === 'click') desc = `Clicking (${act.x || 'current'}, ${act.y || 'pos'}) with ${act.button} button`;
                            else if (act.type === 'type') desc = `Typing: "${act.text}"`;
                            else if (act.type === 'press') desc = `Pressing key: [${act.key}]`;
                            else if (act.type === 'hotkey') desc = `Hotkey: [${act.keys.join(' + ')}]`;
                            else desc = `Action: ${act.type}`;

                            setClawLogs(p => [...p, { time: new Date().toLocaleTimeString(), text: `→ ${desc}`, type: 'system' }]);
                        }, idx * 100);
                    });
                }
            } else {
                setClawLogs(p => [...p, { time: new Date().toLocaleTimeString(), text: `❌ AI Error: ${data.error}`, type: 'error' }]);
            }

        } catch (err) {
            setClawLogs(p => [...p, { time: new Date().toLocaleTimeString(), text: `❌ Interface Error: ${err.message}`, type: 'error' }]);
        }

        setTimeout(() => setIsClawRunning(false), 1000);
    };

    // ══════════════════════════════════════════
    // SETUP: Save password
    // ══════════════════════════════════════════
    const handlePasswordSubmit = useCallback(async () => {
        if (!passwordInput.trim()) return;
        setPasswordStatus('saving');
        try {
            const res = await fetch(AGENT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'set-password', host: imacIp, user: sshUser, password: passwordInput }),
            });
            if (res.ok) {
                const testRes = await executeCommand('hostname && ver');
                if (testRes && testRes.success !== false) {
                    setPasswordStatus('success');
                    setSshConnected(true);
                    setTimeout(() => {
                        setShowPasswordSetup(false);
                        setPasswordInput('');
                        setPasswordStatus('');
                    }, 1000);
                } else {
                    setPasswordStatus('error');
                }
            } else {
                setPasswordStatus('error');
            }
        } catch (err) {
            setPasswordStatus('error');
        }
    }, [passwordInput, imacIp, sshUser, executeCommand]);

    // Initial Test
    useEffect(() => {
        executeCommand('echo test').then(res => {
            if (res && res.success !== false && !res.error?.includes('auth failed')) {
                setSshConnected(true);
            } else {
                setSshConnected(false);
                setShowPasswordSetup(true);
            }
        });
    }, [executeCommand]);

    return (
        <div style={{
            height: '100vh', width: '100vw', background: '#000', display: 'flex', flexDirection: 'column',
            fontFamily: "'Inter', sans-serif", color: '#fff', position: 'relative'
        }}>
            {/* ═══ HEADER ═══ */}
            <div style={{
                height: 48, background: 'rgba(5, 5, 15, 0.95)', borderBottom: '1px solid #1e293b',
                display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between',
                backdropFilter: 'blur(10px)', zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ margin: 0, fontSize: 13, fontWeight: 900, letterSpacing: '0.05em' }}>
                        🖥️ iMac <span style={{ color: '#8b5cf6' }}>Autonomous CLAW</span>
                    </h1>
                    {sshConnected ? (
                        <span style={{ fontSize: 10, background: '#22c55e20', color: '#22c55e', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                            ● LIVE — Win Boot Camp
                        </span>
                    ) : (
                        <span style={{ fontSize: 10, background: '#ef444420', color: '#ef4444', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                            ○ OFFLINE
                        </span>
                    )}
                </div>
            </div>

            {/* ═══ OS/PASSWORD SETUP OVERLAY ═══ */}
            {showPasswordSetup && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        background: '#0a0a1a', border: '1px solid #1e293b', borderRadius: 16,
                        padding: 32, width: 400, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900 }}>Connect SSH Tunnel</h2>
                        <input
                            type="text" value={sshUser} disabled
                            style={{
                                width: '100%', padding: '10px', borderRadius: 8, background: '#050510', border: '1px solid #334155', color: '#60a5fa', marginBottom: 12, textAlign: 'center',
                            }}
                        />
                        <input
                            type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                            placeholder="Password..."
                            style={{
                                width: '100%', padding: '12px', borderRadius: 8, background: '#050510', border: '1px solid #334155', color: '#e2e8f0', marginBottom: 12, textAlign: 'center',
                            }}
                        />
                        <button onClick={handlePasswordSubmit} style={{
                            width: '100%', padding: '12px', borderRadius: 8, cursor: 'pointer',
                            background: '#22c55e', border: 'none', color: 'white', fontWeight: 700,
                        }}>
                            {passwordStatus === 'saving' ? '⏳ CONNECTING...' : 'CONNECT'}
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ MAIN AUTONOMOUS VIEW ═══ */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* LEFT: REAL-TIME STREAM */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', background: '#000', borderRight: '1px solid #1e293b' }}>
                    <div style={{ padding: '8px 16px', background: '#0a0a15', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em' }}>🔴 LIVE MP4 STREAM (WINDOWS BOOTCAMP)</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {sshConnected ? (
                            <img
                                src={`http://127.0.0.1:5556/stream?t=${Date.now()}`}
                                alt="Live iMac Desktop Stream"
                                style={{
                                    width: '100%', height: '100%', objectFit: 'contain',
                                    border: '1px solid #1e293b', background: '#050510'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : null}

                        <div style={{ textAlign: 'center', display: sshConnected ? 'none' : 'block' }}>
                            <div style={{ fontSize: 50, marginBottom: 10 }}>📡</div>
                            <h3 style={{ color: '#ef4444', margin: '0 0 10px', fontSize: 18 }}>Waiting for Connection</h3>
                            <p style={{ color: '#64748b', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
                                Veuillez d'abord vous connecter. La vidéo chargée va s'afficher en temps réel du port 5556 via le proxy SSH.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: CLAW CONSOLE */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#05050a' }}>
                    <div style={{ padding: 30, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, color: '#e2e8f0' }}>🤖 Agent CLAW</h2>
                        <p style={{ margin: '0 0 30px', color: '#64748b', fontSize: 13 }}>Sovereign multi-modal automation intent engine.</p>

                        {/* Logs Terminal */}
                        <div style={{
                            flex: 1, background: '#0a0a15', borderRadius: 12, border: '1px solid #1e293b',
                            padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
                            fontFamily: 'monospace', fontSize: 12, marginBottom: 20
                        }}>
                            {clawLogs.length === 0 ? (
                                <div style={{ color: '#334155', textAlign: 'center', marginTop: 40 }}>Waiting for intent...</div>
                            ) : (
                                clawLogs.map((log, i) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: 12,
                                        color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#22c55e' : log.type === 'warn' ? '#eab308' : log.type === 'system' ? '#a855f7' : '#94a3b8'
                                    }}>
                                        <span style={{ color: '#475569', minWidth: 60 }}>[{log.time}]</span>
                                        <span>{log.text}</span>
                                    </div>
                                ))
                            )}
                            {isClawRunning && (
                                <div style={{ color: '#a855f7', animation: 'pulse 1.5s infinite' }}>agent_active...</div>
                            )}
                        </div>

                        {/* Prompt Box */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                value={clawPrompt}
                                onChange={(e) => setClawPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && runClawAgent()}
                                disabled={isClawRunning || !sshConnected}
                                placeholder="Intent (e.g. 'Ouvre Excel et crée une facture')"
                                style={{
                                    flex: 1, padding: '16px 20px', borderRadius: 12, border: '1px solid #1e293b',
                                    background: '#0a0a1a', color: '#fff', fontSize: 14, outline: 'none'
                                }}
                            />
                            <button
                                onClick={runClawAgent}
                                disabled={isClawRunning || !sshConnected || !clawPrompt.trim()}
                                style={{
                                    padding: '0 30px', borderRadius: 12, border: 'none', background: '#8b5cf6',
                                    color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                                    opacity: (isClawRunning || !sshConnected || !clawPrompt.trim()) ? 0.5 : 1
                                }}
                            >
                                EXECUTE
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: #475569; }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
