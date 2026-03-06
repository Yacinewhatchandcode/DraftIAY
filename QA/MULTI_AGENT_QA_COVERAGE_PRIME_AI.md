# Prime AI - Matrice de Couverture QA & Checklist ISTQB Multi-Agents

Suite au scan du disque, l'arborescence de `prime-ai.fr` révèle une architecture colossale avec **plus de 104 pages frontend** (Dashboard, Swarm, IDE, Live Avatar, Crypto, Agent Control, Desktop, etc.) et de multiples agents (Sovereign Fleet, Neural Engine, Orchestrator, Voice Agent, Github Fleet). 

Ce document consolide la taxonomie non-fonctionnelle en une **Matrice de Couverture des Risques** et une **Checklist ISTQB** spécifiquement adaptée à l'écosystème Prime AI.

---

## 🏗 Matrice de Couverture : QA → Risques → Tests (Mapping Prime AI)

| Composant Cible (Pages / Agents) | Risque Identifié | Catégorie de Test QA | Approche & Test Spécifique |
| :--- | :--- | :--- | :--- |
| **`/src/app/swarm` & `/src/app/orchestration`** | Effondrement de l'essaim sous la charge, deadlocks inter-agents | **Performance (Load & Stress)** | **Concurrency & Load testing** : Simuler 100+ agents actifs simultanément. **Queue backlog testing** sur l'Orchestrateur. |
| **`/src/app/live-avatar` & `/src/app/voice`** | Latence élevée cassant l'immersion (HAX), désynchronisation | **HCI & Performance (Latency)** | **Voice latency (<2s)** et **Agent Sync drift**. Stress test des appels GPU (Vast.ai/RunPod) pour le rendu I/O. |
| **`Sovereign Fleet` & `/src/app/sovereign`** | Fuite de données critiques inter-tenants, perte de souveraineté | **Cybersecurity & Data Integrity** | **Vector DB Poisoning**, **Memory leakage between agents**, validation de l'isolation des données cross-tenant. |
| **`/src/app/ide` & `/src/app/codebase-intelligence`** | Exécution de code malveillant, Prompt Injection sur le planificateur | **Cybersecurity & Adversarial** | **Sandbox escape testing**, tentatives de **Jailbreak** sur le Neural Engine. |
| **`/src/app/networking/*` & `/src/app/dashboard/leads`** | API Rate-limiting par des plateformes tierces (LinkedIn, Gmail) | **API & Integration Reliability** | **Retry/Backoff validation**, **Rate-limit handling** test, validation du **Circuit breaker**. |
| **`/src/app/agent-memory` & `HIVE_MEMORY`** | Hallucinations persistantes, corruption de la base vectorielle (RAG) | **Cognitive Reliability & Data** | **RAG grounding accuracy**, **Fact persistence over sessions**, mesure du taux d'hallucinations. |
| **`/src/app/cyber-defense` & `/src/app/airlock`** | Vol d'identifiants RPA, fuites de clés API (OpenRouter, Supabase) | **Cybersecurity** | **API key leakage simulation**, test d'exfiltration de données, **Token OAuth hijack** testing. |
| **`/src/app/desktop` & `Bytebot`** | Perte de contexte lors de la navigation, plantage du worker | **Resilience & Fault Tolerance** | **Partial workflow recovery**, test de redémarrage de l'agent worker, **State replay testing**. |
| **`prime-orchestrator` & `/src/app/tool-hub`** | Mauvaise sélection d'outils, conflits d'arbitrage de priorité | **Orchestration QA** | **Tool selection correctness**, **Planner → executor alignment**, test de consensus du Swarm. |
| **Ensemble du cluster (K8s/Vast.ai)** | Crash GPU, indisponibilité du modèle (Trellis/DeepSeek) | **Resilience & BCP** | **Node failure simulation**, **GPU crash recovery**, Multi-provider failover (OpenAI -> Local Sovereign). |

---

## 📋 Checklist ISTQB Multi-Agents Adaptée (Prime AI)

Cette checklist doit être intégrée dans les pipelines CI/CD (ex: Github Actions, Playwright `playwright.config.ts` vu dans le projet).

### 1. Tests de Charge et Stress de l'Essaim (Swarm Stress)
- [ ] Le `prime-orchestrator` peut router > 1000 tasks/min sans goulot d'étranglement.
- [ ] Les pics soudains (Spike) de connexions sur le `/src/app/command-center` déclenchent l'auto-scaling (GPU/VPS).
- [ ] Une requête longue (Endurance) sur le pipeline RAG ne provoque pas de fuite mémoire (VRAM de Vast.ai stable).

### 2. Intégration et API (Reliability)
- [ ] Le failover est automatique si l'API de génération 3D (Trellis) ou LLM (OpenRouter) tombe en Timeout.
- [ ] Le taux de requêtes (Rate-limit) vers Supabase est géré via Backoff sans perte de contexte agent.
- [ ] Les Webhooks Slack (`AIA_LAB`) et les notifications Gmail ne souffrent d'aucune perte en cas de charge.

### 3. Orchestration & Meta-Layer
- [ ] L'Agent Planificateur ne rentre jamais en boucle infinie (Infinite loop detection implémentée et vérifiée).
- [ ] Lors d'une délégation de tâche (`Planner → Executor`), les permissions RPA sont correctement transmises.
- [ ] L'Essaim parvient à un consensus valide (Swarm consensus) même en présence d'un agent défaillant.

### 4. Résilience et Reprise sur Sinistre
- [ ] Une coupure réseau lors d'un `browser/page.tsx` crawler met la tâche en pause et la reprend (Checkpoint restoration).
- [ ] La perte du VPS Hostinger (31.97.52.22) déclenche un fallback propre ou une alerte critique chiffrée.

### 5. Cybersécurité, Red-Teaming et Accès (Zero-Trust)
- [ ] L'agent refuse d'exécuter un prompt injecté via un email entrant lu par le `mac-mail-mcp`.
- [ ] L'accès au `/src/app/agent-settings` ou `/src/app/crypto` nécessite une authentification stricte confirmée.
- [ ] L'environnement d'exécution de code Python/Node dans l'IDE est strictement "sandboxé".

### 6. Intégrité Cognitive et Hallucinations
- [ ] Les sources "Ground Truth" du `HIVE_MEMORY` ou du Knowledge Graph Cognee sont toujours citées par l'agent.
- [ ] Une déviation d'objectif (`Autonomous goal deviation`) est stoppée par les protocoles de sécurité de l'orchestrateur.

### 7. HAX (Human-Agent Interaction)
- [ ] La latence Voice/Transcript dans `/src/app/speech` est inférieure à 2 secondes de bout en bout.
- [ ] L'avatar virtuel (`/src/app/live-avatar`) garde une synchronisation des lèvres cohérente.
- [ ] Les interruptions vocales par l'utilisateur (Turn-taking) sont captées et l'agent s'arrête instantanément.

### 8. Observabilité et Logs
- [ ] Chaque décision d'un agent de la *Sovereign Fleet* génère un node avec une "Truth Color" traçable (Mode Absolu respecté).
- [ ] La consommation des tokens par sous-agent est auditable dans `/src/app/cost-intelligence`.

---
*Ce document respecte le protocole AMLAZR System v2.0 (Direction cognitive, Absence de fluff, Traçabilité absolue).*
