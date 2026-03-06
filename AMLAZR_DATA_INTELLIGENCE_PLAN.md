# AMLAZR Data Intelligence Platform — Implementation Plan
## Date: 2026-02-24
## Status: 🟠 PLANNED — Awaiting Review

---

## VISION

Transform amlazr.com from an internal control panel into a **gated B2B data intelligence platform** that:
1. Collects anonymized behavioral analytics (zero PII)
2. Correlates data via Cognee 3D knowledge graph + agent memory
3. Exposes insights through agent-powered DeepSearch
4. Monetizes access via Stripe (EUR/USD) + crypto payments
5. Full EU AI Act 2026 + GDPR compliance

**Target Markets:** Paris 🇫🇷 · USA 🇺🇸 · Dubai 🇦🇪 · Japan 🇯🇵

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    amlazr.com (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   AUTH    │  │ANALYTICS │  │ DATA API │  │BILLING │  │
│  │ NextAuth │  │Dashboard │  │DeepSearch│  │ Stripe │  │
│  │ Gate     │  │ 3D Graph │  │  Agent   │  │+Crypto │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │              │             │      │
│  ┌────┴──────────────┴──────────────┴─────────────┴──┐  │
│  │              SUPABASE DATA LAKE                    │  │
│  │  analytics_pageviews | graph_nodes | agent_memory  │  │
│  │  document_embeddings | analytics_daily_stats       │  │
│  └──────────────┬────────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────┴────────────────────────────────────┐  │
│  │           VPS GATEWAY (31.97.52.22)                │  │
│  │  Supabase Gateway :3011 | WebSearch MCP :3010     │  │
│  │  Cognee Memory Sync | Agent DeepSearch Engine     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## PHASE 1: AUTH + GATED ACCESS (Day 1)
**Goal:** Lock down amlazr.com. No one enters without authentication.

### Tasks:
1. **Wire NextAuth** on amlazr-core with Supabase adapter
   - Email/password login (from existing `profiles` table)
   - Magic link option (via Supabase Auth)
   - GitHub OAuth (already configured in auth.config.ts)
   - Admin role check from `user_roles` table
   
2. **Protected routes middleware**
   - `middleware.ts` → ALL routes require session except `/auth/*`
   - Admin-only pages: `/dashboard`, `/analytics`, `/` (studio)
   - API routes: require API key or session

3. **API Key system**
   - Use existing `api_keys` table (2 keys already exist)
   - Add scoped keys: `analytics:read`, `data:query`, `graph:read`
   - Rate limiting from `rate_limits` table

### Files to create/modify:
- `src/middleware.ts` — Auth gate
- `src/app/auth/login/page.tsx` — Login page
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler

---

## PHASE 2: ANONYMIZED ANALYTICS ENGINE (Day 1-2)
**Goal:** Maximum behavioral data, zero PII. EU AI Act 2026 compliant.

### Data Collected (Anonymized):
| Data Point | Method | Storage |
|---|---|---|
| Page paths & navigation flow | JS tracker | `analytics_pageviews` |
| Session duration & bounce | Timer | `analytics_sessions` |
| Device/browser/OS | User-Agent parse | Aggregated only |
| Country/city (IP-derived) | GeoIP lookup | Country-level only, no IP stored |
| Referrer domains | Header parse | Domain only, no full URL |
| Click heatmaps | Event listener | Aggregated zones only |
| Scroll depth | Intersection Observer | Percentage only |
| Conversion funnels | Custom events | Anonymous session ID |
| Search queries (on-site) | Input capture | Anonymized, no user link |
| Feature usage patterns | Event tracking | Aggregated counts |

### What is NEVER Collected:
- ❌ IP addresses (hashed + discarded)
- ❌ Email addresses
- ❌ Names or identifiers
- ❌ Exact geolocation (city max, no GPS)
- ❌ Fingerprints or tracking across sites
- ❌ Personal browsing history
- ❌ Cookies for re-identification

### Compliance Framework:
| Regulation | Status |
|---|---|
| GDPR (EU) | ✅ No PII = no consent needed for analytics |
| EU AI Act 2026 | ✅ Transparent, no profiling, no automated decisions |
| CCPA (California) | ✅ No personal information collected |
| APPI (Japan) | ✅ No personal data processing |
| DIFC Data Protection (Dubai) | ✅ Anonymous data exempt |

### Correlation Engine:
- Cross-domain behavioral patterns (yace19ai.com + prime-ai.fr)
- Industry vertical detection from navigation patterns
- Tech stack inference from browser/device data
- Intent scoring from page sequence analysis
- Seasonal trend detection

---

## PHASE 3: COGNEE 3D KNOWLEDGE GRAPH (Day 2-3)
**Goal:** Wire Cognee memory into the analytics for 3D correlation visualization.

### Integration Points:
1. **Graph Nodes** (`graph_nodes` — 22 existing)
   - Each analytics insight becomes a node
   - Nodes: `industry_trend`, `geo_pattern`, `device_shift`, `conversion_signal`
   
2. **Graph Edges** (`graph_edges` — 30 existing)
   - Correlations between insights
   - Weighted edges by confidence score
   
3. **Agent Memory** (`agent_memory` — 693 entries)
   - Historical context for pattern recognition
   - Agent learns from data access patterns
   
4. **Document Embeddings** (`document_embeddings` — 56 docs)
   - Semantic search over all indexed content
   - Blog posts, FAQs, portfolio as context

### 3D Visualization:
- Three.js / React Three Fiber knowledge graph
- Nodes colored by type (analytics=blue, leads=green, agents=purple)
- Edge thickness = correlation strength
- Interactive: click node → drill into data
- Real-time updates via WebSocket

### Cognee Sync Pipeline:
```
Analytics Events → Aggregation → Pattern Detection →
  → Cognee Graph Nodes → Agent Memory Update →
    → DeepSearch Index → Queryable via Agent API
```

---

## PHASE 4: AGENT DEEPSEARCH (Day 3-4)
**Goal:** AI agent that queries the data lake and returns insights on demand.

### Agent Capabilities:
1. **Natural Language Query**
   - "What industries visited prime-ai.fr last week?"
   - "Show me conversion patterns from Dubai visitors"
   - "Which pages have the highest engagement in Japan?"
   
2. **Automated Insights**
   - Daily trend reports
   - Anomaly detection
   - Cross-domain correlation alerts
   
3. **Data Export API**
   - JSON/CSV export of anonymized datasets
   - Scheduled reports via webhook
   - Real-time streaming via SSE

### API Endpoints:
```
POST /api/deepsearch/query    — Natural language query
GET  /api/deepsearch/trends   — Auto-generated trend report
GET  /api/deepsearch/export   — Data export (gated by API key tier)
POST /api/deepsearch/subscribe — Webhook subscription for alerts
```

### Agent Stack:
- LLM: DeepSeek Chat via OpenRouter (free tier)
- Context: Cognee graph + Supabase data lake
- Memory: `agent_memory` table (persistent)
- Tools: SQL query, graph traversal, web search (MCP)

---

## PHASE 5: MONETIZATION — STRIPE + CRYPTO (Day 4-5)
**Goal:** B2B data access sold via Stripe (EUR/USD/AED/JPY) + crypto.

### Pricing Tiers:

| Tier | Price | Access | Target |
|---|---|---|---|
| **Explorer** | Free | 100 queries/mo, basic analytics, 7-day data | Startups |
| **Growth** | €99/mo | 10K queries/mo, DeepSearch, 90-day data, API key | SMBs |
| **Enterprise** | €499/mo | Unlimited, custom reports, webhook alerts, 365-day data | Agencies |
| **Sovereign** | €1,999/mo | Raw data export, dedicated agent, priority SLA, white-label | Enterprises |

### Crypto Payments:
- **Stellar** (XLM/USDC) — already in ecosystem
- **Stripe Crypto** — enabled via Stripe Connect
- On-chain proof of data access (non-PII receipt)

### Revenue Channels:
1. **Self-serve subscriptions** (Stripe Checkout)
2. **API metered billing** (Stripe Usage Records)
3. **One-time data reports** (Stripe Payment Links)
4. **Crypto top-up** (Stellar → internal credits)

### Geo-specific Payment Methods:
| Market | Methods |
|---|---|
| 🇫🇷 Paris | Stripe (Carte Bancaire, SEPA), crypto |
| 🇺🇸 USA | Stripe (ACH, cards), crypto |
| 🇦🇪 Dubai | Stripe (cards), crypto (USDC preferred) |
| 🇯🇵 Japan | Stripe (JCB, konbini), crypto |

---

## PHASE 6: MULTI-GEO ANALYTICS DASHBOARD (Day 5-6)
**Goal:** Premium dashboard showing data across Paris, US, Dubai, Japan.

### Dashboard Sections:
1. **Globe View** — 3D globe with real-time visitor dots
2. **Geo Heatmap** — Country/city-level engagement
3. **Market Comparison** — Side-by-side metrics per region
4. **Industry Vertical** — What sectors visit from each region
5. **Timing Analysis** — Peak hours by timezone
6. **Trend Correlation** — Cross-market pattern detection

### Timezone Intelligence:
- Paris: CET (UTC+1) → peak 9-18h
- New York: EST (UTC-5) → peak 9-17h
- Dubai: GST (UTC+4) → peak 8-16h
- Tokyo: JST (UTC+9) → peak 9-18h

---

## EXECUTION ORDER

| Phase | Priority | ETA | Dependencies |
|---|---|---|---|
| 1. Auth Gate | 🔴 CRITICAL | Day 1 | NextAuth + middleware |
| 2. Analytics Engine | 🔴 CRITICAL | Day 1-2 | Supabase + tracker |
| 3. Cognee 3D Graph | 🟡 HIGH | Day 2-3 | Phase 2 data |
| 4. Agent DeepSearch | 🟡 HIGH | Day 3-4 | Phase 3 graph |
| 5. Monetization | 🟡 HIGH | Day 4-5 | Phase 1 auth |
| 6. Multi-Geo Dashboard | 🟢 MEDIUM | Day 5-6 | Phase 2+3 |

---

## CONSTRAINTS

1. **No code pushed to yace19ai.com** — all work in amlazr-core
2. **Zero PII** — anonymous data only, EU AI Act 2026 compliant
3. **Free infrastructure** — uses existing VPS + Supabase (free tier)
4. **Revenue from Day 1** — Stripe checkout on Explorer→Sovereign tiers
5. **Multi-currency** — EUR, USD, AED, JPY + XLM/USDC crypto

---

## TRUTH COLOR

| Component | Color | Evidence |
|---|---|---|
| amlazr-core codebase | 🟢 | Next.js 16, builds locally |
| Supabase data lake | 🟢 | 36 tables, 56 embeddings, 3372 pageviews |
| VPS Gateway | 🟢 | Running on 3011, verified via HTTPS |
| WebSearch MCP | 🟢 | Running on 3010, verified via HTTPS |
| Auth system | 🟡 | auth.config.ts exists, needs wiring |
| Cognee graph | 🟡 | 22 nodes + 30 edges exist, needs 3D viz |
| Agent DeepSearch | 🟠 | Architecture designed, not implemented |
| Stripe billing | 🟠 | Stripe webhook route exists, needs tiers |
| Crypto payments | 🟠 | Stellar ecosystem available, not wired |
| Compliance docs | 🟠 | Framework defined, docs needed |
