// AMLAZR / Prime.AI — Complete Site Map Data
// Generated: 2026-03-06 — 157 pages, 348 API routes
// Auth: public | paid | e2f | other | redirect

const DOMAIN = "https://www.amlazr.com";

const CATEGORIES = {
    core: { label: "Core", color: "#3b82f6" },
    dashboard: { label: "Dashboard", color: "#8b5cf6" },
    auth: { label: "Auth", color: "#ef4444" },
    marketing: { label: "Marketing", color: "#22c55e" },
    creative: { label: "Creative", color: "#ec4899" },
    agents: { label: "Agents", color: "#f97316" },
    ops: { label: "Ops & Fleet", color: "#14b8a6" },
    growth: { label: "Growth", color: "#eab308" },
    vision: { label: "Vision & Voice", color: "#a855f7" },
    workflows: { label: "Workflows", color: "#06b6d4" },
    games: { label: "Games", color: "#f43f5e" },
    enterprise: { label: "Enterprise", color: "#64748b" },
    solutions: { label: "Solutions", color: "#0ea5e9" },
    infra: { label: "Infrastructure", color: "#d946ef" },
    external: { label: "External", color: "#78716c" },
};

export const pages = [
    // CORE
    { id: "/", path: "/", label: "Home", cat: "core", auth: "public" },
    { id: "/amlazr", path: "/amlazr", label: "AMLAZR Dashboard", cat: "core", auth: "e2f" },
    { id: "/analytics", path: "/analytics", label: "Analytics", cat: "core", auth: "paid" },
    { id: "/pricing", path: "/pricing", label: "Pricing", cat: "core", auth: "public" },
    { id: "/pricing/success", path: "/pricing/success", label: "Pricing Success", cat: "core", auth: "public" },
    { id: "/pricing/cancel", path: "/pricing/cancel", label: "Pricing Cancel", cat: "core", auth: "public" },
    { id: "/login", path: "/login", label: "Login", cat: "auth", auth: "public" },
    { id: "/about", path: "/about", label: "About", cat: "marketing", auth: "public" },
    { id: "/contact", path: "/contact", label: "Contact", cat: "marketing", auth: "public" },
    { id: "/blog", path: "/blog", label: "Blog", cat: "marketing", auth: "public" },
    { id: "/team", path: "/team", label: "Team", cat: "marketing", auth: "public" },
    { id: "/careers", path: "/careers", label: "Careers", cat: "marketing", auth: "public" },
    { id: "/enterprise", path: "/enterprise", label: "Enterprise", cat: "marketing", auth: "public" },
    { id: "/faq", path: "/faq", label: "FAQ", cat: "marketing", auth: "public" },
    { id: "/help", path: "/help", label: "Help", cat: "marketing", auth: "other" },
    { id: "/support", path: "/support", label: "Support", cat: "marketing", auth: "other" },
    { id: "/terms", path: "/terms", label: "Terms", cat: "marketing", auth: "other" },
    { id: "/privacy", path: "/privacy", label: "Privacy", cat: "marketing", auth: "other" },
    { id: "/legal", path: "/legal", label: "Legal", cat: "marketing", auth: "other" },
    { id: "/case-studies", path: "/case-studies", label: "Case Studies", cat: "marketing", auth: "other" },
    { id: "/testimonials", path: "/testimonials", label: "Testimonials", cat: "marketing", auth: "other" },
    { id: "/changelog", path: "/changelog", label: "Changelog", cat: "marketing", auth: "other" },
    { id: "/status", path: "/status", label: "Status", cat: "marketing", auth: "other" },
    { id: "/feedback", path: "/feedback", label: "Feedback", cat: "marketing", auth: "other" },
    { id: "/book", path: "/book", label: "Book Demo", cat: "marketing", auth: "public" },
    { id: "/download", path: "/download", label: "Download", cat: "marketing", auth: "public" },

    // AUTH
    { id: "/auth/signup", path: "/auth/signup", label: "Signup", cat: "auth", auth: "public" },
    { id: "/auth/forgot-password", path: "/auth/forgot-password", label: "Forgot Password", cat: "auth", auth: "public" },
    { id: "/auth/reset-password", path: "/auth/reset-password", label: "Reset Password", cat: "auth", auth: "public" },

    // DASHBOARD
    { id: "/dashboard", path: "/dashboard", label: "Dashboard Hub", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/agents", path: "/dashboard/agents", label: "My Agents", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/profile", path: "/dashboard/profile", label: "Profile", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/access", path: "/dashboard/access", label: "Access", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/computer-use", path: "/dashboard/computer-use", label: "Computer Use", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/cost-intelligence", path: "/dashboard/cost-intelligence", label: "Cost Intel", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/deep-search", path: "/dashboard/deep-search", label: "Deep Search", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/leads", path: "/dashboard/leads", label: "Leads", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/prompts", path: "/dashboard/prompts", label: "Prompts", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/tablet-bot", path: "/dashboard/tablet-bot", label: "Tablet Bot", cat: "dashboard", auth: "paid" },
    { id: "/dashboard/training", path: "/dashboard/training", label: "Training", cat: "dashboard", auth: "paid" },
    { id: "/chat", path: "/chat", label: "Chat", cat: "dashboard", auth: "paid" },
    { id: "/search", path: "/search", label: "Search", cat: "dashboard", auth: "public" },
    { id: "/onboarding", path: "/onboarding", label: "Onboarding", cat: "dashboard", auth: "other" },
    { id: "/checkout", path: "/checkout", label: "Checkout", cat: "dashboard", auth: "other" },
    { id: "/demo", path: "/demo", label: "Demo", cat: "dashboard", auth: "public" },

    // AGENTS
    { id: "/build-agent", path: "/build-agent", label: "Build Agent", cat: "agents", auth: "paid" },
    { id: "/my-agents", path: "/my-agents", label: "My Agents", cat: "agents", auth: "paid" },
    { id: "/agent-control", path: "/agent-control", label: "Agent Control", cat: "agents", auth: "paid" },
    { id: "/agent-memory", path: "/agent-memory", label: "Agent Memory", cat: "agents", auth: "paid" },
    { id: "/agent-mode", path: "/agent-mode", label: "Agent Mode", cat: "agents", auth: "paid" },
    { id: "/agent-settings", path: "/agent-settings", label: "Agent Settings", cat: "agents", auth: "paid" },
    { id: "/marketplace", path: "/marketplace", label: "Marketplace", cat: "agents", auth: "public" },
    { id: "/arena", path: "/arena", label: "Arena", cat: "agents", auth: "public" },
    { id: "/arena/pricing", path: "/arena/pricing", label: "Arena Pricing", cat: "agents", auth: "public" },
    { id: "/self-builder", path: "/self-builder", label: "Self Builder", cat: "agents", auth: "public" },
    { id: "/self-builder/success", path: "/self-builder/success", label: "Builder Success", cat: "agents", auth: "other" },
    { id: "/autonomous", path: "/autonomous", label: "Autonomous", cat: "agents", auth: "other" },
    { id: "/swarm", path: "/swarm", label: "Swarm", cat: "agents", auth: "paid" },

    // OPS & FLEET
    { id: "/ops/command-center", path: "/ops/command-center", label: "Command Center", cat: "ops", auth: "other" },
    { id: "/ops/fleet", path: "/ops/fleet", label: "Fleet", cat: "ops", auth: "other" },
    { id: "/ops/gpu-monitor", path: "/ops/gpu-monitor", label: "GPU Monitor", cat: "ops", auth: "other" },
    { id: "/ops/health", path: "/ops/health", label: "Health", cat: "ops", auth: "other" },
    { id: "/ops/mission-control", path: "/ops/mission-control", label: "Mission Control", cat: "ops", auth: "other" },
    { id: "/github-fleet", path: "/github-fleet", label: "GitHub Fleet", cat: "ops", auth: "paid" },
    { id: "/codebase-intelligence", path: "/codebase-intelligence", label: "Codebase Intel", cat: "ops", auth: "paid" },
    { id: "/cyber-defense", path: "/cyber-defense", label: "Cyber Defense", cat: "ops", auth: "paid" },
    { id: "/sic", path: "/sic", label: "SIC", cat: "ops", auth: "paid" },
    { id: "/orchestration", path: "/orchestration", label: "Orchestration", cat: "ops", auth: "paid" },
    { id: "/unified-dashboard", path: "/unified-dashboard", label: "Unified Dashboard", cat: "ops", auth: "paid" },
    { id: "/qa-dashboard", path: "/qa-dashboard", label: "QA Dashboard", cat: "ops", auth: "paid" },
    { id: "/debug", path: "/debug", label: "Debug", cat: "ops", auth: "paid" },
    { id: "/live-build", path: "/live-build", label: "Live Build", cat: "ops", auth: "paid" },

    // CREATIVE
    { id: "/creative", path: "/creative", label: "Creative Studio", cat: "creative", auth: "public" },
    { id: "/ai-studio", path: "/ai-studio", label: "AI Studio", cat: "creative", auth: "other" },
    { id: "/live-code", path: "/live-code", label: "Live Code", cat: "creative", auth: "other" },
    { id: "/live-avatar", path: "/live-avatar", label: "Live Avatar", cat: "creative", auth: "public" },
    { id: "/radio", path: "/radio", label: "Radio", cat: "creative", auth: "other" },
    { id: "/print", path: "/print", label: "Print", cat: "creative", auth: "other" },

    // VISION & VOICE
    { id: "/vision", path: "/vision", label: "Vision", cat: "vision", auth: "public" },
    { id: "/vision/browser", path: "/vision/browser", label: "Browser Vision", cat: "vision", auth: "other" },
    { id: "/vision/humanoid", path: "/vision/humanoid", label: "Humanoid", cat: "vision", auth: "other" },
    { id: "/vision/ocr", path: "/vision/ocr", label: "OCR", cat: "vision", auth: "other" },
    { id: "/voice", path: "/voice", label: "Voice", cat: "vision", auth: "other" },
    { id: "/voice/podcast", path: "/voice/podcast", label: "Podcast", cat: "vision", auth: "other" },
    { id: "/voice/speech", path: "/voice/speech", label: "Speech", cat: "vision", auth: "other" },

    // WORKFLOWS
    { id: "/workflows", path: "/workflows", label: "Workflows", cat: "workflows", auth: "paid" },
    { id: "/workflows/builder", path: "/workflows/builder", label: "WF Builder", cat: "workflows", auth: "paid" },
    { id: "/workflows/composer", path: "/workflows/composer", label: "WF Composer", cat: "workflows", auth: "paid" },
    { id: "/workflows/n8n", path: "/workflows/n8n", label: "n8n", cat: "workflows", auth: "paid" },

    // GROWTH
    { id: "/growth/leads", path: "/growth/leads", label: "Leads", cat: "growth", auth: "other" },
    { id: "/growth/networking", path: "/growth/networking", label: "Networking", cat: "growth", auth: "other" },
    { id: "/growth/networking/campaigns", path: "/growth/networking/campaigns", label: "Campaigns", cat: "growth", auth: "other" },
    { id: "/growth/networking/outreach", path: "/growth/networking/outreach", label: "Outreach", cat: "growth", auth: "other" },
    { id: "/growth/networking/pipeline", path: "/growth/networking/pipeline", label: "Pipeline", cat: "growth", auth: "other" },

    // GAMES
    { id: "/game", path: "/game", label: "Game", cat: "games", auth: "public" },
    { id: "/games", path: "/games", label: "Games Hub", cat: "games", auth: "public" },
    { id: "/games/arena", path: "/games/arena", label: "Games Arena", cat: "games", auth: "public" },
    { id: "/games/chess", path: "/games/chess", label: "Chess", cat: "games", auth: "public" },
    { id: "/games/werewolf", path: "/games/werewolf", label: "Werewolf", cat: "games", auth: "public" },

    // ENTERPRISE / SOLUTIONS
    { id: "/solutions", path: "/solutions", label: "Solutions", cat: "solutions", auth: "other" },
    { id: "/solutions/growth", path: "/solutions/growth", label: "Growth", cat: "solutions", auth: "other" },
    { id: "/solutions/ops", path: "/solutions/ops", label: "Ops", cat: "solutions", auth: "other" },
    { id: "/solutions/sales", path: "/solutions/sales", label: "Sales", cat: "solutions", auth: "other" },
    { id: "/investors", path: "/investors", label: "Investors", cat: "enterprise", auth: "other" },
    { id: "/earnings", path: "/earnings", label: "Earnings", cat: "enterprise", auth: "other" },
    { id: "/fund", path: "/fund", label: "Fund", cat: "enterprise", auth: "paid" },
    { id: "/fund/thank-you", path: "/fund/thank-you", label: "Fund Thanks", cat: "enterprise", auth: "paid" },
    { id: "/compliance", path: "/compliance", label: "Compliance", cat: "enterprise", auth: "other" },
    { id: "/security", path: "/security", label: "Security", cat: "enterprise", auth: "other" },

    // INFRA
    { id: "/admin", path: "/admin", label: "Admin", cat: "infra", auth: "public" },
    { id: "/admin/data-forge", path: "/admin/data-forge", label: "Data Forge", cat: "infra", auth: "other" },
    { id: "/build", path: "/build", label: "Build Engine", cat: "infra", auth: "paid" },
    { id: "/ide", path: "/ide", label: "IDE", cat: "infra", auth: "paid" },
    { id: "/desktop", path: "/desktop", label: "Desktop", cat: "infra", auth: "public" },
    { id: "/tool-hub", path: "/tool-hub", label: "Tool Hub", cat: "infra", auth: "public" },
    { id: "/mcp-servers", path: "/mcp-servers", label: "MCP Servers", cat: "infra", auth: "public" },
    { id: "/models", path: "/models", label: "Models", cat: "infra", auth: "other" },
    { id: "/integrations", path: "/integrations", label: "Integrations", cat: "infra", auth: "other" },
    { id: "/api-docs", path: "/api-docs", label: "API Docs", cat: "infra", auth: "other" },
    { id: "/docs/api", path: "/docs/api", label: "Docs API", cat: "infra", auth: "other" },
    { id: "/rag-analysis", path: "/rag-analysis", label: "RAG Analysis", cat: "infra", auth: "paid" },
    { id: "/real-analysis", path: "/real-analysis", label: "Real Analysis", cat: "infra", auth: "paid" },
    { id: "/cognee-galaxy", path: "/cognee-galaxy", label: "Cognee Galaxy", cat: "infra", auth: "other" },
    { id: "/crypto", path: "/crypto", label: "Crypto", cat: "infra", auth: "other" },

    // MISC
    { id: "/galaxy", path: "/galaxy", label: "Galaxy", cat: "core", auth: "public" },
    { id: "/launchpad", path: "/launchpad", label: "Launchpad", cat: "core", auth: "public" },
    { id: "/mission/airlock", path: "/mission/airlock", label: "Airlock", cat: "core", auth: "public" },
    { id: "/offer/showcase", path: "/offer/showcase", label: "Showcase", cat: "marketing", auth: "public" },
    { id: "/offer/success", path: "/offer/success", label: "Offer OK", cat: "marketing", auth: "public" },
    { id: "/work", path: "/work", label: "Work", cat: "marketing", auth: "public" },
    { id: "/prime/dashboard", path: "/prime/dashboard", label: "Prime Dashboard", cat: "core", auth: "other" },
    { id: "/services/ran-copilot", path: "/services/ran-copilot", label: "RAN Copilot", cat: "solutions", auth: "other" },
    { id: "/draft-aiy", path: "/draft-aiy", label: "Draft AIY", cat: "infra", auth: "other" },
    { id: "/industries", path: "/industries/[slug]", label: "Industries", cat: "solutions", auth: "other" },
    { id: "/services/audit", path: "/audit", label: "Audit", cat: "marketing", auth: "public" },
    { id: "/services", path: "/services", label: "Services", cat: "marketing", auth: "public" },
    { id: "/services/audit-ia", path: "/services/audit-ia", label: "Audit IA", cat: "marketing", auth: "public" },
    { id: "/services/auto-ia", path: "/services/automatisation-ia", label: "Auto IA", cat: "marketing", auth: "public" },
];

// Navigation links between pages (edges)
export const navigationEdges = [
    // Core navigation flow
    { from: "/", to: "/pricing", label: "CTA" },
    { from: "/", to: "/enterprise", label: "Nav" },
    { from: "/", to: "/about", label: "Nav" },
    { from: "/", to: "/contact", label: "Nav" },
    { from: "/", to: "/blog", label: "Nav" },
    { from: "/", to: "/book", label: "CTA" },
    { from: "/pricing", to: "/checkout", label: "Buy" },
    { from: "/pricing", to: "/pricing/success", label: "Stripe" },
    { from: "/pricing", to: "/pricing/cancel", label: "Stripe" },
    { from: "/login", to: "/dashboard", label: "Auth" },
    { from: "/login", to: "/auth/signup", label: "Link" },
    { from: "/login", to: "/auth/forgot-password", label: "Link" },
    { from: "/auth/signup", to: "/login", label: "Link" },

    // Dashboard internal
    { from: "/dashboard", to: "/dashboard/agents", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/profile", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/deep-search", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/cost-intelligence", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/leads", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/prompts", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/training", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/computer-use", label: "Tab" },
    { from: "/dashboard", to: "/dashboard/tablet-bot", label: "Tab" },
    { from: "/dashboard", to: "/chat", label: "Link" },
    { from: "/dashboard", to: "/analytics", label: "Link" },

    // AMLAZR owner
    { from: "/amlazr", to: "/analytics", label: "Link" },
    { from: "/amlazr", to: "/dashboard", label: "Link" },
    { from: "/amlazr", to: "/ops/command-center", label: "Link" },

    // Agent ecosystem
    { from: "/marketplace", to: "/build-agent", label: "CTA" },
    { from: "/build-agent", to: "/my-agents", label: "Created" },
    { from: "/my-agents", to: "/agent-control", label: "Manage" },
    { from: "/agent-control", to: "/agent-memory", label: "Tab" },
    { from: "/agent-control", to: "/agent-mode", label: "Tab" },
    { from: "/agent-control", to: "/agent-settings", label: "Tab" },
    { from: "/arena", to: "/arena/pricing", label: "CTA" },
    { from: "/self-builder", to: "/self-builder/success", label: "Complete" },

    // Creative
    { from: "/creative", to: "/ai-studio", label: "Link" },
    { from: "/creative", to: "/live-avatar", label: "Link" },
    { from: "/creative", to: "/live-code", label: "Link" },

    // Vision & Voice
    { from: "/vision", to: "/vision/browser", label: "Tab" },
    { from: "/vision", to: "/vision/humanoid", label: "Tab" },
    { from: "/vision", to: "/vision/ocr", label: "Tab" },
    { from: "/voice", to: "/voice/podcast", label: "Tab" },
    { from: "/voice", to: "/voice/speech", label: "Tab" },

    // Workflows
    { from: "/workflows", to: "/workflows/builder", label: "Tab" },
    { from: "/workflows", to: "/workflows/composer", label: "Tab" },
    { from: "/workflows", to: "/workflows/n8n", label: "Tab" },

    // Ops
    { from: "/ops/command-center", to: "/ops/fleet", label: "Link" },
    { from: "/ops/command-center", to: "/ops/gpu-monitor", label: "Link" },
    { from: "/ops/command-center", to: "/ops/health", label: "Link" },
    { from: "/ops/command-center", to: "/ops/mission-control", label: "Link" },
    { from: "/ops/fleet", to: "/github-fleet", label: "Link" },

    // Growth
    { from: "/growth/networking", to: "/growth/networking/campaigns", label: "Tab" },
    { from: "/growth/networking", to: "/growth/networking/outreach", label: "Tab" },
    { from: "/growth/networking", to: "/growth/networking/pipeline", label: "Tab" },
    { from: "/growth/leads", to: "/growth/networking", label: "Link" },

    // Games
    { from: "/games", to: "/games/arena", label: "Link" },
    { from: "/games", to: "/games/chess", label: "Link" },
    { from: "/games", to: "/games/werewolf", label: "Link" },
    { from: "/game", to: "/games", label: "Link" },

    // Solutions
    { from: "/solutions", to: "/solutions/growth", label: "Tab" },
    { from: "/solutions", to: "/solutions/ops", label: "Tab" },
    { from: "/solutions", to: "/solutions/sales", label: "Tab" },

    // Fund
    { from: "/fund", to: "/fund/thank-you", label: "Submit" },

    // Offer
    { from: "/offer", to: "/offer/showcase", label: "Link" },
    { from: "/offer", to: "/offer/success", label: "Payment" },

    // Services
    { from: "/services", to: "/services/audit-ia", label: "Link" },
    { from: "/services", to: "/services/auto-ia", label: "Link" },
    { from: "/services", to: "/services/ran-copilot", label: "Link" },
    { from: "/services", to: "/services/creative", label: "Link" },

    // Infra
    { from: "/tool-hub", to: "/mcp-servers", label: "Link" },
    { from: "/admin", to: "/admin/data-forge", label: "Link" },
    { from: "/build", to: "/ide", label: "Link" },
];

export const externalUrls = [
    { id: "ext-draft-aiy", label: "draft-aiy.vercel.app", url: "https://draft-aiy.vercel.app/", type: "vercel" },
    { id: "ext-ran", label: "ran-sales-copilot.vercel.app", url: "https://ran-sales-copilot.vercel.app/", type: "vercel" },
    { id: "ext-prime-spark", label: "prime-spark.vercel.app", url: "https://prime-spark.vercel.app", type: "vercel" },
    { id: "ext-gdrive-mcp", label: "google-drive-mcp.onrender", url: "https://google-drive-mcp-server.onrender.com", type: "render" },
    { id: "ext-n8n-1", label: "n8n-9pul.onrender", url: "https://n8n-9pul.onrender.com", type: "render" },
    { id: "ext-n8n-2", label: "n8n-hzd1.onrender", url: "https://n8n-hzd1.onrender.com", type: "render" },
    { id: "ext-n8n-3", label: "n8n-workflows.onrender", url: "https://n8n-workflows-1-xxgm.onrender.com", type: "render" },
    { id: "ext-fly", label: "prime-orchestrator.fly.dev", url: "https://prime-orchestrator.fly.dev", type: "fly" },
    { id: "ext-supabase", label: "Supabase DB", url: "https://mxssdqqttwwcgxpkbgam.supabase.co", type: "supabase" },
];

export const CATEGORIES_META = CATEGORIES;
export const SITE_DOMAIN = DOMAIN;
