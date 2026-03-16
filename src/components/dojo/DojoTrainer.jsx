import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

// ─── MEDIAPIPE LANDMARK INDICES ───
const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
    LEFT_HEEL: 29, RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};

// ─── ANGLE CALCULATION (port from TKWD pose_utils.py) ───
function calcAngle(a, b, c) {
    const ba = [a.x - b.x, a.y - b.y];
    const bc = [c.x - b.x, c.y - b.y];
    const dot = ba[0] * bc[0] + ba[1] * bc[1];
    const magBA = Math.sqrt(ba[0] ** 2 + ba[1] ** 2);
    const magBC = Math.sqrt(bc[0] ** 2 + bc[1] ** 2);
    if (magBA === 0 || magBC === 0) return 0;
    const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
    return (Math.acos(cosAngle) * 180) / Math.PI;
}

// ─── KICK DATABASE (from TKWD/src/techniques/kicks/) ───
const KICKS = [
    {
        id: 'ap_chagi',
        korean: '앞차기',
        english: 'Front Kick',
        description: 'Direct snapping kick driven forward from the hip. Knee chambers high, lower leg extends to strike with ball of foot.',
        stanceCondition: (angles) =>
            angles.rightKnee > 150 && angles.leftKnee > 150 &&
            angles.hipRotation < 0.15 && angles.torsoLean < 15,
        color: '#22c55e',
        phases: ['Ready', 'Chamber', 'Extension', 'Recoil', 'Return'],
    },
    {
        id: 'dollyeo_chagi',
        korean: '돌려차기',
        english: 'Roundhouse Kick',
        description: 'Circular kick with hip rotation. Pivot on supporting foot, rotate hips through, strike with instep.',
        stanceCondition: (angles) =>
            angles.hipRotation > 0.1 && angles.rightKnee > 140 &&
            angles.torsoLean < 20,
        color: '#ef4444',
        phases: ['Ready', 'Pivot', 'Chamber', 'Impact', 'Return'],
    },
    {
        id: 'yeop_chagi',
        korean: '옆차기',
        english: 'Side Kick',
        description: 'Linear kick to the side. Chamber knee, extend leg sideways, strike with blade of foot.',
        stanceCondition: (angles) =>
            angles.hipRotation > 0.08 && angles.rightKnee > 145 &&
            angles.shoulderAlign < 0.12,
        color: '#3b82f6',
        phases: ['Ready', 'Chamber', 'Extension', 'Hold', 'Return'],
    },
];

// ─── JOINT ANGLE COMPUTATION ───
function computeAllAngles(lm) {
    if (!lm || lm.length < 33) return null;

    const rightKnee = calcAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
    const leftKnee = calcAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    const rightHip = calcAngle(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE]);
    const leftHip = calcAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE]);
    const rightElbow = calcAngle(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_ELBOW], lm[LM.RIGHT_WRIST]);
    const leftElbow = calcAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]);

    // Hip rotation (from taekwondo-analyzer/pose_utils.py)
    const hipRotation = Math.abs(lm[LM.LEFT_HIP].x - lm[LM.RIGHT_HIP].x);

    // Torso lean (shoulder-hip vertical alignment)
    const midShoulder = {
        x: (lm[LM.LEFT_SHOULDER].x + lm[LM.RIGHT_SHOULDER].x) / 2,
        y: (lm[LM.LEFT_SHOULDER].y + lm[LM.RIGHT_SHOULDER].y) / 2,
    };
    const midHip = {
        x: (lm[LM.LEFT_HIP].x + lm[LM.RIGHT_HIP].x) / 2,
        y: (lm[LM.LEFT_HIP].y + lm[LM.RIGHT_HIP].y) / 2,
    };
    const torsoLean = Math.abs(Math.atan2(midShoulder.x - midHip.x, midHip.y - midShoulder.y) * (180 / Math.PI));

    // Shoulder alignment
    const shoulderAlign = Math.abs(lm[LM.LEFT_SHOULDER].x - lm[LM.RIGHT_SHOULDER].x);

    // Guard position (wrist-to-nose distance)
    const rightGuard = Math.sqrt((lm[LM.RIGHT_WRIST].x - lm[LM.NOSE].x) ** 2 + (lm[LM.RIGHT_WRIST].y - lm[LM.NOSE].y) ** 2);
    const leftGuard = Math.sqrt((lm[LM.LEFT_WRIST].x - lm[LM.NOSE].x) ** 2 + (lm[LM.LEFT_WRIST].y - lm[LM.NOSE].y) ** 2);

    // Kick height (ankle relative to hip)
    const rightKickHeight = lm[LM.RIGHT_HIP].y - lm[LM.RIGHT_ANKLE].y;
    const leftKickHeight = lm[LM.LEFT_HIP].y - lm[LM.LEFT_ANKLE].y;

    // Chest height threshold
    const chestHeight = (lm[LM.LEFT_SHOULDER].y + lm[LM.RIGHT_SHOULDER].y) / 2;

    return {
        rightKnee, leftKnee,
        rightHip, leftHip,
        rightElbow, leftElbow,
        hipRotation, torsoLean, shoulderAlign,
        rightGuard, leftGuard,
        rightKickHeight, leftKickHeight,
        chestHeight,
    };
}

