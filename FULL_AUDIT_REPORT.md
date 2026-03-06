# FULL AUDIT REPORT — Pages Classification & Analytics Wiring
## Date: 2026-02-24T05:10:00+01:00
## Status: 🟢 VERIFIED

---

## 1. YACE19AI.COM — Route Audit (17 pages)

### ✅ PUBLIC (End-User Facing) — 8 pages
| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing page |
| `/solutions` | ThemesPage | Solutions showcase |
| `/voice` | VoicePage | Voice AI demo |
| `/fleet` | FleetPage | Portfolio / Our Work |
| `/sovereign` | SovereignSearchPage | Sovereign AI search |
| `/pricing` | PricingPage | Pricing plans |
| `/pricing/success` | PricingSuccessPage | Post-payment |
| `/philosophy` | PhilosophyPage | About Us |

### 🔴 INTERNAL ONLY — Should NOT be visible to end users — 9 pages
| Route | Page | Risk Level | Action |
|---|---|---|---|
| `/build` | SelfCodingPage | 🟡 Medium | Self-coding engine — **for admin/demo only** |
| `/analytics` | AnalyticsPage | 🔴 HIGH | **Full analytics dashboard with raw data** |
| `/crm` | CRMPage | 🔴 HIGH | **CRM pipeline with prospect data** |
| `/agents` | AgentMemoryPage | 🔴 HIGH | **Agent memory viewer — internal infra** |
| `/graph` | KnowledgeGraphPage | 🟡 Medium | Knowledge graph visualization |
| `/costs` | CostTrackerPage | 🔴 HIGH | **Cost tracking — financial data exposed** |
| `/extractor` | DataExtractorPage | 🟡 Medium | Data extraction tool — admin tool |
| `/status` | StatusPage | 🟡 Medium | System status — reveals infrastructure |
| `/blog` | BlogPage | 🟡 Medium | Blog (public but links not in nav) |

---

## 2. PRIME-AI.FR — Route Audit (143 pages)

### ✅ PUBLIC (End-User Facing) — 40 pages
| Route | Description |
|---|---|
| `/` | Landing page |
| `/about` | About page |
| `/blog` | Blog |
| `/book` | Booking page |
| `/careers` | Careers |
| `/case-studies` | Case studies |
| `/changelog` | Changelog |
| `/compliance` | Compliance info |
| `/contact` | Contact form |
| `/demo` | Demo page |
| `/download` | Download page |
| `/enterprise` | Enterprise offering |
| `/faq` | FAQ |
| `/fund` | Funding / investment |
| `/fund/thank-you` | Thank you page |
| `/game` | Game demo |
| `/games` | Games catalog |
| `/help` | Help page |
| `/integrations` | Integrations |
| `/investors` | Investor page |
| `/legal` | Legal info |
| `/marketplace` | Marketplace |
| `/models` | AI models showcase |
| `/offer` | Special offers |
| `/offer/showcase` | Offer showcase |
| `/offer/success` | Offer success |
| `/pricing` | Pricing |
| `/pricing/cancel` | Payment cancel |
| `/pricing/success` | Payment success |
| `/privacy` | Privacy policy |
| `/services/creative` | Creative services |
| `/solutions` | Solutions overview |
| `/solutions/growth` | Growth solutions |
| `/solutions/ops` | Ops solutions |
| `/solutions/sales` | Sales solutions |
| `/support` | Support page |
| `/team` | Team page |
| `/terms` | Terms of service |
| `/testimonials` | Testimonials |
| `/work` | Work/portfolio |

### ✅ AUTH-GATED (Requires Login) — 30 pages
| Route | Description |
|---|---|
| `/auth/*` | Login, signup, forgot/reset password |
| `/billing` | Billing management |
| `/chat` | Chat interface |
| `/checkout` | Checkout |
| `/dashboard` | User dashboard |
| `/dashboard/profile` | User profile |
| `/dashboard/access` | Access management |
| `/creative/*` | Creative tools (image, video, content, story) |
| `/notifications` | User notifications |
| `/onboarding` | User onboarding |
| `/search` | Search |
| `/settings` | User settings |
| `/voice/*` | Voice tools |

