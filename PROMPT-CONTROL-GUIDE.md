# 🧠 PROMPT-CONTROL-GUIDE.md

This file defines the full **Atlas Genius Prompt Framework** used for Windsurf + BodyF1rst development. It contains all recognized **Prefix**, **Postfix**, and **Coding Prompt Modules** — including those for AWS, RDS, AI Agents, and MCP integration.

> **Windsurf Directive:** Whenever new prompt types, coding agents, or meta-commands are introduced, append them here. If unsure, leave a comment at the bottom using `<!-- TODO: Kai confirm/update -->`.

---

## ⚙️ PREFIX PROMPTS

### 🧠 Reasoning & Evaluation
| Command | Purpose |
|----------|----------|
| 🔍 **/EVAL-SELF** | Forces self-audit of logic and output quality |
| 🧭 **/PARALLEL-LENSES** | Examines multiple interpretations simultaneously |
| 🧩 **/CHAIN-OF-THOUGHTS** | Displays stepwise reasoning (structured logic chain) |
| ⚠️ **/PITFALLS** | Highlights risks, assumptions, and edge cases |
| 📊 **/METRICS-MODE** | Expresses results with measurable outcomes |
| 🚧 **/GUARDRAIL** | Restricts logic within defined boundaries |

---

### 🏗️ Structure & Framing
| Command | Purpose |
|----------|----------|
| 🧾 **/ROLE: TASK: FORMAT** | Defines role, output style, and structure |
| 🏗️ **/SCHEMA** | Creates a structured schema or JSON model |
| ✍️ **/REWRITE-AS** | Rewrites in specific tone or format |
| 🔁 **/REFLECTIVE-MODE** | Forces reflection on reasoning |
| ⚙️ **/SYSTEMATIC-BIAS-CHECK** | Exposes implicit or hidden bias |
| 🧠 **/DELIBERATE-THINKING** | Slows output speed for deeper logic |

---

### ⚖️ Comparison & Context
| Command | Purpose |
|----------|----------|
| 🧮 **/SWOT** | Strengths, Weaknesses, Opportunities, Threats analysis |
| 🧩 **/FORMAT-AS** | Forces structure (Table, JSON, Code, etc.) |
| ⚖️ **/COMPARE** | Compares two or more entities |
| 🧠 **/MULTI-PERSPECTIVE** | Displays multiple viewpoints |
| 🧷 **/CONTEXT-STACK** | Maintains previous context layers |
| 🚀 **/BEGIN-WITH / END-WITH** | Forces start or conclusion phrasing |

---

### 🗣️ Brevity, Tone & Audience
| Command | Purpose |
|----------|----------|
| ⚡ **/BRIEFLY** | Forces concise summary |
| 👩‍🔬 **/JARGON-USE** | Uses expert technical vocabulary |
| 🗣️ **/AUDIENCE-SPECIFIC** | Tailors tone to user type |
| 🎭 **/TONE** | Adjusts emotional or narrative style |
| 🧰 **/DEV-MODE** | Developer‑style (technical precision) |
| 🧭 **/PM-MODE** | Project‑management reporting tone |
| 🚫 **/NO-AUTOPILOT** | Forbids generic responses |

---

### 🧾 Summaries, Roles & Logic
| Command | Purpose |
|----------|----------|
| 🧒 **/ELI5** | Explain as if to a 5‑year‑old |
| 🧱 **/STEP-BY-STEP** | Sequential logical reasoning |
| 🧭 **/CHECKLIST** | Outputs actionable plan or audit list |
| 🧮 **/EXEC-SUMMARY** | Produces executive summary |
| 🧑‍💼 **/ACT-AS** | Simulates a given persona or role |

---

## 💻 CODING PROMPTS

### ☁️ AWS & DevOps
| Command | Purpose |
|----------|----------|
| ☁️ **/AWS-TRACE** | Maps pipeline or deployment paths |
| 🧩 **/EC2-DRILLDOWN** | Shows instance configuration + logs |
| 💽 **/RDS-QUERY** | Tests or explains MySQL queries |
| 🧰 **/LAMBDA-FLOW** | Illustrates Lambda triggers + permissions |
| 🧾 **/IAM-MAP** | Summarizes roles + policies |
| 🌐 **/CLOUDFRONT-CHECK** | Validates CDN distribution status |
| 🧠 **/SSM-COMMAND** | Formats AWS SSM commands correctly |

---

### 🧠 AI, RAG, & Agent Frameworks
| Command | Purpose |
|----------|----------|
| 🧩 **/RAG-FLOW** | Builds or explains retrieval‑augmented generation systems |
| 📚 **/VECTOR-DB** | Defines embedding + chunking pipeline |
| 🔄 **/AGENT-CHAIN** | Shows relationships between AI agents |
| 🧮 **/COACH-SIM** | Simulates BodyF1rst AI coach logic |
| 🧭 **/CONTEXT-MCP** | Uses Google MCP for live data fetch |
| 💾 **/CACHE-MIND** | Keeps session memory snapshots |

---

### 🧰 Prompt Management Tools
| Command | Purpose |
|----------|----------|
| 🔐 **/POST-FIX** | Forces quality pass + cleanup |
| 🧠 **/PRE-FIX** | Loads meta‑cognition before response |
| 📘 **/PROMPT-DOCS** | Pulls related BodyF1rst prompt docs |
| 🧩 **/CODE-SCOPE** | Limits response strictly to code |
| 🎯 **/DEBUG-TRACE** | Prints variable + reasoning chain |
| 🧠 **/UPDATE-AWS-SUMMARY** | Appends new data to `aws-infrastructure-summary.md` automatically |

---

## 🎨 VISUAL FORMAT GUIDE

| Style | Markdown | Example |
|--------|------------|----------|
| **Bold** | `**text**` | **important** |
| *Italic* | `*text*` | *contextual note* |
| 🟩 Color | pseudo emoji block | 🟩Success🟩 / 🟥Error🟥 |
| Code | ```bash``` | ```bash<br>aws s3 ls``` |
| Quote | `>` | > key statement |
| Header | emoji + bold | 💡 **Title** |

---

## 🧩 POSTFIX PROMPTS

| Command | Purpose |
|----------|----------|
| 🔍 **/POST-REVIEW** | Reevaluates accuracy post‑output |
| 🧠 **/IMPROVE-READABILITY** | Re‑formats text for clarity |
| ⚙️ **/CODE-VALIDATE** | Checks syntax or runtime logic |
| 📊 **/ADD-REFERENCES** | Appends GitHub or API sources |
| 🧩 **/UPDATE-AWS-SUMMARY** | Syncs new AWS changes |
| 💬 **/SUM-FOR-KAI** | Summarizes key actions for Windsurf memory |

---

## 🧠 HOW TO USE
Prefix your query with `/COMMAND` followed by your prompt.

Example:
```text
/ROLE: TASK: FORMAT
/ELI5
Explain how AWS Lambda connects to S3 for video thumbnail generation.
```

---

### 🧩 Maintenance Rules
- **Kai Directive:** Always add new prompt types as they’re invented.  
- **Atlas Directive:** Review this file weekly and merge outdated or redundant entries.  
- **Windsurf Action:** If a command is missing context or unclear, comment `<!-- TODO: Kai confirm/update -->`.

---

**File Path:** `BodyF1rst-APIs/docs/PROMPT-CONTROL-GUIDE.md`  
**Maintainer:** Atlas + Kai  
**Last Updated:** October 2025

