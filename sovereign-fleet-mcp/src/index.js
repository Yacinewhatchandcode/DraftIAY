#!/usr/bin/env node

/**
 * Sovereign Fleet MCP Server v2.0.0
 * 
 * Unified MCP gateway for the entire AMLAZR agent fleet.
 * 
 * AGENTS & SERVICES WIRED:
 *   - Agent Zero (VPS systemd, port 50080) — qwen3:8b chat + qwen2.5:7b utility
 *   - Ollama (VPS 11434) — qwen3:8b, qwen2.5:7b, deepseek-r1:7b, mistral:7b, nomic-embed
 *   - ByteBot Desktop/Agent/UI (VPS Docker 9990/9991/9992) — RPA/browser automation
 *   - Kokoro TTS (VPS Docker 8880) — text-to-speech
 *   - Voicebox (VPS port 17493) — voice cloning + generation
 *   - ZeroClaw (VPS /root/zeroclaw) — Rust-based sovereign agent
 *   - Sovereign Swarm (VPS /root/sovereign_swarm) — Cognee + Pipecat S2S hub
 *   - Trellis Proxy (VPS /root/trellis_proxy) — 3D model generation
 *   - n8n Workflows (VPS Docker 5678) — workflow automation
 *   - VPS System (SSH root@31.97.52.22) — full system control
 *   - GPU Tunnel (RTX 3090 via autossh) — remote GPU inference
 *   - Vercel (CLI) — deployment management
 *   - GitHub (CLI) — repository management
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const VPS_HOST = process.env.VPS_HOST || "72.62.24.13";
const VPS_USER = process.env.VPS_USER || "root";
const SSH_TIMEOUT = process.env.SSH_TIMEOUT || "10";
const IMAC_HOST = process.env.IMAC_HOST || "192.168.1.186";
const IMAC_PORT = process.env.IMAC_PORT || "5557";
const IMAC_BASE_URL = `http://${IMAC_HOST}:${IMAC_PORT}`;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function sshExec(command, timeoutSec = 30) {
    const { stdout, stderr } = await execAsync(
        `ssh -o ConnectTimeout=${SSH_TIMEOUT} -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "${command.replace(/"/g, '\\"')}"`,
        { timeout: timeoutSec * 1000, maxBuffer: 10 * 1024 * 1024 }
    );
    return { stdout: stdout.trim(), stderr: stderr.trim() };
}

async function httpFetch(url, options = {}) {
    const { method = "GET", body, headers = {}, timeoutMs = 60000 } = options;
    const fetchOpts = { method, headers: { "Content-Type": "application/json", ...headers }, signal: AbortSignal.timeout(timeoutMs) };
    if (body) fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
    const resp = await fetch(url, fetchOpts);
    const text = await resp.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }
    return { status: resp.status, ok: resp.ok, body: json || text };
}

async function localExec(command, timeoutSec = 30) {
    const { stdout, stderr } = await execAsync(command, { timeout: timeoutSec * 1000, maxBuffer: 10 * 1024 * 1024 });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
}

// ─── Tool Definitions ───────────────────────────────────────────────────────

const TOOLS = [
    // ══════════════════════════════════════════════════════════════════════════
    // AGENT ZERO — Primary Autonomous Execution Unit
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "agent_zero_send",
        description: "Send a message/task to Agent Zero on the VPS. Agent Zero uses qwen3:8b for chat and qwen2.5:7b for utility tasks. Returns the agent's response.",
        inputSchema: {
            type: "object",
            properties: {
                message: { type: "string", description: "The task or message to send to Agent Zero" },
            },
            required: ["message"],
        },
    },
    {
        name: "agent_zero_status",
        description: "Check the status of Agent Zero service on the VPS (systemd status, port health, model info).",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // OLLAMA — Multi-Model Inference Gateway
    // Models: qwen3:8b, qwen2.5:7b, deepseek-r1:7b, mistral:7b, nomic-embed-text
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "ollama_chat",
        description: "Send a chat completion request to Ollama on the VPS. Available models: qwen3:8b, qwen2.5:7b, deepseek-r1:7b, mistral:7b. Supports streaming=false.",
        inputSchema: {
            type: "object",
            properties: {
                model: { type: "string", description: "Model name (qwen3:8b, qwen2.5:7b, deepseek-r1:7b, mistral:7b)", default: "qwen3:8b" },
                messages: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            role: { type: "string", enum: ["system", "user", "assistant"] },
                            content: { type: "string" },
                        },
                        required: ["role", "content"],
                    },
                    description: "Chat messages array",
                },
                temperature: { type: "number", description: "Temperature (0-2)", default: 0.7 },
            },
            required: ["messages"],
        },
    },
    {
        name: "ollama_list_models",
        description: "List all models available on Ollama (VPS), including qwen3:8b, qwen2.5:7b, deepseek-r1:7b, mistral:7b, nomic-embed-text.",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "ollama_pull_model",
        description: "Pull/download a new model to Ollama on the VPS. Use for installing new models like codellama, llama3, phi3, etc.",
        inputSchema: {
            type: "object",
            properties: {
                model: { type: "string", description: "Model name to pull (e.g., codellama:13b, llama3:8b, phi3:mini)" },
            },
            required: ["model"],
        },
    },
    {
        name: "ollama_embed",
        description: "Generate embeddings using nomic-embed-text on the VPS Ollama instance. 768-dim vectors.",
        inputSchema: {
            type: "object",
            properties: {
                input: { type: "string", description: "Text to embed" },
                model: { type: "string", description: "Embedding model", default: "nomic-embed-text" },
            },
            required: ["input"],
        },
    },
    {
        name: "ollama_generate",
        description: "Raw text generation (non-chat) using Ollama. Good for code generation, completions, and structured output.",
        inputSchema: {
            type: "object",
            properties: {
                model: { type: "string", description: "Model name", default: "mistral:7b" },
                prompt: { type: "string", description: "The prompt to generate from" },
                system: { type: "string", description: "Optional system prompt" },
                temperature: { type: "number", description: "Temperature", default: 0.7 },
            },
            required: ["prompt"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // BYTEBOT — Browser Automation & RPA
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "bytebot_execute",
        description: "Execute a browser automation task via ByteBot Agent API on the VPS (port 9991). ByteBot runs a virtual desktop with Chrome for RPA/scraping.",
        inputSchema: {
            type: "object",
            properties: {
                task: { type: "string", description: "The automation task to execute" },
                url: { type: "string", description: "Optional URL to navigate to first" },
            },
            required: ["task"],
        },
    },
    {
        name: "bytebot_screenshot",
        description: "Take a screenshot of ByteBot's virtual desktop (port 9990).",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "bytebot_status",
        description: "Check ByteBot container status (desktop, agent, UI, postgres).",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // ZEROCLAW — Rust-based Sovereign Agent Framework
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "zeroclaw_status",
        description: "Check ZeroClaw (Rust sovereign agent) status on the VPS. Inspects build state, running processes, and available crates.",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "zeroclaw_build",
        description: "Build ZeroClaw MCP server from source on the VPS (/root/zeroclaw-mcp). Compiles the Rust sovereign orchestration hub.",
        inputSchema: {
            type: "object",
            properties: {
                release: { type: "boolean", description: "Build in release mode", default: true },
            },
        },
    },
    {
        name: "zeroclaw_run",
        description: "Run a ZeroClaw command or script on the VPS.",
        inputSchema: {
            type: "object",
            properties: {
                command: { type: "string", description: "Command to run within zeroclaw context" },
            },
            required: ["command"],
        },
    },
    {
        name: "zeroclaw_mcp_call",
        description: "Call any tool on the ZeroClaw MCP Server (port 9999) directly. This is the Rust sovereign orchestration hub that routes to ALL agents. Use this for complex multi-agent tasks.",
        inputSchema: {
            type: "object",
            properties: {
                tool: { type: "string", description: "Tool name to call on ZeroClaw MCP (fleet_health, agent_zero_chat, agent_zero_task, cognee_ingest, cognee_query, cognee_sync_gdrive, ollama_chat, ollama_embed, ollama_models, bytebot_task, bytebot_screenshot, bytebot_list_tasks, n8n_trigger, n8n_list_workflows, voicebox_generate, voicebox_profiles, kokoro_speak, swarm_s2s_status, sim_status, xsystem_dispatch, zeroclaw_run_skill)" },
                args: { type: "object", description: "Arguments for the tool" },
            },
            required: ["tool"],
        },
    },
    {
        name: "xsystem_dispatch",
        description: "X-System: Intelligent cross-agent task dispatcher. Automatically routes tasks to the best agent (Agent Zero, Cognee, ByteBot, Ollama, n8n, Voicebox) based on intent analysis. The master orchestration layer.",
        inputSchema: {
            type: "object",
            properties: {
                task: { type: "string", description: "The task or question to route to the appropriate sovereign agent" },
                context: { type: "string", description: "Optional context/background information" },
            },
            required: ["task"],
        },
    },
    {
        name: "zeroclaw_skill",
        description: "Execute a ZeroClaw sovereign skill: code_gen, web_search, data_extract, send_slack, send_email, speak, remember, think. Each skill orchestrates the appropriate fleet agent.",
        inputSchema: {
            type: "object",
            properties: {
                skill: { type: "string", enum: ["code_gen", "web_search", "data_extract", "send_slack", "send_email", "speak", "remember", "think"], description: "Skill to execute" },
                input: { type: "string", description: "Input for the skill" },
            },
            required: ["skill", "input"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SIM — Multi-Agent Workflow Builder (Port 3014)
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "sim_status",
        description: "Check Sim multi-agent visual workflow builder status (VPS port 3014). Sim lets you design AI pipelines visually.",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // KOKORO TTS — Text-to-Speech
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "kokoro_tts",
        description: "Generate speech audio using Kokoro TTS on the VPS (Docker port 8880). OpenAI-compatible TTS API.",
        inputSchema: {
            type: "object",
            properties: {
                text: { type: "string", description: "Text to convert to speech" },
                voice: { type: "string", description: "Voice ID to use", default: "af_default" },
                speed: { type: "number", description: "Speed (0.5-2.0)", default: 1.0 },
            },
            required: ["text"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // VOICEBOX — Voice Cloning & Generation (Port 17493)
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "voicebox_status",
        description: "Check Voicebox voice cloning service status (VPS port 17493). FastAPI backend for voice cloning and generation.",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "voicebox_generate",
        description: "Generate voice audio using Voicebox on the VPS (port 17493).",
        inputSchema: {
            type: "object",
            properties: {
                text: { type: "string", description: "Text to synthesize" },
                voice_id: { type: "string", description: "Voice ID to use for cloning" },
            },
            required: ["text"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SOVEREIGN SWARM — Cognee + Pipecat S2S Hub
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "sovereign_swarm_status",
        description: "Check Sovereign Swarm status (Cognee knowledge graph + Pipecat S2S hub) on the VPS.",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "sovereign_swarm_cognee",
        description: "Interact with the Cognee knowledge graph node in the Sovereign Swarm on the VPS.",
        inputSchema: {
            type: "object",
            properties: {
                action: { type: "string", enum: ["status", "query", "ingest"], description: "Action to perform on Cognee" },
                data: { type: "string", description: "Query string or data to ingest" },
            },
            required: ["action"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // TRELLIS PROXY — 3D Model Generation
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "trellis_status",
        description: "Check Trellis 3D proxy status on the VPS (/root/trellis_proxy). Supports image-to-3D model generation.",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // N8N WORKFLOWS — Automation Engine
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "n8n_list_workflows",
        description: "List all workflows on n8n (VPS Docker port 5678).",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "n8n_execute_workflow",
        description: "Trigger/execute a specific n8n workflow by ID.",
        inputSchema: {
            type: "object",
            properties: {
                workflow_id: { type: "string", description: "The workflow ID to execute" },
                data: { type: "object", description: "Optional input data for the workflow" },
            },
            required: ["workflow_id"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // VPS SYSTEM — Full Infrastructure Control
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "vps_exec",
        description: "Execute an arbitrary command on the VPS (31.97.52.22) via SSH. Use for system administration, service management, file operations, etc.",
        inputSchema: {
            type: "object",
            properties: {
                command: { type: "string", description: "Shell command to execute on the VPS" },
                timeout: { type: "number", description: "Timeout in seconds", default: 30 },
            },
            required: ["command"],
        },
    },
    {
        name: "vps_service_control",
        description: "Start, stop, restart, or check status of a systemd service on the VPS. Known services: agent-zero, ollama, cloudflared-bytebot, ollama-proxy, gpu-ollama-tunnel, nginx.",
        inputSchema: {
            type: "object",
            properties: {
                service: { type: "string", description: "Service name" },
                action: { type: "string", enum: ["start", "stop", "restart", "status"], description: "Action to perform" },
            },
            required: ["service", "action"],
        },
    },
    {
        name: "vps_docker_control",
        description: "Manage Docker containers on the VPS. Containers: kokoro-tts, bytebot-ui, bytebot-agent, bytebot-desktop, bytebot-postgres, n8n_prime_v2, llm-proxy, redis, langfuse-db.",
        inputSchema: {
            type: "object",
            properties: {
                container: { type: "string", description: "Container name" },
                action: { type: "string", enum: ["list", "start", "stop", "restart", "logs"], description: "Action to perform" },
                tail: { type: "number", description: "Number of log lines to return (for logs action)", default: 50 },
            },
            required: ["action"],
        },
    },
    {
        name: "vps_disk_status",
        description: "Check VPS disk usage, RAM, and swap. Critical for monitoring — disk was at 100% as of Feb 25, 2026.",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // GPU INFRASTRUCTURE
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "gpu_status",
        description: "Check GPU infrastructure status — RTX 3090 tunnel health via autossh, remote GPU model availability.",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // FLEET HEALTH — Comprehensive Status Matrix
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "fleet_health",
        description: "Run a comprehensive health check across ALL sovereign fleet agents: Ollama, Agent Zero, ByteBot, ZeroClaw, Kokoro TTS, Voicebox, Sovereign Swarm, n8n, Docker, GPU tunnel. Returns a full status matrix with AMLAZR truth colors (🟢🟡🔴⚫).",
        inputSchema: { type: "object", properties: {} },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // VERCEL — Deployment Management
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "vercel_status",
        description: "Check Vercel deployment status for projects. Uses Vercel CLI.",
        inputSchema: {
            type: "object",
            properties: {
                project: { type: "string", description: "Optional project name to check" },
            },
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // GITHUB — Repository Management
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "github_status",
        description: "Check GitHub repository status, recent commits, branches, remotes. Uses git CLI.",
        inputSchema: {
            type: "object",
            properties: {
                repo_path: { type: "string", description: "Local path to the git repository" },
                action: { type: "string", enum: ["status", "log", "branches", "remotes"], description: "What info to retrieve", default: "status" },
            },
            required: ["repo_path"],
        },
    },
    // IMAC ANTI-GRAVITY AGENT — Direct Physical Control
    // ══════════════════════════════════════════════════════════════════════════
    {
        name: "imac_status",
        description: "Check whether the iMac AntiGravity control agent is reachable before sending input or commands.",
        inputSchema: { type: "object", properties: {} }
    },
    {
        name: "imac_click",
        description: "Click the mouse at specific physical coordinates on the iMac Windows screen.",
        inputSchema: {
            type: "object",
            properties: {
                x: { type: "number", description: "X coordinate (optional, clicks current if omitted)" },
                y: { type: "number", description: "Y coordinate (optional)" },
                button: { type: "string", description: "Mouse button", default: "left" },
                clicks: { type: "number", description: "Number of clicks", default: 1 }
            }
        }
    },
    {
        name: "imac_type",
        description: "Type physical keystrokes on the iMac Windows screen.",
        inputSchema: {
            type: "object",
            properties: {
                text: { type: "string", description: "Text to type" },
                interval: { type: "number", description: "Seconds between strokes", default: 0.0 }
            },
            required: ["text"]
        }
    },
    {
        name: "imac_hotkey",
        description: "Press a combination of keys simultaneously on the iMac (e.g., ['ctrl', 'c'], ['win', 'r']).",
        inputSchema: {
            type: "object",
            properties: {
                keys: { type: "array", items: { type: "string" }, description: "Array of keys to press together" }
            },
            required: ["keys"]
        }
    },
    {
        name: "imac_execute",
        description: "Execute a raw shell command on the iMac via PowerShell/CMD (background execution via AntiGravity).",
        inputSchema: {
            type: "object",
            properties: {
                command: { type: "string", description: "Command to execute (e.g., 'start msedge')" }
            },
            required: ["command"]
        }
    }
];

// ─── Tool Handlers ──────────────────────────────────────────────────────────

async function handleTool(name, args) {
    switch (name) {
        // ── Agent Zero ──
        case "agent_zero_send": {
            try {
                const result = await sshExec(`curl -s -X POST http://localhost:50080/api/message -H 'Content-Type: application/json' -d '${JSON.stringify({ message: args.message }).replace(/'/g, "'\\''")}'`, 60);
                return result.stdout || result.stderr || "No response from Agent Zero";
            } catch (e) {
                return `Agent Zero error: ${e.message}`;
            }
        }

        case "agent_zero_status": {
            try {
                const result = await sshExec("systemctl is-active agent-zero.service && echo PORT: && ss -tlnp | grep 50080 && echo UPTIME: && systemctl show agent-zero.service --property=ActiveEnterTimestamp");
                return result.stdout;
            } catch (e) {
                return `Agent Zero status error: ${e.message}`;
            }
        }

        // ── Ollama ──
        case "ollama_chat": {
            const model = args.model || "qwen3:8b";
            const payload = { model, messages: args.messages, stream: false, options: { temperature: args.temperature || 0.7 } };
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:11434/api/chat`, { method: "POST", body: payload, timeoutMs: 120000 });
                if (resp.ok && resp.body?.message) {
                    return JSON.stringify({ model, response: resp.body.message.content, eval_count: resp.body.eval_count, total_duration: resp.body.total_duration });
                }
                return JSON.stringify(resp.body);
            } catch (e) {
                return `Ollama chat error: ${e.message}`;
            }
        }

        case "ollama_list_models": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:11434/api/tags`);
                if (resp.ok && resp.body?.models) {
                    return JSON.stringify(resp.body.models.map(m => ({
                        name: m.name,
                        size_gb: (m.size / 1e9).toFixed(2),
                        family: m.details?.family,
                        params: m.details?.parameter_size,
                        quantization: m.details?.quantization_level,
                    })), null, 2);
                }
                return JSON.stringify(resp.body);
            } catch (e) {
                return `Ollama list error: ${e.message}`;
            }
        }

        case "ollama_pull_model": {
            try {
                const result = await sshExec(`ollama pull ${args.model}`, 600);
                return result.stdout || result.stderr;
            } catch (e) {
                return `Ollama pull error: ${e.message}`;
            }
        }

        case "ollama_embed": {
            const model = args.model || "nomic-embed-text";
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:11434/api/embed`, { method: "POST", body: { model, input: args.input } });
                if (resp.ok) {
                    const dims = resp.body?.embeddings?.[0]?.length || 0;
                    return JSON.stringify({ model, dimensions: dims, preview: resp.body?.embeddings?.[0]?.slice(0, 10) });
                }
                return JSON.stringify(resp.body);
            } catch (e) {
                return `Ollama embed error: ${e.message}`;
            }
        }

        case "ollama_generate": {
            const model = args.model || "mistral:7b";
            const payload = { model, prompt: args.prompt, stream: false, options: { temperature: args.temperature || 0.7 } };
            if (args.system) payload.system = args.system;
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:11434/api/generate`, { method: "POST", body: payload, timeoutMs: 120000 });
                if (resp.ok && resp.body?.response) {
                    return JSON.stringify({ model, response: resp.body.response, eval_count: resp.body.eval_count, total_duration: resp.body.total_duration });
                }
                return JSON.stringify(resp.body);
            } catch (e) {
                return `Ollama generate error: ${e.message}`;
            }
        }

        // ── ByteBot ──
        case "bytebot_execute": {
            try {
                const payload = { task: args.task };
                if (args.url) payload.url = args.url;
                const resp = await httpFetch(`http://${VPS_HOST}:9991/api/execute`, { method: "POST", body: payload });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `ByteBot execute error: ${e.message}`;
            }
        }

        case "bytebot_screenshot": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:9991/api/screenshot`);
                return JSON.stringify({ status: resp.status, body: typeof resp.body === "string" ? resp.body.slice(0, 200) + "..." : resp.body });
            } catch (e) {
                return `ByteBot screenshot error: ${e.message}`;
            }
        }

        case "bytebot_status": {
            try {
                const result = await sshExec("docker ps --filter 'name=bytebot' --format '{{.Names}}\\t{{.Status}}\\t{{.Ports}}'");
                return result.stdout;
            } catch (e) {
                return `ByteBot status error: ${e.message}`;
            }
        }

        // ── ZeroClaw ──
        case "zeroclaw_status": {
            try {
                const mcp = await httpFetch(`http://${VPS_HOST}:9999/health`, { timeoutMs: 3000 }).catch(() => ({ ok: false, body: "offline" }));
                const buildLog = await sshExec("tail -5 /tmp/zc-build.log 2>/dev/null || echo 'No build log'");
                const bin = await sshExec("ls -la /root/zeroclaw-mcp/target/release/zeroclaw-mcp 2>/dev/null || echo 'Not built yet'");
                return JSON.stringify({
                    mcp_server: mcp.ok ? "🟢 online" : "🔴 offline",
                    mcp_health: mcp.ok ? mcp.body : null,
                    binary: bin.stdout,
                    build_log: buildLog.stdout,
                }, null, 2);
            } catch (e) {
                return `ZeroClaw status error: ${e.message}`;
            }
        }

        case "zeroclaw_build": {
            try {
                const mode = args.release !== false ? "--release" : "";
                // Build zeroclaw-mcp (the MCP orchestration server)
                const result = await sshExec(`cd /root/zeroclaw-mcp && /root/.cargo/bin/cargo build ${mode} 2>&1 | tail -20`, 300);
                return result.stdout || result.stderr;
            } catch (e) {
                return `ZeroClaw build error: ${e.message}`;
            }
        }

        case "zeroclaw_run": {
            try {
                const result = await sshExec(`cd /root/zeroclaw-mcp && ${args.command}`, 60);
                return result.stdout || result.stderr;
            } catch (e) {
                return `ZeroClaw run error: ${e.message}`;
            }
        }

        case "zeroclaw_mcp_call": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:9999/mcp`, {
                    method: "POST",
                    body: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: args.tool, arguments: args.args || {} } },
                    timeoutMs: 120000,
                });
                return JSON.stringify(resp.body, null, 2);
            } catch (e) {
                return `ZeroClaw MCP call error: ${e.message}`;
            }
        }

        case "xsystem_dispatch": {
            // Intelligent routing: if ZeroClaw MCP is online, use it; otherwise route locally
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:9999/mcp`, {
                    method: "POST",
                    body: {
                        jsonrpc: "2.0", id: 1, method: "tools/call",
                        params: { name: "xsystem_dispatch", arguments: { task: args.task, context: args.context || "" } }
                    },
                    timeoutMs: 90000,
                });
                if (resp.ok) return JSON.stringify(resp.body, null, 2);
                // Fallback: local routing
                const tl = (args.task || "").toLowerCase();
                const agent = tl.includes("memory") || tl.includes("recall") ? "cognee" :
                    tl.includes("browse") || tl.includes("click") || tl.includes("scrape") ? "bytebot" :
                        tl.includes("workflow") || tl.includes("n8n") ? "n8n" :
                            tl.includes("speak") || tl.includes("voice") ? "kokoro" : "agent_zero";
                return JSON.stringify({ routing: { agent, fallback: true }, task: args.task });
            } catch (e) {
                return `X-System dispatch error: ${e.message}`;
            }
        }

        case "zeroclaw_skill": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:9999/mcp`, {
                    method: "POST",
                    body: {
                        jsonrpc: "2.0", id: 1, method: "tools/call",
                        params: { name: "zeroclaw_run_skill", arguments: { skill: args.skill, input: args.input } }
                    },
                    timeoutMs: 120000,
                });
                return JSON.stringify(resp.body, null, 2);
            } catch (e) {
                return `ZeroClaw skill error: ${e.message}`;
            }
        }

        // ── Sim Workflow Builder ──
        case "sim_status": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:3014/api/health`, { timeoutMs: 4000 });
                const proc = await sshExec("ps aux | grep 'bun.*sim' | grep -v grep | head -2");
                return JSON.stringify({ api: resp.ok ? "🟢 online" : "🔴 offline", status: resp.body, process: proc.stdout }, null, 2);
            } catch (e) {
                return `Sim status error: ${e.message}`;
            }
        }

        // ── Kokoro TTS ──
        case "kokoro_tts": {
            try {
                const payload = { text: args.text, voice: args.voice || "af_default", speed: args.speed || 1.0 };
                const resp = await httpFetch(`http://${VPS_HOST}:8880/v1/audio/speech`, { method: "POST", body: payload });
                return JSON.stringify({ status: resp.status, ok: resp.ok, body: typeof resp.body === "string" ? resp.body.slice(0, 500) : "Audio data generated" });
            } catch (e) {
                return `Kokoro TTS error: ${e.message}`;
            }
        }

        // ── Voicebox ──
        case "voicebox_status": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:17493/docs`, { timeoutMs: 10000 });
                const proc = await sshExec("ps aux | grep voicebox | grep -v grep | head -3");
                return JSON.stringify({ api_status: resp.status, api_ok: resp.ok, process: proc.stdout });
            } catch (e) {
                return `Voicebox status error: ${e.message}`;
            }
        }

        case "voicebox_generate": {
            try {
                const payload = { text: args.text };
                if (args.voice_id) payload.voice_id = args.voice_id;
                const resp = await httpFetch(`http://${VPS_HOST}:17493/api/generate`, { method: "POST", body: payload });
                return JSON.stringify({ status: resp.status, body: typeof resp.body === "string" ? resp.body.slice(0, 500) : resp.body });
            } catch (e) {
                return `Voicebox generate error: ${e.message}`;
            }
        }

        // ── Sovereign Swarm ──
        case "sovereign_swarm_status": {
            try {
                const result = await sshExec("ls /root/sovereign_swarm/ && echo '=== VENV ===' && ls /root/sovereign_swarm/venv/bin/python 2>/dev/null && echo '=== LOGS ===' && tail -20 /root/sovereign_swarm/uvicorn.log 2>/dev/null && tail -20 /root/sovereign_swarm/pipecat.log 2>/dev/null");
                return result.stdout;
            } catch (e) {
                return `Sovereign Swarm status error: ${e.message}`;
            }
        }

        case "sovereign_swarm_cognee": {
            try {
                if (args.action === "status") {
                    const result = await sshExec("cat /root/sovereign_swarm/cognee_node.py | head -30 && echo '=== RUNNING ===' && ps aux | grep cognee | grep -v grep");
                    return result.stdout;
                } else if (args.action === "query") {
                    const result = await sshExec(`cd /root/sovereign_swarm && /root/sovereign_swarm/venv/bin/python -c "from cognee_node import *; print('Cognee imported')" 2>&1`);
                    return result.stdout || result.stderr;
                } else if (args.action === "ingest") {
                    return "Cognee ingest: requires specific data pipeline activation. Use sovereign_swarm_status to check readiness.";
                }
                return "Unknown action";
            } catch (e) {
                return `Cognee error: ${e.message}`;
            }
        }

        // ── Trellis Proxy ──
        case "trellis_status": {
            try {
                const result = await sshExec("ls /root/trellis_proxy/ && cat /root/trellis_proxy/package.json | head -10 && echo '=== PROCESS ===' && ps aux | grep trellis | grep -v grep");
                return result.stdout;
            } catch (e) {
                return `Trellis status error: ${e.message}`;
            }
        }

        // ── n8n ──
        case "n8n_list_workflows": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:5678/api/v1/workflows`, { headers: { Accept: "application/json" } });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `n8n error: ${e.message}`;
            }
        }

        case "n8n_execute_workflow": {
            try {
                const resp = await httpFetch(`http://${VPS_HOST}:5678/api/v1/workflows/${args.workflow_id}/execute`, {
                    method: "POST",
                    body: args.data || {},
                });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `n8n execute error: ${e.message}`;
            }
        }

        // ── VPS System ──
        case "vps_exec": {
            try {
                const result = await sshExec(args.command, args.timeout || 30);
                return result.stdout + (result.stderr ? `\nSTDERR: ${result.stderr}` : "");
            } catch (e) {
                return `VPS exec error: ${e.message}`;
            }
        }

        case "vps_service_control": {
            try {
                const cmd = args.action === "status"
                    ? `systemctl status ${args.service} --no-pager -l`
                    : `systemctl ${args.action} ${args.service} && echo 'OK: ${args.action} ${args.service}'`;
                const result = await sshExec(cmd, 15);
                return result.stdout + (result.stderr ? `\n${result.stderr}` : "");
            } catch (e) {
                return `Service control error: ${e.message}`;
            }
        }

        case "vps_docker_control": {
            try {
                let cmd;
                if (args.action === "list") {
                    cmd = "docker ps --format '{{.Names}}\\t{{.Status}}\\t{{.Ports}}'";
                } else if (args.action === "logs") {
                    cmd = `docker logs --tail ${args.tail || 50} ${args.container} 2>&1`;
                } else {
                    cmd = `docker ${args.action} ${args.container} && echo 'OK: ${args.action} ${args.container}'`;
                }
                const result = await sshExec(cmd, 20);
                return result.stdout;
            } catch (e) {
                return `Docker control error: ${e.message}`;
            }
        }

        case "vps_disk_status": {
            try {
                const result = await sshExec("df -h / && echo '=== RAM ===' && free -h && echo '=== SWAP ===' && swapon --show && echo '=== DOCKER ===' && docker system df 2>/dev/null | head -5", 15);
                return result.stdout;
            } catch (e) {
                return `Disk status error: ${e.message}`;
            }
        }

        // ── GPU ──
        case "gpu_status": {
            try {
                const tunnel = await sshExec("systemctl is-active gpu-ollama-tunnel.service && ss -tlnp | grep 20001");
                const gpuModels = await sshExec("curl -s http://localhost:20001/api/tags 2>/dev/null || echo 'GPU tunnel not forwarding'");
                return `GPU Tunnel: ${tunnel.stdout}\nGPU Models: ${gpuModels.stdout}`;
            } catch (e) {
                return `GPU status error: ${e.message}`;
            }
        }

        // ── Fleet Health ──
        case "fleet_health": {
            const checks = [];
            const check = async (name, fn) => {
                try {
                    const result = await fn();
                    checks.push({ name, status: "🟢", detail: result });
                } catch (e) {
                    checks.push({ name, status: "🔴", detail: e.message });
                }
            };

            await Promise.allSettled([
                check("Ollama", async () => {
                    const r = await httpFetch(`http://${VPS_HOST}:11434/api/tags`);
                    return `${r.body?.models?.length || 0} models loaded`;
                }),
                check("Agent Zero", async () => {
                    const r = await sshExec("systemctl is-active agent-zero.service", 10);
                    return r.stdout;
                }),
                check("ByteBot Desktop", async () => {
                    const r = await sshExec("docker inspect --format='{{.State.Status}}' bytebot-desktop", 10);
                    return r.stdout;
                }),
                check("ByteBot Agent", async () => {
                    const r = await sshExec("docker inspect --format='{{.State.Status}}' bytebot-agent", 10);
                    return r.stdout;
                }),
                check("ZeroClaw", async () => {
                    const r = await sshExec("ls /root/zeroclaw/Cargo.toml && echo 'present'", 10);
                    return r.stdout.includes("present") ? "Source present" : "Not found";
                }),
                check("Kokoro TTS", async () => {
                    const r = await sshExec("docker inspect --format='{{.State.Status}}' kokoro-tts", 10);
                    return r.stdout;
                }),
                check("Voicebox", async () => {
                    const r = await sshExec("ss -tlnp | grep 17493 && echo UP", 10);
                    return r.stdout.includes("UP") ? "running" : "port not listening";
                }),
                check("Sovereign Swarm", async () => {
                    const r = await sshExec("ls /root/sovereign_swarm/cognee_node.py && echo present", 10);
                    return r.stdout.includes("present") ? "Source present" : "Not found";
                }),
                check("Trellis Proxy", async () => {
                    const r = await sshExec("ls /root/trellis_proxy/package.json && echo present", 10);
                    return r.stdout.includes("present") ? "Source present" : "Not found";
                }),
                check("n8n", async () => {
                    const r = await sshExec("docker inspect --format='{{.State.Status}}' n8n_prime_v2", 10);
                    return r.stdout;
                }),
                check("Redis", async () => {
                    const r = await sshExec("docker inspect --format='{{.State.Status}}' redis", 10);
                    return r.stdout;
                }),
                check("GPU Tunnel", async () => {
                    const r = await sshExec("systemctl is-active gpu-ollama-tunnel.service", 10);
                    return r.stdout;
                }),
                check("Nginx", async () => {
                    const r = await sshExec("systemctl is-active nginx", 10);
                    return r.stdout;
                }),
                check("Cloudflared", async () => {
                    const r = await sshExec("systemctl is-active cloudflared-bytebot.service", 10);
                    return r.stdout;
                }),
                check("Disk", async () => {
                    const r = await sshExec("df -h / | tail -1 | awk '{print $5}'", 10);
                    const usage = parseInt(r.stdout);
                    if (usage >= 95) throw new Error(`CRITICAL: ${r.stdout} used`);
                    return `${r.stdout} used`;
                }),
            ]);

            const green = checks.filter(c => c.status === "🟢").length;
            const red = checks.filter(c => c.status === "🔴").length;
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                summary: `${green}/${checks.length} healthy, ${red} critical`,
                checks
            }, null, 2);
        }

        // ── Vercel ──
        case "vercel_status": {
            try {
                const cmd = args.project ? `vercel inspect ${args.project} 2>&1` : `vercel ls --limit 10 2>&1`;
                const result = await localExec(cmd, 15);
                return result.stdout;
            } catch (e) {
                return `Vercel error: ${e.message}`;
            }
        }

        // ── GitHub ──
        case "github_status": {
            try {
                const actions = {
                    status: `git -C ${args.repo_path} status`,
                    log: `git -C ${args.repo_path} log --oneline -10`,
                    branches: `git -C ${args.repo_path} branch -a`,
                    remotes: `git -C ${args.repo_path} remote -v`,
                };
                const result = await localExec(actions[args.action || "status"], 10);
                return result.stdout;
            } catch (e) {
                return `Git error: ${e.message}`;
            }
        }

        // ── iMac Anti-Gravity Agent ──
        case "imac_status": {
            try {
                const resp = await httpFetch(`${IMAC_BASE_URL}/`, { timeoutMs: 3000 });
                return JSON.stringify({
                    reachable: true,
                    host: IMAC_HOST,
                    port: IMAC_PORT,
                    status: resp.status,
                    body: resp.body,
                });
            } catch (e) {
                return JSON.stringify({
                    reachable: false,
                    host: IMAC_HOST,
                    port: IMAC_PORT,
                    error: e.message,
                });
            }
        }

        case "imac_click": {
            try {
                const resp = await httpFetch(`${IMAC_BASE_URL}/click`, { method: "POST", body: args });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `imac_click failed: ${e.message}`;
            }
        }

        case "imac_type": {
            try {
                const resp = await httpFetch(`${IMAC_BASE_URL}/type`, { method: "POST", body: args });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `imac_type failed: ${e.message}`;
            }
        }

        case "imac_hotkey": {
            try {
                const resp = await httpFetch(`${IMAC_BASE_URL}/hotkey`, { method: "POST", body: args });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `imac_hotkey failed: ${e.message}`;
            }
        }

        case "imac_execute": {
            try {
                const resp = await httpFetch(`${IMAC_BASE_URL}/execute`, { method: "POST", body: args });
                return JSON.stringify(resp.body);
            } catch (e) {
                return `imac_execute failed: ${e.message}`;
            }
        }

        default:
            return `Unknown tool: ${name}. Available ZeroClaw tools: zeroclaw_mcp_call, xsystem_dispatch, zeroclaw_skill, sim_status`;
    }
}

// ─── MCP Server ─────────────────────────────────────────────────────────────

const server = new Server(
    { name: "sovereign-fleet-mcp", version: "2.0.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const result = await handleTool(name, args || {});
        return {
            content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }],
        };
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

// ─── Start ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("🦾 Sovereign Fleet MCP Server v3.0.0 — 40 tools online | ZeroClaw MCP Hub wired");
