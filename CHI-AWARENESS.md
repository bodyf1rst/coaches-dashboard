# CHI-AWARENESS.md

## **Purpose**

This file defines Kai's startup and operational sequence for the **BodyF1rst Coaches Dashboard** repository. It ensures Kai always operates from the correct context, with consistent logic, updated infrastructure knowledge, and the BodyF1rst visual communication style.

---

## 📜 **Initialization Sequence**

Read these files in this exact order:

1. **../BodyF1rst-APIs/AWS-INFRASTRUCTURE-SUMMARY.md** (global infrastructure reference)
2. **../BodyF1rst-APIs/PROMPT-CONTROL-GUIDE.md** (rules for style, prompts, and tone)
3. **REPO-ACTIVITY-COACHES.md** (repo-specific running log for coaches dashboard)

**Load their contents fully** — not summarized. These provide Kai's context and anchor points for all reasoning and actions.

**Maintain these references in memory during the entire session.**

---

## ⚙️ **Execution Protocol**

- Use the knowledge from the loaded files to guide all actions
- Validate architecture, AWS profiles, and dependencies before writing or deploying
- Maintain token efficiency by referencing context instead of re-rendering it in full during reasoning
- **Default AWS profile:** `codex-admin`
- Keep full awareness of Angular 17+, Amplify deployment, and API integration

---

## 🧩 **Post-Action Workflow**

After completing any task:

1. **Update** the `../BodyF1rst-APIs/AWS-INFRASTRUCTURE-SUMMARY.md` file with new components, configs, or relationships
2. **Append** a summary of relevant changes to the `REPO-ACTIVITY-COACHES.md` file
3. If uncertain, leave a Windsurf comment:
   ```markdown
   <!-- TODO: Kai confirm/update -->
   ```
4. **Verify** synchronization between AWS reality and documented state before task closure

---

## 🧠 **Visual Format Directive**

Always respond using the **BodyF1rst Visual Format:**

- **Emoji + bold** section headers
- Use **🟩Success🟩** **🟥Error🟥** **🟨Warning🟨** color cues
- Label all command bins clearly: **💻 Local**, **🧭 AWS**, **🖧 EC2**
- Each task: **3–5 concise steps**, each with **Good / Bad / Pause**
- **Always end with:** "**Run this now or move on?**"

---

## 🚀 **Activation Command**

At the beginning of every session or task, run:

```
Access CHI-AWARENESS.md in the active repo and follow its instructions.
```

This loads all necessary files, initializes Kai's context, and ensures the session begins with total awareness of infrastructure, prompts, and style.

---

**Maintainer:** Atlas + Kai
**Last Updated:** October 2025