### 🔴 INTERNAL ONLY — Should NOT be visible to end users — 73 pages
| Route | Risk | Description |
|---|---|---|
| `/admin` | 🔴 CRITICAL | **Admin panel** |
| `/analytics` | 🔴 CRITICAL | **Analytics dashboard — raw traffic data** |
| `/agent` | 🔴 HIGH | Agent interface |
| `/agent-control` | 🔴 HIGH | Agent control panel |
| `/agent-memory` | 🔴 HIGH | **Agent memory viewer** |
| `/agent-mode` | 🔴 HIGH | Agent mode switcher |
| `/agent-settings` | 🔴 HIGH | Agent configuration |
| `/agents` | 🔴 HIGH | Agent fleet manager |
| `/api-docs` | 🟡 MEDIUM | API documentation (semi-public) |
| `/arena` | 🟡 MEDIUM | Arena/competition |
| `/arena/pricing` | 🟡 MEDIUM | Arena pricing |
| `/autonomous` | 🔴 HIGH | **Autonomous mode — fully automated agent** |
| `/build-agent` | 🔴 HIGH | Agent builder |
| `/codebase-intelligence` | 🔴 HIGH | **Codebase analysis tool** |
| `/cognee-galaxy` | 🔴 HIGH | Knowledge graph |
| `/crypto` | 🟡 MEDIUM | Crypto tools |
| `/cyber-defense` | 🟡 MEDIUM | Cyber defense |
| `/dashboard/agent-bridge` | 🔴 HIGH | **Agent bridge — infra control** |
| `/dashboard/agent-workspace` | 🔴 HIGH | **Agent workspace** |
| `/dashboard/agents` | 🔴 HIGH | **Dashboard agents** |
| `/dashboard/computer-use` | 🔴 HIGH | **Computer use — browser automation** |
| `/dashboard/cost-intelligence` | 🔴 HIGH | **Cost tracking** |
| `/dashboard/deep-search` | 🔴 HIGH | Deep search tool |
| `/dashboard/tablet-bot` | 🔴 HIGH | Tablet bot control |
| `/dashboard/training` | 🟡 MEDIUM | Training interface |
| `/debug` | 🔴 CRITICAL | **Debug panel — NEVER PUBLIC** |
| `/desktop` | 🔴 HIGH | Desktop agent UI |
| `/docs/api` | 🟡 MEDIUM | API documentation |
| `/draft-aiy` | 🟡 MEDIUM | Draft AI tool |
| `/earnings` | 🔴 CRITICAL | **Financial earnings data** |
| `/galaxy` | 🟡 MEDIUM | Galaxy visualization |
| `/games/arena` | 🟡 MEDIUM | Games arena |
| `/games/chess` | 🟡 MEDIUM | Chess game |
| `/games/werewolf` | 🟡 MEDIUM | Werewolf game |
| `/github-fleet` | 🔴 HIGH | **GitHub repo fleet manager** |
| `/growth/leads` | 🔴 CRITICAL | **Lead database** |
| `/growth/networking` | 🔴 HIGH | Networking pipeline |
| `/growth/networking/campaigns` | 🔴 HIGH | **Campaign manager** |
| `/growth/networking/outreach` | 🔴 HIGH | **Outreach manager** |
| `/growth/networking/pipeline` | 🔴 HIGH | **Sales pipeline** |
| `/ide` | 🔴 HIGH | IDE interface |
| `/industries/[slug]` | 🟡 MEDIUM | Industry pages |
| `/lab` | 🔴 HIGH | Lab experiments |
| `/launchpad` | 🟡 MEDIUM | Launch pad |
| `/live-avatar` | 🟡 MEDIUM | Live avatar |
| `/live-build` | 🔴 HIGH | Live coding |
| `/mcp-servers` | 🔴 HIGH | **MCP server manager** |
| `/mission/airlock` | 🟡 MEDIUM | Mission airlock |
| `/mission/[...slug]` | 🟡 MEDIUM | Mission pages |
| `/my-agents` | 🔴 HIGH | Agent management |
| `/ops/command-center` | 🔴 CRITICAL | **Operations command center** |
| `/ops/fleet` | 🔴 CRITICAL | **Fleet operations** |
| `/ops/gpu-monitor` | 🔴 CRITICAL | **GPU monitoring** |
| `/ops/health` | 🔴 HIGH | Health monitoring |
| `/ops/mission-control` | 🔴 CRITICAL | **Mission control** |
| `/orchestration` | 🔴 HIGH | Agent orchestration |
| `/prime/dashboard` | 🔴 HIGH | Prime admin dashboard |
| `/qa-dashboard` | 🔴 HIGH | **QA dashboard** |
| `/rag-analysis` | 🔴 HIGH | RAG analysis |
| `/real-analysis` | 🔴 HIGH | Real analysis |
| `/reports` | 🔴 HIGH | **Reports — data exports** |
| `/security` | 🔴 HIGH | Security dashboard |
| `/self-builder` | 🟡 MEDIUM | Self-builder tool |
| `/self-builder/success` | 🟡 MEDIUM | Self-builder success |
| `/services/ran-copilot` | 🟡 MEDIUM | RAN Copilot |
| `/sic` | 🔴 HIGH | **SIC token economy** |
| `/status` | 🟡 MEDIUM | System status |
| `/swarm` | 🔴 HIGH | **Swarm orchestrator** |
| `/tool-hub` | 🟡 MEDIUM | Tool hub |
| `/tool-hub/orchestrator` | 🔴 HIGH | **Orchestrator panel** |
| `/unified-dashboard` | 🔴 CRITICAL | **Unified admin dashboard** |
| `/vision/*` | 🟡 MEDIUM | Vision tools (browser, humanoid, OCR) |
| `/workflows/*` | 🔴 HIGH | **Workflow automation** |

