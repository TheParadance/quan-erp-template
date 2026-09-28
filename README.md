# Quan ERP Template

Starter project for [Quark ERP](https://www.theparadance.com/en/products/quark-erp/docs) (npm: `@quan-erp/*`). Use this repo to run the Docker base stack and develop plugins under `plugins/`.

Scaffold a new project from this template:

```bash
npx @quan-erp/cli new-project
# or into the current empty directory:
npx @quan-erp/cli new-project .
```

## Requirements

- Node.js 18+
- Docker / Docker Compose
- `@quan-erp/cli` (`npm i -g @quan-erp/cli` or use `npx @quan-erp/cli`)
- Local `~/.npmrc` with access to private `@quan-erp` packages (used as a Compose build secret)

## Project layout

```text
base/
├── docker-compose.yaml   # Postgres, Redis, backend, frontend
├── available-plugins/    # Built plugins ready to install
├── backend/
│   └── installed-plugins/
└── data/
plugins/
└── sample/               # Example plugin (backend + frontend)
    ├── backend/
    ├── frontend/
    └── module.metadata.json
```

| Path | Role |
|------|------|
| `plugins/<name>/` | Plugin source |
| `base/available-plugins/` | Artifacts from `quan-erp watch` / `build:prod` |
| `base/backend/installed-plugins/` | Plugins installed in the running ERP |

## Quick start

From the project root (folder that contains `plugins/` and `base/`):

```bash
# 1. Start base stack (Postgres, Redis, backend, frontend)
quan-erp base:dev

# 2. Scaffold a plugin (or use plugins/sample)
quan-erp new

# 3. Dev watch — rebuilds and syncs into base/available-plugins
quan-erp watch <plugin-name>
```

Useful ports (defaults from `base/docker-compose.yaml`):

| Service | Port |
|---------|------|
| Frontend | `80` |
| Backend API | `8080` |
| Dev tool | `8081` |
| Postgres | `5432` |
| Redis | `6379` |

## CLI cheat sheet

Always use `quan-erp` (aliases: `quark-erp`, `erp`). Do not use `./erp`.

| Command | Purpose |
|---------|---------|
| `quan-erp base:dev` | `docker compose -f base/docker-compose.yaml up -d` |
| `quan-erp watch <plugin>` | Dev rebuild + sync to `available-plugins` |
| `quan-erp build:dev:log <plugin>` | One-shot compile with full logs (for debugging) |
| `quan-erp new` / `new-plugin` | Scaffold `plugins/<name>` from the official sample |
| `quan-erp build:prod <plugin>` | Production build into `available-plugins` |
| `quan-erp pack:prod <plugin>` | Production build + zip |

Create plugins with `quan-erp new` — do not copy another plugin folder by hand.

## Sample plugin

`plugins/sample` demonstrates backend modules/controllers/services and frontend pages, APIs, and menu registration. Point `quan-erp watch sample` at it while learning the patterns.

## Aligning core versions

Keep Docker image tags, `BASE_VERSION`, and sample `@quan-erp/*` package versions in sync when upgrading the base platform (see `base/docker-compose.yaml` and `plugins/sample/*/package.json`).

## Docs

- [Quark ERP documentation](https://www.theparadance.com/en/products/quark-erp/docs)
- Releases: [GitHub Releases](https://github.com/TheParadance/quan-erp-template/releases)
