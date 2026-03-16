// ═══════════════════════════════════════════════════════════════
// AMLAZR / Prime.AI — FULL WIRING MAP
// Frontend ↔ API ↔ Backend Infrastructure
// Generated: 2026-03-06 — Exhaustive scan of codebase
// ═══════════════════════════════════════════════════════════════

export const SITE_DOMAIN = "https://www.amlazr.com";

// ─────────────────────────────────────────────────────────────
// BACKEND INFRASTRUCTURE NODES
// ─────────────────────────────────────────────────────────────
export const backends = [
    { id: "be-supabase", label: "Supabase DB", type: "database", color: "#3ecf8e", desc: "PostgreSQL — Auth, Analytics, Leads, Agents, Sessions" },
    { id: "be-vps", label: "VPS 31.97.52.22", type: "server", color: "#ef4444", desc: "Hostinger — Ollama, ByteBot, n8n, Kokoro, Agent Zero" },
    { id: "be-vastai", label: "Vast.ai GPU", type: "gpu", color: "#f97316", desc: "RTX 3090/H200 — Live Avatar, 3D Gen, Video Gen" },
    { id: "be-openrouter", label: "OpenRouter", type: "ai", color: "#8b5cf6", desc: "DeepSeek, Claude, GPT-4o — AI inference proxy" },
    { id: "be-openai", label: "OpenAI", type: "ai", color: "#10b981", desc: "GPT-4o, Whisper, TTS — direct API" },
    { id: "be-stripe", label: "Stripe", type: "payment", color: "#635bff", desc: "Payments, Subscriptions, Webhooks" },
    { id: "be-google", label: "Google Cloud", type: "ai", color: "#4285f4", desc: "Gemini, GCS, Calendar, Drive, OAuth" },
    { id: "be-slack", label: "Slack", type: "integration", color: "#e01e5a", desc: "Notifications, Agent updates, Webhooks" },
    { id: "be-render", label: "Render", type: "hosting", color: "#46e3b7", desc: "n8n instances, Google Drive MCP" },
    { id: "be-fly", label: "Fly.io", type: "hosting", color: "#8b5cf6", desc: "Prime Orchestrator" },
    { id: "be-cognee", label: "Cognee KG", type: "database", color: "#06b6d4", desc: "Knowledge Graph — memory, sync" },
    { id: "be-anam", label: "Anam AI", type: "ai", color: "#ec4899", desc: "Avatar persona sessions" },
    { id: "be-vercel", label: "Vercel Edge", type: "hosting", color: "#000000", desc: "Next.js SSR, Middleware, Edge Functions" },
    { id: "be-calendly", label: "Calendly", type: "integration", color: "#006bff", desc: "Booking webhooks" },

    // SOVEREIGN LOCAL COMPUTE FLEET (M4/METAL)
    { id: "be-m4-qwen-coder", label: "Qwen 2.5 Coder (MLX)", type: "compute", color: "#a855f7", desc: "M4 Native coding engine — 4bit quantized" },
    { id: "be-m4-ltx-video", label: "LTX-2.3 Video (GGUF)", type: "compute", color: "#f43f5e", desc: "Metal accelerated T2V — Q4_K_M" },
    { id: "be-m4-saga-agent", label: "SAGA Agent Cluster", type: "compute", color: "#fbbf24", desc: "Sovereign Autonomous Generation — 5 specialist agents" },
    { id: "be-m4-comfyui", label: "Local ComfyUI", type: "compute", color: "#ec4899", desc: "Local Stable Diffusion — Metal Graph accelerated" },
    { id: "be-m4-qwen-tts", label: "Qwen3 TTS (12Hz)", type: "compute", color: "#10b981", desc: "Ultra-low latency voice synth" },
    { id: "be-m4-flux-diffusion", label: "Flux Diffusion", type: "compute", color: "#3b82f6", desc: "High-fidelity local image generation" },
    { id: "be-m4-mistral-embed", label: "Mistral Embed", type: "compute", color: "#8b5cf6", desc: "Local RAG semantic processing" },
];

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────
export const CATEGORIES_META = {
    core: { label: "Core", color: "#3b82f6" },
    dashboard: { label: "Dashboard", color: "#8b5cf6" },
    auth: { label: "Auth", color: "#ef4444" },
    marketing: { label: "Marketing", color: "#22c55e" },
    creative: { label: "Creative", color: "#ec4899" },
    agents: { label: "Agents", color: "#f97316" },
    ops: { label: "Ops & Fleet", color: "#14b8a6" },
    vision: { label: "Vision & Voice", color: "#a855f7" },
    workflows: { label: "Workflows", color: "#06b6d4" },
    growth: { label: "Growth", color: "#eab308" },
    games: { label: "Games", color: "#f43f5e" },
    enterprise: { label: "Enterprise", color: "#64748b" },
    solutions: { label: "Solutions", color: "#0ea5e9" },
    infra: { label: "Infrastructure", color: "#d946ef" },
    api: { label: "API Routes", color: "#94a3b8" },
    backend: { label: "Backend Infra", color: "#ef4444" },
};

