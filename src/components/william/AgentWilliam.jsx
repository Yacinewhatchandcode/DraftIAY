import React, { useState, useEffect, useCallback, useRef } from 'react';

const WILLIAM_API = '/api/william';

const OS_ICONS = { 'macos': '🍎', 'macos-15': '🍎', 'macos-14': '🍎', 'macos-13': '🍎', 'linux': '🐧', 'ubuntu-20.04': '🐧', 'windows': '🪟', 'unknown': '❓' };
const OS_LABELS = { 'macos-15': 'macOS 15 Sequoia', 'macos-14': 'macOS 14 Sonoma', 'macos-13': 'macOS 13 Ventura', 'macos': 'macOS', 'ubuntu-20.04': 'Ubuntu 20.04', 'linux': 'Linux', 'windows': 'Windows', 'unknown': 'Unknown' };
const SERVICE_COLORS = { SSH: '#22c55e', SMB: '#3b82f6', RDP: '#a855f7', VNC: '#f59e0b', HTTP: '#64748b', HTTPS: '#64748b', 'HTTP-ALT': '#64748b', 'HTTP-ALT-2': '#64748b', 'Node/Dev': '#22d3ee', 'Vite': '#a78bfa', 'Flask/API': '#34d399', 'Ollama': '#f97316', 'Jupyter': '#f59e0b', 'App': '#60a5fa', 'API': '#10b981', 'Prometheus': '#ef4444', 'HTTPS-ALT': '#64748b' };

function Badge({ color, children }) {
    return (
        <span style={{
            fontSize: 7, padding: '1px 5px', borderRadius: 3,
            background: `${color}20`, color, fontWeight: 800,
            whiteSpace: 'nowrap', lineHeight: '14px', display: 'inline-block',
        }}>{children}</span>
    );
}

function StatusDot({ alive }) {
    return <span style={{
        width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
        background: alive ? '#22c55e' : '#ef4444',
        boxShadow: alive ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
    }} />;
}