// ─── SKELETON DRAWING ───
const SKELETON_CONNECTIONS = [
    [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
    [LM.LEFT_SHOULDER, LM.LEFT_ELBOW], [LM.LEFT_ELBOW, LM.LEFT_WRIST],
    [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW], [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
    [LM.LEFT_SHOULDER, LM.LEFT_HIP], [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
    [LM.LEFT_HIP, LM.RIGHT_HIP],
    [LM.LEFT_HIP, LM.LEFT_KNEE], [LM.LEFT_KNEE, LM.LEFT_ANKLE],
    [LM.RIGHT_HIP, LM.RIGHT_KNEE], [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
    [LM.LEFT_ANKLE, LM.LEFT_HEEL], [LM.LEFT_ANKLE, LM.LEFT_FOOT_INDEX],
    [LM.RIGHT_ANKLE, LM.RIGHT_HEEL], [LM.RIGHT_ANKLE, LM.RIGHT_FOOT_INDEX],
];

function drawSkeleton(ctx, lm, w, h, angles) {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    SKELETON_CONNECTIONS.forEach(([a, b]) => {
        const pa = lm[a], pb = lm[b];
        if (pa.visibility < 0.5 || pb.visibility < 0.5) return;
        ctx.beginPath();
        ctx.moveTo(pa.x * w, pa.y * h);
        ctx.lineTo(pb.x * w, pb.y * h);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    // Draw keypoints
    const importantJoints = [
        LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
        LM.LEFT_ELBOW, LM.RIGHT_ELBOW,
        LM.LEFT_WRIST, LM.RIGHT_WRIST,
        LM.LEFT_HIP, LM.RIGHT_HIP,
        LM.LEFT_KNEE, LM.RIGHT_KNEE,
        LM.LEFT_ANKLE, LM.RIGHT_ANKLE,
        LM.NOSE,
    ];

    importantJoints.forEach(idx => {
        const p = lm[idx];
        if (p.visibility < 0.5) return;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#0a0a1a';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw angle labels on key joints
    if (angles) {
        const angleLabels = [
            { idx: LM.RIGHT_KNEE, label: `${Math.round(angles.rightKnee)}°`, color: '#ef4444' },
            { idx: LM.LEFT_KNEE, label: `${Math.round(angles.leftKnee)}°`, color: '#3b82f6' },
            { idx: LM.RIGHT_HIP, label: `${Math.round(angles.rightHip)}°`, color: '#f97316' },
            { idx: LM.LEFT_HIP, label: `${Math.round(angles.leftHip)}°`, color: '#fbbf24' },
            { idx: LM.RIGHT_ELBOW, label: `${Math.round(angles.rightElbow)}°`, color: '#ec4899' },
            { idx: LM.LEFT_ELBOW, label: `${Math.round(angles.leftElbow)}°`, color: '#a855f7' },
        ];

        angleLabels.forEach(({ idx, label, color }) => {
            const p = lm[idx];
            if (p.visibility < 0.5) return;
            ctx.font = 'bold 13px monospace';
            ctx.fillStyle = color;
            ctx.strokeStyle = '#0a0a0f';
            ctx.lineWidth = 3;
            ctx.strokeText(label, p.x * w + 10, p.y * h - 10);
            ctx.fillText(label, p.x * w + 10, p.y * h - 10);
        });
    }
}

// ─── MAIN COMPONENT ───
export default function DojoTrainer() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [poseLandmarker, setPoseLandmarker] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [angles, setAngles] = useState(null);
    const [recommendedKick, setRecommendedKick] = useState(null);
    const [bodyVisible, setBodyVisible] = useState(false);
    const [fps, setFps] = useState(0);
    const [selectedKick, setSelectedKick] = useState(null);
    const lastFrameTime = useRef(0);
    const animRef = useRef(null);

    // ── Initialize MediaPipe Pose Landmarker ──
    useEffect(() => {
        let cancelled = false;
        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );
                const landmarker = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                    minPoseDetectionConfidence: 0.5,
                    minPosePresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });
                if (!cancelled) {
                    setPoseLandmarker(landmarker);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('[DOJO] MediaPipe init error:', err);
                setIsLoading(false);
            }
        }
        init();
        return () => { cancelled = true; };
    }, []);

    // ── Start Camera ──
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraActive(true);
            }
        } catch (err) {
            console.error('[DOJO] Camera access error:', err);
        }
    }, []);

    // ── Pose Detection Loop ──
    useEffect(() => {
        if (!poseLandmarker || !cameraActive || !videoRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let lastTime = performance.now();
        let frameCount = 0;

        const detect = () => {
            if (!video.videoWidth) {
                animRef.current = requestAnimationFrame(detect);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            }

            try {
                const result = poseLandmarker.detectForVideo(video, now);
                if (result.landmarks && result.landmarks.length > 0) {
                    const lm = result.landmarks[0];
                    setBodyVisible(true);

                    // Compute all angles
                    const a = computeAllAngles(lm);
                    setAngles(a);

                    // Draw skeleton overlay
                    drawSkeleton(ctx, lm, canvas.width, canvas.height, a);

                    // Recommend kick based on stance
                    if (a) {
                        const matched = KICKS.find(k => {
                            try { return k.stanceCondition(a); } catch { return false; }
                        });
                        setRecommendedKick(matched || null);
                    }
                } else {
                    setBodyVisible(false);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            } catch (err) { /* skip frame errors */ }

            animRef.current = requestAnimationFrame(detect);
        };

        detect();
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [poseLandmarker, cameraActive]);

    // ── Feedback Messages ──
    const getFeedback = () => {
        if (!angles) return [];
        const feedback = [];

        if (angles.rightGuard > 0.3 && angles.leftGuard > 0.3)
            feedback.push({ msg: 'Guard is LOW — bring fists to chin level', severity: 'critical' });
        if (angles.torsoLean > 20)
            feedback.push({ msg: 'Leaning too much — keep torso upright', severity: 'warning' });
        if (angles.rightKnee < 140 && angles.leftKnee < 140)
            feedback.push({ msg: 'Both knees bent — distribute weight evenly', severity: 'info' });
        if (angles.hipRotation < 0.05)
            feedback.push({ msg: 'Hips square — good for front kick (Ap Chagi)', severity: 'info' });
        if (angles.hipRotation > 0.12)
            feedback.push({ msg: 'Hips rotated — good for roundhouse (Dollyeo Chagi)', severity: 'info' });

        return feedback;
    };

    return (
        <div style={{
            width: '100vw', height: '100vh', background: '#0a0a0f',
            display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif",
            color: '#e2e8f0', overflow: 'hidden',
        }}>
            {/* HEADER */}
            <div style={{
                padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid #1e293b', zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🥋</span>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>
                        DOJO <span style={{ color: '#8b5cf6', fontWeight: 400 }}>Precision Trainer</span>
                    </h1>
                    <span style={{
                        fontSize: 9, padding: '2px 8px', borderRadius: 6,
                        background: bodyVisible ? '#22c55e20' : '#ef444420',
                        color: bodyVisible ? '#22c55e' : '#ef4444',
                        fontWeight: 700, border: `1px solid ${bodyVisible ? '#22c55e40' : '#ef444440'}`,
                    }}>
                        {bodyVisible ? '● BODY LOCKED' : '○ NO BODY'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>
                        {fps} FPS · Metal GPU · M4
                    </span>
                    <a href="#/" style={{
                        fontSize: 10, color: '#64748b', textDecoration: 'none',
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #1e293b',
                    }}>← EXIT</a>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* VIDEO FEED */}
                <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                    {isLoading && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', zIndex: 20,
                            background: '#0a0a0f',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                border: '3px solid #8b5cf620', borderTopColor: '#8b5cf6',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            <p style={{ marginTop: 16, fontSize: 13, color: '#64748b' }}>
                                Loading MediaPipe Pose Landmarker (Heavy)...
                            </p>
                            <p style={{ fontSize: 10, color: '#334155' }}>GPU Delegate · 33 Landmarks · WebGPU</p>
                        </div>
                    )}

                    {!isLoading && !cameraActive && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', zIndex: 20,
                        }}>
                            <button onClick={startCamera} style={{
                                padding: '16px 40px', fontSize: 16, fontWeight: 800,
                                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                color: 'white', border: 'none', borderRadius: 12,
                                cursor: 'pointer', letterSpacing: '0.05em',
                                boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
                            }}>
                                ACTIVATE CAMERA
                            </button>
                            <p style={{ marginTop: 12, fontSize: 11, color: '#64748b' }}>
                                Stand 2-3m from camera · Full body visible · Good lighting
                            </p>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: 'scaleX(-1)', // Mirror mode
                        }}
                        playsInline muted
                    />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute', top: 0, left: 0,
                            width: '100%', height: '100%',
                            transform: 'scaleX(-1)', // Mirror to match video
                            pointerEvents: 'none',
                        }}
                    />

                    {/* CHEST HEIGHT LINE */}
                    {angles && bodyVisible && (
                        <div style={{
                            position: 'absolute', left: 0, right: 0,
                            top: `${angles.chestHeight * 100}%`,
                            borderTop: '2px dashed #22c55e60',
                            zIndex: 5,
                        }}>
                            <span style={{
                                position: 'absolute', right: 10, top: -18,
                                fontSize: 9, color: '#22c55e', fontFamily: 'monospace',
                                background: '#0a0a0f80', padding: '1px 6px', borderRadius: 4,
                            }}>CHEST HEIGHT THRESHOLD</span>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <div style={{
                    width: 340, background: 'rgba(10,10,20,0.98)',
                    borderLeft: '1px solid #1e293b', overflowY: 'auto',
                    display: 'flex', flexDirection: 'column',
                }}>
                    {/* ANGLES PANEL */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Joint Angle Map
                        </div>
                        {angles ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                {[
                                    { label: 'R.Knee', val: angles.rightKnee, color: '#ef4444' },
                                    { label: 'L.Knee', val: angles.leftKnee, color: '#3b82f6' },
                                    { label: 'R.Hip', val: angles.rightHip, color: '#f97316' },
                                    { label: 'L.Hip', val: angles.leftHip, color: '#fbbf24' },
                                    { label: 'R.Elbow', val: angles.rightElbow, color: '#ec4899' },
                                    { label: 'L.Elbow', val: angles.leftElbow, color: '#a855f7' },
                                    { label: 'Hip Rot', val: angles.hipRotation * 100, color: '#10b981', unit: '%' },
                                    { label: 'Torso', val: angles.torsoLean, color: '#06b6d4' },
                                ].map(({ label, val, color, unit }) => (
                                    <div key={label} style={{
                                        padding: '6px 8px', background: '#0f0f1a', borderRadius: 6,
                                        border: `1px solid ${color}30`,
                                    }}>
                                        <div style={{ fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'monospace' }}>
                                            {Math.round(val)}{unit || '°'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: '#334155', fontStyle: 'italic' }}>
                                Waiting for body detection...
                            </div>
                        )}
                    </div>

                    {/* RECOMMENDED KICK */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Recommended Technique
                        </div>
                        {recommendedKick ? (
                            <div
                                style={{
                                    padding: '14px', borderRadius: 10,
                                    background: `${recommendedKick.color}10`,
                                    border: `2px solid ${recommendedKick.color}60`,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedKick(recommendedKick)}
                            >
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 20, fontWeight: 900, color: recommendedKick.color }}>
                                        {recommendedKick.korean}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                        {recommendedKick.english}
                                    </span>
                                </div>
                                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                                    {recommendedKick.description}
                                </p>
                                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                                    {recommendedKick.phases.map((phase, i) => (
                                        <span key={i} style={{
                                            fontSize: 8, padding: '2px 6px', borderRadius: 4,
                                            background: `${recommendedKick.color}15`,
                                            color: recommendedKick.color, fontWeight: 600,
                                        }}>
                                            {i + 1}. {phase}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '14px', borderRadius: 10,
                                background: '#1e293b15', border: '1px dashed #1e293b',
                                textAlign: 'center',
                            }}>
                                <span style={{ fontSize: 24 }}>🎯</span>
                                <p style={{ fontSize: 10, color: '#475569', margin: '6px 0 0' }}>
                                    Get into a fighting stance to see recommendations
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ALL KICKS LIBRARY */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Kick Library
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {KICKS.map(kick => (
                                <button
                                    key={kick.id}
                                    onClick={() => setSelectedKick(selectedKick?.id === kick.id ? null : kick)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                                        background: selectedKick?.id === kick.id ? `${kick.color}15` : '#0f0f1a',
                                        border: `1px solid ${selectedKick?.id === kick.id ? kick.color : '#1e293b'}`,
                                        color: '#e2e8f0', textAlign: 'left',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: kick.color, flexShrink: 0,
                                    }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700 }}>{kick.korean}</div>
                                        <div style={{ fontSize: 9, color: '#64748b' }}>{kick.english}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LIVE FEEDBACK */}
                    <div style={{ padding: '16px', flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Live Feedback
                        </div>
                        {getFeedback().length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {getFeedback().map((f, i) => (
                                    <div key={i} style={{
                                        padding: '8px 10px', borderRadius: 6, fontSize: 10,
                                        background: f.severity === 'critical' ? '#ef444415' :
                                            f.severity === 'warning' ? '#f9731615' : '#3b82f615',
                                        color: f.severity === 'critical' ? '#fca5a5' :
                                            f.severity === 'warning' ? '#fdba74' : '#93c5fd',
                                        borderLeft: `3px solid ${f.severity === 'critical' ? '#ef4444' :
                                                f.severity === 'warning' ? '#f97316' : '#3b82f6'
                                            }`,
                                    }}>
                                        {f.msg}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 10, color: '#334155', fontStyle: 'italic' }}>
                                {bodyVisible ? 'Stance looks good 👊' : 'Waiting for pose data...'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SELECTED KICK DETAIL OVERLAY */}
            {selectedKick && (
                <div style={{
                    position: 'absolute', bottom: 20, left: 20, right: 360,
                    background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(16px)',
                    borderRadius: 14, border: `1px solid ${selectedKick.color}40`,
                    padding: '16px 20px', zIndex: 30,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${selectedKick.color}15`,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: selectedKick.color }}>
                                {selectedKick.korean} — {selectedKick.english}
                            </h3>
                            <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0', maxWidth: 500 }}>
                                {selectedKick.description}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedKick(null)}
                            style={{
                                background: 'none', border: '1px solid #1e293b', borderRadius: 6,
                                color: '#64748b', padding: '4px 10px', cursor: 'pointer', fontSize: 10,
                            }}
                        >
                            CLOSE
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                        {selectedKick.phases.map((phase, i) => (
                            <div key={i} style={{
                                flex: 1, padding: '10px', borderRadius: 8,
                                background: `${selectedKick.color}10`,
                                border: `1px solid ${selectedKick.color}30`,
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 18, fontWeight: 900, color: selectedKick.color }}>{i + 1}</div>
                                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>{phase}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
            `}</style>
        </div>
    );
}
