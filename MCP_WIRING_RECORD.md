# MCP Wiring Record — Sovereign Fleet

**Date**: 2026-02-25T22:45:00+01:00  
**Config**: `~/.gemini/antigravity/mcp_config.json`  
**Status**: 🟢 Wired & Verified  
**Server Path**: `/Users/yacinebenhamou/DraftIAY/sovereign-fleet-mcp/src/index.js`

---

## Active MCP Servers (4 total)

| # | MCP Server | Command | Tools | Status |
|---|---|---|---|---|
| 1 | **Supabase** | `mcp-server-supabase` | ~25 (SQL, migrations, edge functions, branches, docs, types) | 🟢 Active |
| 2 | **GitHub** | `docker ghcr.io/github/github-mcp-server` | ~15 (repos, PRs, issues, commits, files) | 🟢 Active |
| 3 | **Perplexity** | `perplexity-mcp` | 3 (ask, reason, research) | 🟢 Active |
| 4 | **Sovereign Fleet v2.0** | `node sovereign-fleet-mcp/src/index.js` | **30** (see below) | 🟢 Verified |

**Total native tool count: ~73 tools across 4 MCP servers**

---

## Sovereign Fleet MCP v2.0 — Full Tool Inventory (30 tools)

### Agent Zero — Primary Autonomous Execution Unit (VPS systemd)
| Tool | Description |
|---|---|
| `agent_zero_send` | Send task/message to Agent Zero (qwen3:8b chat, qwen2.5:7b utility) |
| `agent_zero_status` | Check Agent Zero systemd service status |

### Ollama — Multi-Model Inference Gateway (VPS :11434)
| Tool | Description |
|---|---|
| `ollama_chat` | Chat completion (qwen3:8b, qwen2.5:7b, deepseek-r1:7b, **mistral:7b**) |
| `ollama_generate` | Raw text generation / code completion |
| `ollama_list_models` | List all loaded models |
| `ollama_pull_model` | Pull new models |
| `ollama_embed` | Generate 768-dim embeddings via nomic-embed-text |

### ByteBot — Browser Automation & RPA (VPS Docker 9990-9992)
| Tool | Description |
|---|---|
| `bytebot_execute` | Execute browser automation task |
| `bytebot_screenshot` | Take virtual desktop screenshot |
| `bytebot_status` | Check all ByteBot containers |

### ZeroClaw — Rust Sovereign Agent Framework (VPS /root/zeroclaw)
| Tool | Description |
|---|---|
| `zeroclaw_status` | Check source, crates, build state |
| `zeroclaw_build` | Compile from source (debug/release) |
| `zeroclaw_run` | Execute ZeroClaw commands |

### Kokoro TTS — Text-to-Speech (VPS Docker :8880)
| Tool | Description |
|---|---|
| `kokoro_tts` | OpenAI-compatible TTS generation |

### Voicebox — Voice Cloning & Generation (VPS :17493)
| Tool | Description |
|---|---|
| `voicebox_status` | Check FastAPI service status |
| `voicebox_generate` | Generate cloned voice audio |

### Sovereign Swarm — Cognee + Pipecat S2S Hub (VPS /root/sovereign_swarm)
| Tool | Description |
|---|---|
| `sovereign_swarm_status` | Check swarm components, logs |
| `sovereign_swarm_cognee` | Interact with Cognee knowledge graph (status/query/ingest) |

### Trellis Proxy — 3D Model Generation (VPS /root/trellis_proxy)
| Tool | Description |
|---|---|
| `trellis_status` | Check image-to-3D proxy status |

### n8n Workflows — Automation Engine (VPS Docker :5678)
| Tool | Description |
|---|---|
| `n8n_list_workflows` | List all workflows |
| `n8n_execute_workflow` | Trigger workflow by ID |

### VPS System — Full Infrastructure Control (SSH root@31.97.52.22)
| Tool | Description |
|---|---|
| `vps_exec` | Execute arbitrary shell command |
| `vps_service_control` | Manage systemd services |
| `vps_docker_control` | Manage Docker containers |
| `vps_disk_status` | Disk, RAM, swap monitoring |