export default function AgentWilliam() {
    const [devices, setDevices] = useState([]);
    const [vaultDevices, setVaultDevices] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [probeData, setProbeData] = useState(null);
    const [probing, setProbing] = useState(false);
    const [commandInput, setCommandInput] = useState('');
    const [commandOutput, setCommandOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [screenshot, setScreenshot] = useState(null);
    const outputRef = useRef(null);

    // Register form
    const [showRegister, setShowRegister] = useState(false);
    const [regHost, setRegHost] = useState('');
    const [regUser, setRegUser] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regLabel, setRegLabel] = useState('');
    const [regStatus, setRegStatus] = useState('');

    // ═══ API CALL HELPER ═══
    const apiCall = useCallback(async (body) => {
        try {
            const res = await fetch(WILLIAM_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                try { return JSON.parse(text); } catch { return { error: text || `HTTP ${res.status}`, success: false }; }
            }
            return await res.json();
        } catch (err) {
            return { error: err.message, success: false };
        }
    }, []);

    // ═══ DISCOVERY ═══
    const scanNetwork = useCallback(async () => {
        setScanning(true);
        const data = await apiCall({ action: 'discover' });
        if (data.devices) setDevices(data.devices);
        setScanning(false);
    }, [apiCall]);

    // ═══ VAULT ═══
    const loadVault = useCallback(async () => {
        const data = await apiCall({ action: 'vault' });
        if (data.devices) setVaultDevices(data.devices);
    }, [apiCall]);

    // ═══ DEEP PROBE ═══
    const deepProbe = useCallback(async (ip) => {
        setProbing(true);
        setProbeData(null);
        const data = await apiCall({ action: 'deep-probe', host: ip });
        setProbeData(data);
        setProbing(false);
    }, [apiCall]);

    // ═══ REGISTER ═══
    const registerDevice = useCallback(async () => {
        if (!regHost || !regUser) return;
        setRegStatus('connecting');
        const data = await apiCall({
            action: 'register',
            host: regHost, user: regUser,
            password: regPassword, label: regLabel || `Device ${regHost}`,
        });
        setRegStatus(data.success ? 'success' : 'error');
        setCommandOutput(data.message || JSON.stringify(data));
        if (data.success) {
            loadVault();
            setTimeout(() => { setShowRegister(false); setRegStatus(''); }, 1200);
        }
    }, [regHost, regUser, regPassword, regLabel, loadVault, apiCall]);

    // ═══ EXECUTE ═══
    const executeCommand = useCallback(async (cmd, host) => {
        if (!cmd || !host) return;
        setIsExecuting(true);
        setCommandOutput(prev => prev + `\n$ ${cmd}\n`);
        const data = await apiCall({ action: 'execute', host, command: cmd });
        setCommandOutput(prev => prev + (data.output || data.error || 'No output') + '\n');
        setIsExecuting(false);
        setTimeout(() => { if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight; }, 50);
    }, [apiCall]);

    // ═══ SCREENSHOT ═══
    const captureScreen = useCallback(async (host) => {
        const data = await apiCall({ action: 'screenshot', host });
        if (data.screenshot) setScreenshot(`data:image/png;base64,${data.screenshot}`);
        else setCommandOutput(prev => prev + `\nScreenshot error: ${data.error}\n`);
    }, [apiCall]);

    // ═══ SELECT DEVICE ═══
    const selectDevice = useCallback((device) => {
        setSelectedDevice(device);
        setProbeData(null);
        setCommandOutput('');
        setScreenshot(null);
        deepProbe(device.ip);
    }, [deepProbe]);

    // ═══ INIT ═══
    useEffect(() => { loadVault(); }, [loadVault]);

    // ═══ RENDER ═══
    return (
        <div style={{
            width: '100vw', height: '100vh', background: '#050510',
            display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif",
            color: '#e2e8f0', overflow: 'hidden',
        }}>
            {/* ═══ HEADER ═══ */}
            <div style={{
                padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(180deg, #0f0f1a 0%, #050510 100%)', borderBottom: '1px solid #1e293b',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>🛡️</span>
                    <h1 style={{ margin: 0, fontSize: 15, fontWeight: 900, letterSpacing: '-0.02em' }}>
                        Agent <span style={{ color: '#f59e0b' }}>William</span>
                    </h1>
                    <Badge color="#22c55e">WLAN CONTROLLER</Badge>
                    <Badge color="#a855f7">A2A + MCP</Badge>
                    <span style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>
                        {vaultDevices.length} registered · {devices.length} discovered
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={scanNetwork} disabled={scanning} style={{
                        fontSize: 10, padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
                        background: scanning ? '#f59e0b20' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: scanning ? '#f59e0b' : '#000',
                        border: 'none', fontWeight: 800, transition: 'all 0.2s',
                    }}>
                        {scanning ? '⏳ SCANNING...' : '📡 SCAN NETWORK'}
                    </button>
                    <button onClick={() => { setShowRegister(true); setRegHost(selectedDevice?.ip || ''); }} style={{
                        fontSize: 10, padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
                        background: '#3b82f615', color: '#60a5fa', border: '1px solid #3b82f640', fontWeight: 700,
                    }}>+ REGISTER</button>
                    <a href="#/" style={{
                        fontSize: 10, color: '#475569', textDecoration: 'none',
                        padding: '5px 10px', borderRadius: 6, border: '1px solid #1e293b',
                        display: 'flex', alignItems: 'center',
                    }}>← EXIT</a>
                </div>
            </div>

            {/* ═══ REGISTER OVERLAY ═══ */}
            {showRegister && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#0f0f1a', border: '1px solid #1e293b', borderRadius: 16,
                        padding: 28, width: 420, textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
                        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 900 }}>Register Device with William</h2>
                        <p style={{ fontSize: 10, color: '#64748b', marginBottom: 14 }}>
                            All connections will flow through Agent William's encrypted gateway.
                        </p>
                        {[
                            { val: regLabel, set: setRegLabel, ph: 'Device label (e.g. "iMac Office")', type: 'text' },
                            { val: regHost, set: setRegHost, ph: 'IP address (e.g. 192.168.1.13)', type: 'text', mono: true },
                            { val: regUser, set: setRegUser, ph: 'SSH username', type: 'text', mono: true },
                            { val: regPassword, set: setRegPassword, ph: 'Password', type: 'password' },
                        ].map((f, i) => (
                            <input
                                key={i}
                                type={f.type}
                                value={f.val}
                                onChange={e => f.set(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && i === 3 && registerDevice()}
                                placeholder={f.ph}
                                style={{
                                    width: '100%', padding: '9px 12px', borderRadius: 8,
                                    background: '#050510', border: '1px solid #334155',
                                    color: f.mono ? '#60a5fa' : '#e2e8f0', fontSize: 11, outline: 'none',
                                    marginBottom: 5, fontFamily: f.mono ? 'monospace' : 'inherit',
                                }}
                            />
                        ))}
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button onClick={() => setShowRegister(false)} style={{
                                flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
                                background: '#1e293b', border: 'none', color: '#64748b', fontSize: 10, fontWeight: 700,
                            }}>CANCEL</button>
                            <button onClick={registerDevice} disabled={!regHost || !regUser} style={{
                                flex: 2, padding: '9px', borderRadius: 8, cursor: 'pointer',
                                background: regStatus === 'success' ? '#22c55e' : regStatus === 'error' ? '#ef4444' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                border: 'none', color: regStatus ? 'white' : '#000',
                                fontSize: 11, fontWeight: 800,
                                opacity: (!regHost || !regUser) ? 0.4 : 1,
                            }}>
                                {regStatus === 'connecting' ? '⏳ CONNECTING...' : regStatus === 'success' ? '✅ REGISTERED!' : regStatus === 'error' ? '❌ RETRY' : '🛡️ REGISTER & CONNECT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MAIN LAYOUT ═══ */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* LEFT: Device list */}
                <div style={{
                    width: 310, borderRight: '1px solid #1e293b', overflowY: 'auto',
                    background: '#080812', flexShrink: 0,
                }}>
                    {/* Vault */}
                    <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: 8, fontWeight: 800, color: '#f59e0b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            🛡️ Registered ({vaultDevices.length})
                        </div>
                        {vaultDevices.length === 0 && (
                            <p style={{ fontSize: 9, color: '#334155', textAlign: 'center', padding: 12 }}>
                                No registered devices. Scan network first.
                            </p>
                        )}
                        {vaultDevices.map(d => (
                            <div key={d.ip} onClick={() => selectDevice(d)} style={{
                                padding: '7px 9px', borderRadius: 7, marginBottom: 3, cursor: 'pointer',
                                background: selectedDevice?.ip === d.ip ? '#f59e0b10' : '#0a0a14',
                                border: `1px solid ${selectedDevice?.ip === d.ip ? '#f59e0b40' : '#1e293b'}`,
                                transition: 'all 0.15s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ fontSize: 11 }}>{OS_ICONS[d.os] || '❓'}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, flex: 1 }}>{d.label}</span>
                                    <Badge color={d.authMethod === 'key' ? '#22c55e' : '#f59e0b'}>
                                        {d.authMethod === 'key' ? '🔑 KEY' : '🔒 PASS'}
                                    </Badge>
                                </div>
                                <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace', marginTop: 1 }}>
                                    {d.user}@{d.ip}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Discovered */}
                    <div style={{ padding: '10px', borderTop: '1px solid #1e293b' }}>
                        <div style={{ fontSize: 8, fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            📡 Discovered ({devices.length})
                        </div>
                        {devices.length === 0 && (
                            <p style={{ fontSize: 9, color: '#334155', textAlign: 'center', padding: 12 }}>
                                Click "SCAN NETWORK"
                            </p>
                        )}
                        {devices.filter(d => d.ip !== '192.168.1.255').map(d => (
                            <div key={d.ip} onClick={() => selectDevice(d)} style={{
                                padding: '6px 9px', borderRadius: 6, marginBottom: 2, cursor: 'pointer',
                                background: selectedDevice?.ip === d.ip ? '#3b82f60c' : 'transparent',
                                border: `1px solid ${selectedDevice?.ip === d.ip ? '#3b82f630' : 'transparent'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 10 }}>{OS_ICONS[d.os] || '❓'}</span>
                                    <span style={{ fontSize: 10, fontFamily: 'monospace', flex: 1, fontWeight: 600 }}>{d.ip}</span>
                                    {d.registered && <Badge color="#22c55e">✓ REG</Badge>}
                                    {d.ports?.map(p => (
                                        <Badge key={p.port} color={SERVICE_COLORS[p.service] || '#64748b'}>{p.service}</Badge>
                                    ))}
                                </div>
                                <div style={{ fontSize: 8, color: '#475569', marginTop: 1 }}>
                                    {d.hostname !== '?' ? d.hostname : ''} · {d.mac}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Intelligence Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedDevice ? (
                        <>
                            {/* Device header bar */}
                            <div style={{
                                padding: '8px 14px', background: '#0a0a14', borderBottom: '1px solid #1e293b',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusDot alive={probeData?.alive} />
                                    <span style={{ fontSize: 13, fontWeight: 800 }}>
                                        {OS_ICONS[probeData?.osDetected || selectedDevice.os] || '❓'}{' '}
                                        {selectedDevice.label || selectedDevice.hostname || selectedDevice.ip}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>
                                        {selectedDevice.user ? `${selectedDevice.user}@` : ''}{selectedDevice.ip}
                                    </span>
                                    {probeData?.latency && <Badge color="#22c55e">{probeData.latency}</Badge>}
                                    {probeData?.osDetected && probeData.osDetected !== 'unknown' && (
                                        <Badge color="#a855f7">{OS_LABELS[probeData.osDetected] || probeData.osDetected}</Badge>
                                    )}
                                    {probeData?.sshBanner && <Badge color="#3b82f6">{probeData.sshBanner}</Badge>}
                                </div>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <button onClick={() => deepProbe(selectedDevice.ip)} disabled={probing} style={{
                                        fontSize: 9, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                                        background: probing ? '#f59e0b20' : '#f59e0b15', color: '#f59e0b',
                                        border: '1px solid #f59e0b30', fontWeight: 700,
                                    }}>{probing ? '⏳ PROBING...' : '🔍 DEEP PROBE'}</button>
                                    <button onClick={() => captureScreen(selectedDevice.ip)} style={{
                                        fontSize: 9, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                                        background: '#3b82f615', color: '#60a5fa', border: '1px solid #3b82f630', fontWeight: 700,
                                    }}>📸 Screenshot</button>
                                    {!selectedDevice.registered && (
                                        <button onClick={() => { setShowRegister(true); setRegHost(selectedDevice.ip); setRegLabel(selectedDevice.hostname || ''); }} style={{
                                            fontSize: 9, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                                            background: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30', fontWeight: 700,
                                        }}>🛡️ Register</button>
                                    )}
                                </div>
                            </div>

                            {/* Intelligence body */}
                            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                                {/* Probe results grid */}
                                <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {/* Open Ports */}
                                    <div style={{ background: '#0a0a14', border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
                                        <div style={{ fontSize: 8, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                                            🔌 Open Ports
                                        </div>
                                        {probing && <div style={{ fontSize: 10, color: '#f59e0b' }}>Scanning ports...</div>}
                                        {probeData?.openPorts?.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                                {probeData.openPorts.map(p => (
                                                    <div key={p.port} style={{
                                                        fontSize: 9, padding: '3px 7px', borderRadius: 4,
                                                        background: `${SERVICE_COLORS[p.service] || '#64748b'}15`,
                                                        border: `1px solid ${SERVICE_COLORS[p.service] || '#64748b'}30`,
                                                        color: SERVICE_COLORS[p.service] || '#64748b',
                                                        fontWeight: 700,
                                                    }}>
                                                        <span style={{ fontFamily: 'monospace' }}>{p.port}</span> {p.service}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !probing && (
                                            <div style={{ fontSize: 9, color: '#334155' }}>No open ports detected</div>
                                        )}
                                    </div>

                                    {/* Device Info */}
                                    <div style={{ background: '#0a0a14', border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
                                        <div style={{ fontSize: 8, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                                            📋 Device Info
                                        </div>
                                        {probeData ? (
                                            <div style={{ fontSize: 9, fontFamily: 'monospace', lineHeight: '16px' }}>
                                                <div><span style={{ color: '#64748b' }}>Status:</span> <span style={{ color: probeData.alive ? '#22c55e' : '#ef4444' }}>{probeData.alive ? '● ONLINE' : '● OFFLINE'}</span></div>
                                                <div><span style={{ color: '#64748b' }}>Latency:</span> <span style={{ color: '#e2e8f0' }}>{probeData.latency || '—'}</span></div>
                                                <div><span style={{ color: '#64748b' }}>OS:</span> <span style={{ color: '#a855f7' }}>{OS_LABELS[probeData.osDetected] || probeData.osDetected}</span></div>
                                                <div><span style={{ color: '#64748b' }}>SSH:</span> <span style={{ color: '#3b82f6' }}>{probeData.sshBanner || '—'}</span></div>
                                                <div><span style={{ color: '#64748b' }}>Hostname:</span> <span style={{ color: '#e2e8f0' }}>{probeData.hostname || selectedDevice.hostname || '—'}</span></div>
                                                {probeData.smbInfo && (
                                                    <div><span style={{ color: '#64748b' }}>SMB:</span> <span style={{ color: '#3b82f6' }}>{probeData.smbInfo.server || ''} / {probeData.smbInfo.workgroup || ''}</span></div>
                                                )}
                                            </div>
                                        ) : probing ? (
                                            <div style={{ fontSize: 9, color: '#f59e0b' }}>Probing device...</div>
                                        ) : (
                                            <div style={{ fontSize: 9, color: '#334155' }}>Click DEEP PROBE</div>
                                        )}
                                    </div>

                                    {/* Detected Agents */}
                                    <div style={{ background: '#0a0a14', border: '1px solid #1e293b', borderRadius: 8, padding: 10, gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: 8, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                                            🤖 Detected Agents & Services
                                        </div>
                                        {probing && <div style={{ fontSize: 10, color: '#f59e0b' }}>Scanning for agents, MCP servers, Ollama, A2A endpoints...</div>}
                                        {probeData?.agents?.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {probeData.agents.map((a, i) => (
                                                    <div key={i} style={{
                                                        padding: '6px 10px', borderRadius: 6,
                                                        background: a.agentType === 'A2A' ? '#a855f710' : a.agentType === 'Ollama' ? '#f9731610' : '#22c55e08',
                                                        border: `1px solid ${a.agentType === 'A2A' ? '#a855f730' : a.agentType === 'Ollama' ? '#f9731630' : '#22c55e20'}`,
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ fontSize: 12 }}>
                                                                {a.agentType === 'A2A' ? '🔗' : a.agentType === 'Ollama' ? '🦙' : '🌐'}
                                                            </span>
                                                            <span style={{ fontSize: 10, fontWeight: 700, flex: 1 }}>
                                                                {a.agentName || a.type}
                                                            </span>
                                                            <Badge color={a.agentType === 'A2A' ? '#a855f7' : a.agentType === 'Ollama' ? '#f97316' : '#22c55e'}>
                                                                {a.agentType || 'HTTP'}
                                                            </Badge>
                                                            <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#64748b' }}>
                                                                :{a.port}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#475569', marginTop: 2 }}>
                                                            {a.url}
                                                        </div>
                                                        {a.models && a.models.length > 0 && (
                                                            <div style={{ fontSize: 8, color: '#f97316', marginTop: 2 }}>
                                                                Models: {a.models.join(', ')}
                                                            </div>
                                                        )}
                                                        {a.capabilities && (
                                                            <div style={{ fontSize: 8, color: '#a855f7', marginTop: 2 }}>
                                                                Capabilities: {typeof a.capabilities === 'object' ? Object.keys(a.capabilities).join(', ') : String(a.capabilities)}
                                                            </div>
                                                        )}
                                                        {a.details && (
                                                            <div style={{ fontSize: 8, color: '#22c55e', marginTop: 2 }}>
                                                                {a.details.name && `Name: ${a.details.name} `}
                                                                {a.details.version && `v${a.details.version} `}
                                                                {a.details.status && `[${a.details.status}]`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !probing && probeData && (
                                            <div style={{ fontSize: 9, color: '#334155' }}>
                                                No agents, MCP servers, or A2A endpoints detected on this device.
                                            </div>
                                        )}

                                        {/* HTTP services (page titles) */}
                                        {probeData?.httpServices?.length > 0 && (
                                            <div style={{ marginTop: 6, borderTop: '1px solid #1e293b', paddingTop: 6 }}>
                                                <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>HTTP Services:</div>
                                                {probeData.httpServices.map((s, i) => (
                                                    <div key={i} style={{ fontSize: 9, fontFamily: 'monospace', color: '#94a3b8' }}>
                                                        :{s.port} → {s.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Screenshot area */}
                                {screenshot && (
                                    <div style={{ padding: '0 14px 10px', flexShrink: 0 }}>
                                        <div style={{ background: '#000', borderRadius: 8, border: '1px solid #1e293b', overflow: 'hidden' }}>
                                            <img src={screenshot} alt="Remote screen" style={{ width: '100%', display: 'block' }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Command bar (fixed bottom) */}
                            <div style={{ padding: '6px 10px', background: '#0a0a14', borderTop: '1px solid #1e293b', flexShrink: 0 }}>
                                {commandOutput && (
                                    <pre ref={outputRef} style={{
                                        fontSize: 9, color: '#22c55e', fontFamily: 'monospace',
                                        background: '#050510', padding: 8, borderRadius: 6, marginBottom: 6,
                                        maxHeight: 100, overflow: 'auto', whiteSpace: 'pre-wrap', margin: '0 0 6px',
                                        border: '1px solid #1e293b',
                                    }}>{commandOutput}</pre>
                                )}
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <span style={{ fontSize: 11, color: '#f59e0b', alignSelf: 'center' }}>⚡</span>
                                    <input
                                        type="text"
                                        value={commandInput}
                                        onChange={e => setCommandInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && commandInput) {
                                                executeCommand(commandInput, selectedDevice.ip);
                                                setCommandInput('');
                                            }
                                        }}
                                        placeholder={`William → ${selectedDevice.ip}: enter command...`}
                                        style={{
                                            flex: 1, padding: '7px 10px', borderRadius: 6,
                                            background: '#0f0f1a', border: '1px solid #1e293b',
                                            color: '#22c55e', fontSize: 11, outline: 'none', fontFamily: 'monospace',
                                        }}
                                    />
                                    <button onClick={() => { executeCommand(commandInput, selectedDevice.ip); setCommandInput(''); }}
                                        disabled={isExecuting || !commandInput} style={{
                                            padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                                            background: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30',
                                            fontSize: 10, fontWeight: 800,
                                        }}>RUN</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 56, opacity: 0.15, marginBottom: 8 }}>🛡️</div>
                                <h2 style={{ fontSize: 14, color: '#334155', fontWeight: 700, margin: '0 0 4px' }}>Agent William — WLAN Controller</h2>
                                <p style={{ fontSize: 10, color: '#1e293b', margin: 0 }}>Select a device or scan the network to begin deep analysis</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                button:hover:not(:disabled) { filter: brightness(1.2); transform: translateY(-0.5px); }
                button:active:not(:disabled) { transform: translateY(0); }
                button:disabled { opacity: 0.4; cursor: not-allowed !important; }
                button { transition: all 0.15s; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
            `}</style>
        </div>
    );
}