---

## 3. AMLAZR.COM — Route Audit (3 pages)

### 🔴 ALL INTERNAL — Admin-Only Access Required
| Route | Page | Status |
|---|---|---|
| `/` | AMLAZR Studio | Self-coding sandbox |
| `/dashboard` | Control Center | VPS/GPU/Agent management |
| `/analytics` | Analytics Command Center | 🟢 **NEW — WIRED THIS SESSION** |

---

## 4. ANALYTICS WIRING STATUS

### Data Sources Connected
| Source | Endpoint | Status |
|---|---|---|
| `analytics_pageviews` | Gateway `/data/analytics_pageviews` | 🟢 3,372 rows |
| `analytics_sessions` | Gateway `/data/analytics_sessions` | 🟢 322 rows |
| `analytics_daily_stats` | Gateway `/data/analytics_daily_stats` | 🟢 6 rows (backfilled) |
| `prime_leads_unified` | Gateway `/leads` | 🟢 9 leads |

### Domains Tracked
| Domain | Pageviews | Visitors | Bounce |
|---|---|---|---|
| yace19ai.com | 403 | 92 | 43.2% |
| prime-ai.fr | 112 | 53 | 45.5% |
| prime.com | 27 | 10 | 55.6% |

### Analytics Pages Wired
| App | Route | Gateway Source | Status |
|---|---|---|---|
| yace19ai.com | `/analytics` | Direct Supabase client | 🟢 |
| prime-ai.fr | `/analytics` | Direct Supabase client | 🟢 |
| amlazr.com | `/analytics` | VPS Gateway  `srv1307385.hstgr.cloud/gateway/` | 🟢 NEW |

---

## 5. CRITICAL RECOMMENDATIONS

### IMMEDIATE (Today)
1. **Block internal routes on yace19ai.com** — `/analytics`, `/crm`, `/costs`, `/agents`, `/extractor` should require auth or be removed from client routes
2. **Block `/debug` and `/earnings` on prime-ai.fr** — These expose sensitive data
3. **Protect `/admin`, `/ops/*`, `/unified-dashboard` on prime-ai.fr** — Admin pages accessible without proper gating
4. **amlazr.com should NEVER be publicly accessible** — it's a sovereign control plane

### SHORT-TERM (This Week)
5. Move all internal tools to a `/admin/*` prefix gated by auth
6. Add IP whitelist for amlazr.com (only your IPs)
7. Enable RLS on `extraction_jobs` and `extracted_items` (identified earlier)

---

## 6. EXECUTION PROOF

| Node | Status | Evidence |
|---|---|---|
| VPS Gateway (3011) | 🟢 | `curl https://srv1307385.hstgr.cloud/gateway/health` → `{"status":"healthy","tables":36}` |
| WebSearch MCP (3010) | 🟢 | `POST /mcp/mcp` → `web-search v1.2.0` |
| amlazr `/analytics` page | 🟢 | Next.js dev server confirmed on port 3050 |
| Daily stats backfill | 🟢 | 6 rows across 3 domains |
| Document embeddings | 🟢 | 56 documents indexed (blogs, FAQs, portfolio, services, pricing) |
| Cost tracking function | 🟢 | `log_ai_cost()` callable |
| Build request logging | 🟢 | `log_build_request()` callable |
| Prospect scorer | 🟢 | 2 prospects scored |
| Lead enrichment | 🟢 | 2 prospects enriched |