// ─────────────────────────────────────────────────────────────
// FRONTEND PAGES — with API wiring
// ─────────────────────────────────────────────────────────────
export const pages = [
    // CORE
    { id: "/", path: "/", label: "Home", cat: "core", auth: "public", apis: ["/api/anam/session", "/api/prime-agent-chat", "/api/analytics/ingest", "/api/trial/status"] },
    { id: "/amlazr", path: "/amlazr", label: "AMLAZR Dashboard", cat: "core", auth: "e2f", apis: ["/api/amlazr/telemetry", "/api/analytics/realtime"] },
    { id: "/analytics", path: "/analytics", label: "Analytics", cat: "core", auth: "paid", apis: ["/api/analytics/realtime"] },
    { id: "/pricing", path: "/pricing", label: "Pricing", cat: "core", auth: "public", apis: ["/api/stripe/time-access", "/api/stripe/verify-session", "/api/subscription"] },
    { id: "/pricing/success", path: "/pricing/success", label: "Pricing ✓", cat: "core", auth: "public", apis: ["/api/stripe/verify-session"] },
    { id: "/pricing/cancel", path: "/pricing/cancel", label: "Pricing ✗", cat: "core", auth: "public", apis: [] },
    { id: "/galaxy", path: "/galaxy", label: "Galaxy", cat: "core", auth: "public", apis: ["/api/system/universe"] },
    { id: "/launchpad", path: "/launchpad", label: "Launchpad", cat: "core", auth: "public", apis: [] },
    { id: "/prime/dashboard", path: "/prime/dashboard", label: "Prime Dashboard", cat: "core", auth: "other", apis: ["/api/system-state"] },

    // AUTH
    { id: "/login", path: "/login", label: "Login", cat: "auth", auth: "public", apis: ["/api/auth/login", "/api/auth/pairing"] },
    { id: "/auth/signup", path: "/auth/signup", label: "Signup", cat: "auth", auth: "public", apis: ["/api/auth/register"] },
    { id: "/auth/forgot-password", path: "/auth/forgot-password", label: "Forgot Password", cat: "auth", auth: "public", apis: ["/api/auth/forgot-password"] },
    { id: "/auth/reset-password", path: "/auth/reset-password", label: "Reset Password", cat: "auth", auth: "public", apis: ["/api/auth/reset-password"] },

    // DASHBOARD
    { id: "/dashboard", path: "/dashboard", label: "Dashboard Hub", cat: "dashboard", auth: "paid", apis: ["/api/dashboard/metrics", "/api/dashboard/activity", "/api/dashboard/performance", "/api/cost-intelligence", "/api/system/ledger", "/api/system/tactical"] },
    { id: "/dashboard/agents", path: "/dashboard/agents", label: "My Agents", cat: "dashboard", auth: "paid", apis: ["/api/v1/agents", "/api/agents/status", "/api/agents/orbs"] },
    { id: "/dashboard/profile", path: "/dashboard/profile", label: "Profile", cat: "dashboard", auth: "paid", apis: ["/api/user/preferences", "/api/auth/2fa/verify"] },
    { id: "/dashboard/computer-use", path: "/dashboard/computer-use", label: "Computer Use", cat: "dashboard", auth: "paid", apis: ["/api/computer-use/session", "/api/computer-use/execute", "/api/computer-use/speak"] },
    { id: "/dashboard/cost-intelligence", path: "/dashboard/cost-intelligence", label: "Cost Intel", cat: "dashboard", auth: "paid", apis: ["/api/cost-intelligence", "/api/mcp/cost-tracking"] },
    { id: "/dashboard/deep-search", path: "/dashboard/deep-search", label: "Deep Search", cat: "dashboard", auth: "paid", apis: ["/api/deepsearch", "/api/search"] },
    { id: "/dashboard/leads", path: "/dashboard/leads", label: "Leads", cat: "dashboard", auth: "paid", apis: ["/api/leads", "/api/leads/list"] },
    { id: "/dashboard/prompts", path: "/dashboard/prompts", label: "Prompts", cat: "dashboard", auth: "paid", apis: [] },
    { id: "/dashboard/tablet-bot", path: "/dashboard/tablet-bot", label: "Tablet Bot", cat: "dashboard", auth: "paid", apis: ["/api/tablet-bot"] },
    { id: "/dashboard/training", path: "/dashboard/training", label: "Training", cat: "dashboard", auth: "paid", apis: [] },
    { id: "/chat", path: "/chat", label: "Chat", cat: "dashboard", auth: "paid", apis: ["/api/super-agent", "/api/chat/intelligent"] },
    { id: "/search", path: "/search", label: "Search", cat: "dashboard", auth: "public", apis: ["/api/search", "/api/orb-dispatch"] },
    { id: "/staging", path: "/staging", label: "Sovereign Orb", cat: "core", auth: "public", apis: ["/api/orb-dispatch", "/api/system/status", "/api/live-avatar/wake"] },
    { id: "/dojo", path: "/dojo", label: "Dojo Precision Trainer", cat: "core", auth: "public", apis: ["/api/orb-dispatch", "/api/system/status"] },
    { id: "/imac-control", path: "/imac-control", label: "iMac Sovereign Agent", cat: "core", auth: "e2f", apis: ["/api/imac-agent", "/api/system/status"] },
    { id: "/william", path: "/william", label: "Agent William · WLAN Controller", cat: "ops", auth: "e2f", apis: ["/api/william"] },
    { id: "/demo", path: "/demo", label: "Demo", cat: "dashboard", auth: "public", apis: [] },

    // AGENTS
    { id: "/build-agent", path: "/build-agent", label: "Build Agent", cat: "agents", auth: "paid", apis: ["/api/agents/build", "/api/agents/spawn"] },
    { id: "/my-agents", path: "/my-agents", label: "My Agents", cat: "agents", auth: "paid", apis: ["/api/v1/agents", "/api/agents/status"] },
    { id: "/agent-control", path: "/agent-control", label: "Agent Control", cat: "agents", auth: "paid", apis: ["/api/agents/control"] },
    { id: "/agent-memory", path: "/agent-memory", label: "Agent Memory", cat: "agents", auth: "paid", apis: ["/api/agent-memory", "/api/rag/orchestrate"] },
    { id: "/agent-mode", path: "/agent-mode", label: "Agent Mode", cat: "agents", auth: "paid", apis: ["/api/agent/status"] },
    { id: "/agent-settings", path: "/agent-settings", label: "Agent Settings", cat: "agents", auth: "paid", apis: ["/api/agent/validate"] },
    { id: "/marketplace", path: "/marketplace", label: "Marketplace", cat: "agents", auth: "public", apis: ["/api/agents", "/api/stripe"] },
    { id: "/arena", path: "/arena", label: "Arena", cat: "agents", auth: "public", apis: ["/api/arena/frameworks", "/api/arena/mode"] },
    { id: "/arena/pricing", path: "/arena/pricing", label: "Arena Pricing", cat: "agents", auth: "public", apis: ["/api/arena/checkout"] },
    { id: "/self-builder", path: "/self-builder", label: "Self Builder", cat: "agents", auth: "public", apis: ["/api/self-builder", "/api/self-builder/checkout"] },
    { id: "/autonomous", path: "/autonomous", label: "Autonomous", cat: "agents", auth: "other", apis: ["/api/autonomous/run", "/api/autonomous/status"] },
    { id: "/swarm", path: "/swarm", label: "Swarm", cat: "agents", auth: "paid", apis: ["/api/swarm/status", "/api/swarm/launch", "/api/swarm/memory", "/api/swarm/events"] },

    // OPS & FLEET
    { id: "/ops/command-center", path: "/ops/command-center", label: "Command Center", cat: "ops", auth: "other", apis: ["/api/command-center", "/api/command-center/avatars", "/api/command-center/workflow"] },
    { id: "/ops/fleet", path: "/ops/fleet", label: "Fleet", cat: "ops", auth: "other", apis: ["/api/fleet", "/api/orb-dispatch", "/api/v1/agents"] },
    { id: "/ops/gpu-monitor", path: "/ops/gpu-monitor", label: "GPU Monitor", cat: "ops", auth: "other", apis: ["/api/vast-monitor"] },
    { id: "/ops/health", path: "/ops/health", label: "Health", cat: "ops", auth: "other", apis: ["/api/ops/health"] },
    { id: "/ops/mission-control", path: "/ops/mission-control", label: "Mission Control", cat: "ops", auth: "other", apis: [] },
    { id: "/github-fleet", path: "/github-fleet", label: "GitHub Fleet", cat: "ops", auth: "paid", apis: ["/api/v1/agents", "/api/github/fleet", "/api/github/reports"] },
    { id: "/codebase-intelligence", path: "/codebase-intelligence", label: "Codebase Intel", cat: "ops", auth: "paid", apis: ["/api/codebase/analyze", "/api/codebase/ingest"] },
    { id: "/cyber-defense", path: "/cyber-defense", label: "Cyber Defense", cat: "ops", auth: "paid", apis: ["/api/security", "/api/security-audit"] },
    { id: "/sic", path: "/sic", label: "SIC", cat: "ops", auth: "paid", apis: ["/api/sic/dashboard", "/api/sic/balance"] },
    { id: "/orchestration", path: "/orchestration", label: "Orchestration", cat: "ops", auth: "paid", apis: ["/api/orchestrate", "/api/orchestrate/status"] },
    { id: "/unified-dashboard", path: "/unified-dashboard", label: "Unified Dashboard", cat: "ops", auth: "paid", apis: ["/api/qa-fleet"] },
    { id: "/qa-dashboard", path: "/qa-dashboard", label: "QA Dashboard", cat: "ops", auth: "paid", apis: ["/api/qa-bounties", "/api/qa/status"] },
    { id: "/debug", path: "/debug", label: "Debug", cat: "ops", auth: "paid", apis: ["/api/debug/fast-fix"] },
    { id: "/live-build", path: "/live-build", label: "Live Build", cat: "ops", auth: "paid", apis: ["/api/build/live", "/api/build/stream", "/api/deploy"] },

    // CREATIVE
    { id: "/creative", path: "/creative", label: "Creative Studio", cat: "creative", auth: "public", apis: ["/api/creative/gemini", "/api/creative/story-generation", "/api/creative/3d-extraction", "/api/creative/image-generation", "/api/creative/video-generation", "/api/creative/music-generation", "/api/creative/sound-fx", "/api/creative/voice"] },
    { id: "/ai-studio", path: "/ai-studio", label: "AI Studio", cat: "creative", auth: "other", apis: ["/api/ai-studio"] },
    { id: "/live-code", path: "/live-code", label: "Live Code", cat: "creative", auth: "other", apis: ["/api/selfcoding/stream"] },
    { id: "/live-avatar", path: "/live-avatar", label: "Live Avatar", cat: "creative", auth: "public", apis: ["/api/liveavatar", "/api/live-avatar/wake", "/api/live-avatar/webrtc"] },
    { id: "/radio", path: "/radio", label: "Radio", cat: "creative", auth: "other", apis: ["/api/radio"] },
    { id: "/print", path: "/print", label: "Print", cat: "creative", auth: "other", apis: ["/api/printer/print"] },

    // VISION & VOICE
    { id: "/vision", path: "/vision", label: "Vision", cat: "vision", auth: "public", apis: ["/api/browser/session", "/api/ocr/extract"] },
    { id: "/vision/browser", path: "/vision/browser", label: "Browser Vision", cat: "vision", auth: "other", apis: ["/api/browser", "/api/browser/session"] },
    { id: "/vision/humanoid", path: "/vision/humanoid", label: "Humanoid", cat: "vision", auth: "other", apis: ["/api/agent/humanoid"] },
    { id: "/vision/ocr", path: "/vision/ocr", label: "OCR", cat: "vision", auth: "other", apis: ["/api/ocr/extract"] },
    { id: "/voice", path: "/voice", label: "Voice", cat: "vision", auth: "other", apis: ["/api/voice", "/api/speech-agent"] },
    { id: "/voice/podcast", path: "/voice/podcast", label: "Podcast", cat: "vision", auth: "other", apis: ["/api/liveavatar"] },
    { id: "/voice/speech", path: "/voice/speech", label: "Speech", cat: "vision", auth: "other", apis: ["/api/speech-agent"] },

    // WORKFLOWS
    { id: "/workflows", path: "/workflows", label: "Workflows", cat: "workflows", auth: "paid", apis: ["/api/workflows", "/api/n8n/workflows", "/api/workflows/composer", "/api/cognee"] },
    { id: "/workflows/builder", path: "/workflows/builder", label: "WF Builder", cat: "workflows", auth: "paid", apis: ["/api/agent/workflows/builder"] },
    { id: "/workflows/composer", path: "/workflows/composer", label: "WF Composer", cat: "workflows", auth: "paid", apis: ["/api/workflows/composer"] },
    { id: "/workflows/n8n", path: "/workflows/n8n", label: "n8n", cat: "workflows", auth: "paid", apis: ["/api/n8n/workflows", "/api/n8n/status"] },

    // GROWTH
    { id: "/growth/leads", path: "/growth/leads", label: "Leads", cat: "growth", auth: "other", apis: ["/api/leads", "/api/leads/list"] },
    { id: "/growth/networking", path: "/growth/networking", label: "Networking", cat: "growth", auth: "other", apis: ["/api/networking/dashboard", "/api/networking/campaigns", "/api/networking/outreach", "/api/networking/prospects"] },
    { id: "/growth/networking/campaigns", path: "/growth/networking/campaigns", label: "Campaigns", cat: "growth", auth: "other", apis: ["/api/networking/campaigns"] },
    { id: "/growth/networking/outreach", path: "/growth/networking/outreach", label: "Outreach", cat: "growth", auth: "other", apis: ["/api/networking/outreach"] },
    { id: "/growth/networking/pipeline", path: "/growth/networking/pipeline", label: "Pipeline", cat: "growth", auth: "other", apis: ["/api/networking/prospects"] },

    // GAMES
    { id: "/game", path: "/game", label: "Game", cat: "games", auth: "public", apis: [] },
    { id: "/games", path: "/games", label: "Games Hub", cat: "games", auth: "public", apis: [] },
    { id: "/games/arena", path: "/games/arena", label: "Games Arena", cat: "games", auth: "public", apis: [] },
    { id: "/games/chess", path: "/games/chess", label: "Chess", cat: "games", auth: "public", apis: [] },
    { id: "/games/werewolf", path: "/games/werewolf", label: "Werewolf", cat: "games", auth: "public", apis: [] },

    // ENTERPRISE
    { id: "/enterprise", path: "/enterprise", label: "Enterprise", cat: "enterprise", auth: "public", apis: ["/api/enterprise-hub"] },
    { id: "/investors", path: "/investors", label: "Investors", cat: "enterprise", auth: "other", apis: [] },
    { id: "/earnings", path: "/earnings", label: "Earnings", cat: "enterprise", auth: "other", apis: [] },
    { id: "/fund", path: "/fund", label: "Fund", cat: "enterprise", auth: "paid", apis: [] },
    { id: "/fund/thank-you", path: "/fund/thank-you", label: "Fund Thanks", cat: "enterprise", auth: "paid", apis: [] },

    // SOLUTIONS
    { id: "/solutions", path: "/solutions", label: "Solutions", cat: "solutions", auth: "other", apis: [] },
    { id: "/solutions/growth", path: "/solutions/growth", label: "Growth", cat: "solutions", auth: "other", apis: [] },
    { id: "/solutions/ops", path: "/solutions/ops", label: "Ops", cat: "solutions", auth: "other", apis: [] },
    { id: "/solutions/sales", path: "/solutions/sales", label: "Sales", cat: "solutions", auth: "other", apis: [] },

    // INFRA
    { id: "/admin", path: "/admin", label: "Admin", cat: "infra", auth: "public", apis: ["/api/admin/owner", "/api/admin/data-forge", "/api/antigravity-fleet"] },
    { id: "/admin/data-forge", path: "/admin/data-forge", label: "Data Forge", cat: "infra", auth: "other", apis: ["/api/admin/data-forge"] },
    { id: "/build", path: "/build", label: "Build Engine", cat: "infra", auth: "paid", apis: ["/api/selfcoding", "/api/selfcoding/stream"] },
    { id: "/ide", path: "/ide", label: "IDE", cat: "infra", auth: "paid", apis: ["/api/ide/files"] },
    { id: "/desktop", path: "/desktop", label: "Desktop", cat: "infra", auth: "public", apis: ["/api/enterprise-agent", "/api/bytebot", "/api/bytebot/command"] },
    { id: "/tool-hub", path: "/tool-hub", label: "Tool Hub", cat: "infra", auth: "public", apis: ["/api/tool-hub/discover", "/api/tool-hub/execute", "/api/tool-hub/stats", "/api/tool-hub/workflow", "/api/orchestrate/capabilities"] },
    { id: "/mcp-servers", path: "/mcp-servers", label: "MCP Servers", cat: "infra", auth: "public", apis: ["/api/mcp/servers"] },
    { id: "/lab", path: "/lab", label: "Open Lab", cat: "infra", auth: "public", apis: ["/api/lab/session", "/api/lab/health"] },
    { id: "/cognee-galaxy", path: "/cognee-galaxy", label: "Cognee Galaxy", cat: "infra", auth: "other", apis: ["/api/cognee/graph"] },
    { id: "/blog", path: "/blog", label: "Blog", cat: "marketing", auth: "public", apis: ["/api/blog", "/api/blog/subscribe"] },
    { id: "/book", path: "/book", label: "Book Demo", cat: "marketing", auth: "public", apis: ["/api/calendly/webhook"] },
    { id: "/offer", path: "/offer", label: "Offer", cat: "marketing", auth: "public", apis: ["/api/offer-interest", "/api/leads", "/api/stripe/verify-session"] },
    { id: "/about", path: "/about", label: "About", cat: "marketing", auth: "public", apis: [] },
    { id: "/contact", path: "/contact", label: "Contact", cat: "marketing", auth: "public", apis: [] },
    { id: "/team", path: "/team", label: "Team", cat: "marketing", auth: "public", apis: [] },
    { id: "/download", path: "/download", label: "Download", cat: "marketing", auth: "public", apis: [] },
    { id: "/work", path: "/work", label: "Work", cat: "marketing", auth: "public", apis: [] },
    { id: "/services", path: "/services", label: "Services", cat: "marketing", auth: "public", apis: [] },
];