### GPU Infrastructure
| Tool | Description |
|---|---|
| `gpu_status` | RTX 3090 tunnel + remote GPU health |

### Fleet Operations
| Tool | Description |
|---|---|
| `fleet_health` | Full 15-point health check with AMLAZR truth colors |
| `vercel_status` | Vercel deployment status |
| `github_status` | Git repo status/log/branches/remotes |

---

## VPS Service Map (31.97.52.22)

```
Port    Service              Type        Container/Process     MCP Tool
─────   ──────────────────   ─────────   ─────────────────     ──────────
80      Nginx                systemd     nginx                 vps_service_control
11434   Ollama               systemd     ollama                ollama_*
50080   Agent Zero UI        systemd     python (venv)         agent_zero_*
8080    Node process         process     node                  vps_exec
9000    Next.js app          process     next-server           vps_exec
8880    Kokoro TTS           docker      kokoro-tts            kokoro_tts
9990    ByteBot Desktop      docker      bytebot-desktop       bytebot_*
9991    ByteBot Agent        docker      bytebot-agent         bytebot_execute
9992    ByteBot UI           docker      bytebot-ui            bytebot_status
5678    n8n                  docker      n8n_prime_v2          n8n_*
6379    Redis                docker      redis                 vps_docker_control
17493   Voicebox             process     python uvicorn        voicebox_*
9191    Cloudflared          systemd     cloudflared-bytebot   vps_service_control
9193    Nginx (alt)          systemd     nginx                 vps_service_control
20001   GPU Tunnel (RTX3090) systemd     autossh               gpu_status
—       ZeroClaw             source      /root/zeroclaw        zeroclaw_*
—       Sovereign Swarm      source      /root/sovereign_swarm sovereign_swarm_*
—       Trellis Proxy        source      /root/trellis_proxy   trellis_status
```

## Ollama Models (5 loaded)
| Model | Params | Family | Quant | Size |
|---|---|---|---|---|
| qwen3:8b | 8.2B | qwen3 | Q4_K_M | 5.2 GB |
| qwen2.5:7b | 7.6B | qwen2 | Q4_K_M | 4.7 GB |
| deepseek-r1:7b | 7.6B | qwen2 | Q4_K_M | 4.7 GB |
| **mistral:7b** | 7.2B | mistral | Q4_0 | 4.4 GB |
| nomic-embed-text | 137M | nomic-bert | F16 | 0.27 GB |

## Docker Images on VPS
| Image | Size |
|---|---|
| ghcr.io/remsky/kokoro-fastapi-cpu | 7.79 GB |
| ghcr.io/bytebot-ai/bytebot-desktop | 6.1 GB |
| ghcr.io/bytebot-ai/bytebot-ui | 2.08 GB |
| n8nio/n8n | 1.73 GB |
| ghcr.io/bytebot-ai/bytebot-agent | 1.43 GB |
| postgres:16-alpine | 395 MB |
| sovereign-bytebot-llm-proxy | 92.6 MB |
| redis:7-alpine | 61.2 MB |

## ⚠️ Critical: VPS Disk at 97% (3.4GB free / 96GB)
Cleaned on Feb 25. Ollama models consume 18GB. Docker images consume ~20GB.

---

## Activation Checklist

### ✅ Completed
- [x] Sovereign Fleet MCP Server v2.0 built and tested (30 tools)
- [x] Wired into `~/.gemini/antigravity/mcp_config.json`
- [x] Mistral 7B pulled on Ollama VPS
- [x] VPS disk cleaned (160MB → 3.4GB free)
- [x] All VPS services inventoried and mapped to MCP tools

### 🔲 Requires IDE Restart
- [ ] Restart Antigravity/IDE to load sovereign-fleet-mcp

### 🔲 Future Expansion
- [ ] Wire Cline/Roo-Cline MCP settings (currently empty)
- [ ] Add video model tools (CogVideoX — needs GPU)
- [ ] Add Cognee REST API when activated
- [ ] Add Vast.ai CLI wrapper for GPU provisioning
- [ ] Add Langfuse observability tools

---

*Record created: 2026-02-25T22:45:00+01:00*  
*Last updated: 2026-02-25T22:45:00+01:00*  
*Will be updated each time new MCP servers or tools are added.*
