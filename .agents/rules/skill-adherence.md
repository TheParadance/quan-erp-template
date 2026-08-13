---
trigger: always_on
---

# Skill Adherence Rule

- **ALWAYS** use the following skills for all development, refactoring, and debugging tasks within the Quan ERP ecosystem:
    1.  **`quan-erp`**: Located at `.agents/skills/quan-erp/SKILL.md` (Core Architecture).
    2.  **`quan-erp-plugins`**: Located at `.agents/skills/quan-erp-plugins/SKILL.md` (Specialized Plugin Patterns).
- When the user asks to **commit** (or write a commit message / run `npm cz`): **MUST** read and follow **`git`** at `.agents/skills/git/SKILL.md` (see also `.agents/rules/git-commit.md`).
- Treat these `SKILL.md` files as the primary index and source of truth for all architectural patterns, backend annotations, frontend layouts, and cross-plugin communication standards.
- Before starting any task, verify if there is an established pattern in either skill directory to ensure consistency across the codebase.