// ─────────────────────────────────────────────────────────────
// API → BACKEND WIRING
// Which backend(s) each API route connects to
// ─────────────────────────────────────────────────────────────
export const apiBackendMap = {
    // Supabase-only
    "/api/analytics/ingest": ["be-supabase"],
    "/api/analytics/realtime": ["be-supabase"],
    "/api/auth/login": ["be-supabase"],
    "/api/auth/register": ["be-supabase"],
    "/api/auth/forgot-password": ["be-supabase"],
    "/api/auth/reset-password": ["be-supabase"],
    "/api/auth/pairing": ["be-supabase"],
    "/api/auth/2fa/verify": ["be-supabase"],
    "/api/auth/signout": ["be-supabase"],
    "/api/leads": ["be-supabase"],
    "/api/leads/list": ["be-supabase"],
    "/api/agent-memory": ["be-supabase"],
    "/api/v1/agents": ["be-supabase", "be-stripe"],
    "/api/agents": ["be-supabase", "be-slack"],
    "/api/agents/status": ["be-supabase"],
    "/api/agents/orbs": ["be-supabase"],
    "/api/agents/control": ["be-supabase"],
    "/api/agents/spawn": ["be-supabase"],
    "/api/dashboard/metrics": ["be-supabase"],
    "/api/dashboard/activity": ["be-supabase"],
    "/api/dashboard/performance": ["be-supabase", "be-vps"],
    "/api/user/preferences": ["be-supabase"],
    "/api/subscription": ["be-supabase"],
    "/api/trial/status": ["be-supabase"],
    "/api/blog": ["be-supabase"],
    "/api/blog/subscribe": ["be-supabase"],
    "/api/offer-interest": ["be-supabase"],
    "/api/amlazr/telemetry": ["be-supabase"],
    "/api/arena/frameworks": ["be-supabase", "be-cognee"],
    "/api/arena/mode": ["be-supabase"],
    "/api/arena/tokens": ["be-supabase"],
    "/api/arena/users": ["be-supabase"],
    "/api/sic/dashboard": ["be-supabase"],
    "/api/sic/balance": ["be-supabase"],
    "/api/cost-intelligence": ["be-supabase"],
    "/api/qa-bounties": ["be-supabase"],

    // Stripe
    "/api/stripe": ["be-stripe"],
    "/api/stripe/checkout": ["be-stripe"],
    "/api/stripe/checkout-offer": ["be-stripe"],
    "/api/stripe/create-checkout-session": ["be-stripe"],
    "/api/stripe/create-portal-session": ["be-stripe"],
    "/api/stripe/time-access": ["be-stripe"],
    "/api/stripe/verify-session": ["be-stripe"],
    "/api/stripe/webhook": ["be-stripe", "be-supabase", "be-slack"],
    "/api/arena/checkout": ["be-stripe"],
    "/api/self-builder/checkout": ["be-stripe"],
    "/api/self-builder": ["be-supabase", "be-stripe"],

    // VPS (Hostinger 31.97.52.22)
    "/api/bytebot": ["be-vps"],
    "/api/bytebot/command": ["be-vps"],
    "/api/bytebot/status": ["be-vps"],
    "/api/bytebot/test": ["be-vps"],
    "/api/enterprise-agent": ["be-vps"],
    "/api/ops/health": ["be-vps", "be-vastai"],
    "/api/acp/health": ["be-vps"],
    "/api/selfcoding": ["be-vps", "be-openai"],
    "/api/selfcoding/stream": ["be-vps", "be-openai"],
    "/api/admin/data-forge": ["be-vps", "be-supabase"],
    "/api/admin/owner": ["be-supabase", "be-vps", "be-openrouter"],
    "/api/browser": ["be-vps"],
    "/api/browser/session": ["be-vps"],
    "/api/openvoice/clone": ["be-vps"],
    "/api/openvoice/generate": ["be-vps"],
    "/api/openvoice/health": ["be-vps"],
    "/api/lab/health": ["be-vps", "be-supabase"],
    "/api/lab/session": ["be-supabase"],
    "/api/security-audit": ["be-vps", "be-vastai"],
    "/api/pre-scan": ["be-vps"],

    // Vast.ai GPU
    "/api/vast-monitor": ["be-vastai"],
    "/api/gpu/invoke": ["be-vps", "be-vastai"],
    "/api/gpu/models": ["be-openai"],
    "/api/liveavatar": ["be-vps", "be-vastai"],
    "/api/live-avatar/wake": ["be-vastai"],
    "/api/live-avatar/webrtc": ["be-vastai"],
    "/api/creative/3d-generation": ["be-vastai"],

    // OpenRouter
    "/api/super-agent": ["be-openrouter"],
    "/api/chat/intelligent": ["be-openrouter"],
    "/api/prime-agent-chat": ["be-openrouter", "be-openai", "be-m4-qwen-coder"],
    "/api/kilo-gateway": ["be-openrouter", "be-openai"],
    "/api/phone-agent": ["be-openrouter"],

    // OpenAI direct
    "/api/ocr/extract": ["be-openai", "be-google"],
    "/api/computer-use/execute": ["be-openai", "be-vps"],
    "/api/computer-use/session": ["be-supabase"],
    "/api/computer-use/speak": ["be-openai"],
    "/api/computer-use/transcribe": ["be-openai"],

    // Google (Gemini, GCS, Drive)
    "/api/creative/gemini": ["be-google"],
    "/api/creative/image-generation": ["be-openai", "be-m4-flux-diffusion"],
    "/api/creative/video-generation": ["be-google", "be-supabase", "be-m4-ltx-video"],
    "/api/creative/music-generation": ["be-google"],
    "/api/creative/sound-fx": ["be-google"],
    "/api/creative/voice": ["be-google", "be-m4-qwen-tts"],
    "/api/creative/content-generation": ["be-supabase"],
    "/api/creative/story-generation": ["be-supabase"],
    "/api/creative/3d-extraction": ["be-google", "be-supabase"],
    "/api/creative/seedance": ["be-supabase"],
    "/api/search": ["be-google"],
    "/api/deepsearch": ["be-google"],
    "/api/calendly/webhook": ["be-supabase", "be-calendly"],
    "/api/calendly/poll": ["be-calendly", "be-slack"],
    "/api/drive-sync": ["be-google"],
    "/api/dispatch": ["be-google", "be-slack"],

    // Cognee KG
    "/api/cognee": ["be-cognee"],
    "/api/cognee/graph": ["be-cognee"],
    "/api/cognee/sync": ["be-cognee"],
    "/api/rag/orchestrate": ["be-cognee", "be-google", "be-m4-mistral-embed"],

    // Slack
    "/api/slack/app": ["be-slack"],
    "/api/slack/events": ["be-slack"],
    "/api/fleet": ["be-vps", "be-vastai", "be-stripe"],

    // n8n (Render)
    "/api/n8n/workflows": ["be-render", "be-supabase", "be-cognee"],
    "/api/n8n/status": ["be-render"],
    "/api/n8n/webhook": ["be-render"],
    "/api/workflows": ["be-supabase"],
    "/api/workflows/composer": ["be-supabase", "be-slack"],

    // Anam AI
    "/api/anam/session": ["be-anam"],

    // Multi-backend
    "/api/orb-dispatch": ["be-vps", "be-supabase", "be-openrouter"],
    "/api/antigravity-fleet": ["be-openai", "be-supabase"],
    "/api/system/universe": ["be-supabase", "be-vps", "be-cognee"],
    "/api/system-state": ["be-supabase"],
    "/api/mcp/servers": ["be-supabase"],
    "/api/mcp/cost-tracking": ["be-supabase"],
    "/api/mcp/provider-intelligence": ["be-supabase", "be-vps", "be-vastai"],
    "/api/tool-hub/discover": ["be-supabase"],
    "/api/tool-hub/execute": ["be-vps"],
    "/api/tool-hub/stats": ["be-supabase"],
    "/api/tool-hub/workflow": ["be-supabase"],
    "/api/orchestrate/capabilities": ["be-supabase"],
    "/api/speech-agent": ["be-render", "be-google"],
    "/api/build/live": ["be-vps"],
    "/api/build/stream": ["be-vps", "be-openai"],
    "/api/deploy": ["be-vercel", "be-vps"],
    "/api/ide/files": ["be-vps"],
    "/api/codebase/analyze": ["be-supabase", "be-openrouter"],
    "/api/codebase/ingest": ["be-supabase"],
    "/api/debug/fast-fix": ["be-supabase"],
    "/api/enterprise-hub": ["be-supabase"],
    "/api/swarm/status": ["be-supabase"],
    "/api/swarm/launch": ["be-supabase"],
    "/api/swarm/memory": ["be-supabase"],
    "/api/swarm/events": ["be-supabase"],
    "/api/networking/dashboard": ["be-supabase"],
    "/api/networking/campaigns": ["be-supabase"],
    "/api/networking/outreach": ["be-supabase"],
    "/api/networking/prospects": ["be-supabase"],
    "/api/agent/humanoid": ["be-supabase"],
    "/api/agent/status": ["be-supabase"],
    "/api/agent/validate": ["be-supabase"],
    "/api/autonomous/run": ["be-vps"],
    "/api/autonomous/status": ["be-vps"],
    "/api/printer/print": ["be-vercel"],
    "/api/github/fleet": ["be-supabase"],
    "/api/github/reports": ["be-supabase"],
    "/api/qa/status": ["be-supabase"],
    "/api/qa-fleet": ["be-supabase"],
    "/api/orchestrate": ["be-vps"],
    "/api/orchestrate/status": ["be-vps"],
    "/api/command-center": ["be-supabase"],
    "/api/command-center/avatars": ["be-supabase", "be-vps"],
    "/api/command-center/workflow": ["be-supabase"],
    "/api/security": ["be-supabase"],
    "/api/system/ledger": ["be-supabase"],
    "/api/system/tactical": ["be-supabase"],
    "/api/tablet-bot": ["be-supabase"],
    "/api/agents/build": ["be-supabase", "be-vastai"],
    "/api/radio": ["be-google"],
    "/api/ai-studio": ["be-supabase"],
    "/api/voice": ["be-google"],
    "/api/blog/deepsearch": ["be-supabase", "be-google"],
    "/api/avatar-creator": ["be-supabase"],
    "/api/instagram/generate": ["be-vastai", "be-supabase"],
    "/api/liveavatar/media": ["be-vps"],
    "/api/agent/workflows/builder": ["be-supabase"],

    // Agent William — WLAN Controller
    "/api/william": ["be-vercel"],
    "/api/imac-agent": ["be-vercel"],
};

