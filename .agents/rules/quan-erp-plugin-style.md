---
trigger: always_on
---

# Quan ERP Plugin Development Style

All development related to Quan ERP plugins MUST follow these rules to ensure consistency across the modular architecture.

## 1. Skill Adherence
- **ALWAYS** use the `quan-erp` skill located in `.agents/skills/quan-erp/`.
- Refer to `SKILL.md` as the primary index for patterns and best practices.
- **ALWAYS** check the `references/` directory for updated standards before starting a task.

## 2. Infrastructure & Libraries
- Use `@quan-erp/shared-backend-core` for all backend infrastructure (decorators, DTOs, services).
- Use `@quan-erp/shared-frontend-core` for all frontend shared components and hooks.
- **NEVER** implement custom core logic that already exists in these shared libraries.

## 3. Backend Implementation
- Follow the annotation patterns documented in `backend/annotations.md`.
- Ensure all services are decorated with `@Service()`.
- Every plugin must have a root module following the `backend/plugin-root-module.md` pattern.
- **CRUD services**: Follow `backend/service-crud-patterns.md` — create with `insert` + `{ id }` (no post-insert `findOne`); update with `{ ...data, updateDate }` + `affected`; soft delete with `softDelete` + `affected`.
- **Cross-Plugin Injection**: When injecting a service from another plugin, use `@Inject(Service, "target-plugin-name")`.
- **Exposing APIs**: Export classes intended for other plugins in `backend/src/export.ts` and ensure they are published to the internal registry.

## 4. Metadata & Naming
- The `module.metadata.json` file must be kept accurate and up-to-date.
- **Package Naming**: `package.json` names MUST follow the `@quan-erp-plugins/<plugin-name>-<frontend|backend>` pattern, where `<plugin-name>` matches `module.metadata.json`.
- Correctly define `pluginDependencies` to ensure proper loading order.

## 5. Folder Structure
- Maintain the standard plugin layout as defined in `references/plugin-development-folder-structure.md`.
- Keep schema/entities, features, and DTOs in their respective directories.

## 6. Frontend Standards
- **Page Layout**: Every page MUST be wrapped in `<Page>` and contain `<PageTitle>` and `<PageContent>` as documented in `references/frontend/page-layout.md`.
- **Localization**:
    - NEVER hardcode strings in JSX.
    - Use `useLocaleTranslation(LocaleFile)` and `translation.get("key", "Default English Text")`.
    - Follow the `references/frontend/localization.md` standard.

## 7. Globalization & Entities
- All plugin entities must support multi-language labels where applicable.
- Ensure all automated responses and error messages are localized where possible.