// ─────────────────────────────────────────────────────────────
// NAVIGATION EDGES (frontend -> frontend)
// ─────────────────────────────────────────────────────────────
export const navigationEdges = [
    { from: "/", to: "/pricing", label: "CTA" },
    { from: "/", to: "/enterprise", label: "Nav" },
    { from: "/", to: "/about", label: "Nav" },
    { from: "/", to: "/blog", label: "Nav" },
    { from: "/", to: "/book", label: "CTA" },
    { from: "/pricing", to: "/pricing/success", label: "Stripe" },
    { from: "/login", to: "/dashboard", label: "Auth" },
    { from: "/login", to: "/auth/signup", label: "Link" },
    { from: "/dashboard", to: "/dashboard/agents", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/profile", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/cost-intelligence", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/leads", label: "Tab" },
    { from: "/dashboard", to: "/chat", label: "Link" },
    { from: "/dashboard", to: "/analytics", label: "Link" },
    { from: "/amlazr", to: "/analytics", label: "Link" },
    { from: "/amlazr", to: "/dashboard", label: "Link" },
    { from: "/amlazr", to: "/ops/command-center", label: "Link" },
    { from: "/marketplace", to: "/build-agent", label: "CTA" },
    { from: "/build-agent", to: "/my-agents", label: "Created" },
    { from: "/my-agents", to: "/agent-control", label: "Manage" },
    { from: "/agent-control", to: "/agent-memory", label: "Tab" },
    { from: "/agent-control", to: "/agent-settings", label: "Tab" },
    { from: "/creative", to: "/live-avatar", label: "Link" },
    { from: "/creative", to: "/live-code", label: "Link" },
    { from: "/vision", to: "/vision/ocr", label: "Tab" },
    { from: "/voice", to: "/voice/speech", label: "Tab" },
    { from: "/workflows", to: "/workflows/composer", label: "Tab" },
    { from: "/workflows", to: "/workflows/n8n", label: "Tab" },
    { from: "/ops/command-center", to: "/ops/fleet", label: "Link" },
    { from: "/ops/command-center", to: "/ops/gpu-monitor", label: "Link" },
    { from: "/ops/fleet", to: "/github-fleet", label: "Link" },
    { from: "/growth/networking", to: "/growth/networking/campaigns", label: "Tab" },
    { from: "/growth/networking", to: "/growth/networking/outreach", label: "Tab" },
    { from: "/games", to: "/games/chess", label: "Link" },
    { from: "/games", to: "/games/werewolf", label: "Link" },
    { from: "/solutions", to: "/solutions/growth", label: "Tab" },
    { from: "/tool-hub", to: "/mcp-servers", label: "Link" },
    { from: "/admin", to: "/admin/data-forge", label: "Link" },
    { from: "/build", to: "/ide", label: "Link" },
    { from: "/offer", to: "/pricing", label: "CTA" },
    { from: "/self-builder", to: "/self-builder/checkout", label: "CTA" },
];

// ─────────────────────────────────────────────────────────────
// GLOBAL COMPONENTS → API wiring (shared across all pages)
// ─────────────────────────────────────────────────────────────
export const globalApis = [
    { id: "global-orb", label: "Orb Widget", apis: ["/api/prime-agent-chat", "/api/orb-dispatch", "/api/self-builder"] },
    { id: "global-analytics", label: "Analytics Tracker", apis: ["/api/analytics/ingest"] },
    { id: "global-auth", label: "Auth Guard", apis: ["/api/auth/[...nextauth]", "/api/subscription"] },
    { id: "global-trial", label: "Trial Badge", apis: ["/api/trial/status"] },
    { id: "global-telemetry", label: "Telemetry", apis: ["/api/telemetry/journal", "/api/system-telemetry"] },
];

export const externalUrls = [
    { id: "ext-draft-aiy", label: "draft-aiy.vercel.app", url: "https://draft-aiy.vercel.app/", type: "vercel" },
    { id: "ext-ran", label: "ran-sales-copilot.vercel.app", url: "https://ran-sales-copilot.vercel.app/", type: "vercel" },
    { id: "ext-gdrive-mcp", label: "google-drive-mcp.onrender", url: "https://google-drive-mcp-server.onrender.com", type: "render" },
    { id: "ext-n8n-1", label: "n8n-9pul.onrender", url: "https://n8n-9pul.onrender.com", type: "render" },
    { id: "ext-n8n-2", label: "n8n-hzd1.onrender", url: "https://n8n-hzd1.onrender.com", type: "render" },
    { id: "ext-fly", label: "prime-orchestrator.fly.dev", url: "https://prime-orchestrator.fly.dev", type: "fly" },
    { id: "ext-supabase", label: "Supabase DB", url: "https://mxssdqqttwwcgxpkbgam.supabase.co", type: "supabase" },
];
