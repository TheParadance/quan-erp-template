# Quan ERP / Quark ERP CLI

> [!IMPORTANT]
> **Do not invent CLI commands.** Use only the commands listed here. Product name is **Quark ERP**; npm package is **`@quan-erp/cli`**.

Pair with [Plugin Lifecycle & CLI](./plugin-lifecycle-cli.md) for how watch output lands in `available-plugins` / `installed-plugins`. Public docs: [Quark ERP Docs](https://www.theparadance.com/en/products/quark-erp/docs).

## When to use

- User asks to scaffold a plugin or project, watch a plugin, inspect a one-shot dev build log (`build:dev:log`), generate plugin DB migrations (`migration create`), prod-build/pack, or start the Docker base stack (`run dev` — opens the frontend in the browser when backend + frontend are up)
- User asks to **seed** a plugin’s `module.metadata.json` into the local DB (`plugin seed` / `seed-plugin`)
- User asks to **deploy** a cloud VM, manage deploy tokens, list/delete deployments, or add plugins to an existing deploy
- User asks to run **cloud-deploy** (portal-backed provisioning; poll status every 5s)
- User asks how `quan-erp` / `npx @quan-erp/cli` works

## Install / invoke

**Always document and run `quan-erp`.** Do not use `./erp`.

| How | Command |
|-----|---------|
| Primary | `quan-erp <command>` from a project root |
| npx | `npx @quan-erp/cli <command>` |
| Global | `npm i -g @quan-erp/cli` then `quan-erp` |
| Fresh machine | `quan-erp-installer` (standalone; see below) |

### Standalone installer

`helper/cli/installer/` → binary `quan-erp-installer`. Installs Node.js, Docker, `@quan-erp/cli`, then optionally launches the CLI.

| Mode | Flag | When |
|------|------|------|
| Native GUI | default / `--gui` | Desktop installer window (Fyne) |
| Web | `--web` | Browser React+Vite UI on `127.0.0.1` |
| Terminal | `--terminal` | TTY wizard |
| Direct | `--direct` or bare `-y`/`--yes` | Scripts / headless |

Also: `--skip-docker`, `--no-launch`, `--version <tag>`. No display → falls back to terminal (TTY) or direct. Build: `make build-installer-local`. All platform packages: `make build-installer-packages` → `helper/cli/outputs/installer/` (mac `.pkg`, linux `.deb`/`.tar.gz`, windows `.zip`).

After global install these commands are equivalent:

| Command | Role |
|---------|------|
| `quan-erp` | primary — use this |
| `quark-erp` | alias |
| `erp` | alias |

Run plugin commands from a **Quark ERP project root** (folder that contains `plugins/` and `base/`). Node.js 18+ is required for the npm wrapper.

## Commands

Do not advertise bare `dev` (core-dev) in help or README. Prefer `run dev` + `watch`. Use `build:dev:log` when an agent (or developer) needs full compile error output.

| Command | What it does |
|---------|----------------|
| `version` / `-v` / `--version` | Print CLI version |
| `help` | Banner + usage |
| `plugin watch <plugin-name>` / `watch` | Dev watch: rebuild frontend/backend into `base/available-plugins/<name>/<version>/` (and installed copy if present) |
| `plugin build:dev:log <plugin-name>` / `build:dev:log` | One-shot frontend `npm run build` + backend `npm run build:dev`; print full stdout/stderr (for AI agents). Does not copy artifacts. Exit `1` if either side fails |
| `plugin migration dry-run <plugin-name> [-h -u -p -d]` | Dry-run TypeORM `migration:generate`; print colored raw SQL; discard temp file. Exit `1` on fail |
| `plugin migration create <plugin-name> [-h -u -p -d]` | Temp-fill `source.ts` from compose DB (flags override), TypeORM generate, wrap to `IDatabaseMigration` (`migration-<8hex>-<pluginVersion>.ts`), register in `getMigrations()`, restore empty creds. Exit `1` on fail |
| `plugin migration remove <plugin-name>` | Multi-select migrations (Space), or `--migration file.ts` / `--all` with `--yes`. Delete files, unregister from `getMigrations()`. Exit `1` on fail |
| `plugin new` / `new` / `new-plugin` | Scaffold under `plugins/<name>` from the official template |
| `new-project [name \| .]` | Vite-style project scaffold from the official template |
| `plugin build:prod <plugin-name>` / `build:prod` | Production build → `base/available-plugins/<name>/<version>/` |
| `plugin pack:prod <plugin-name>` / `pack:prod` | Production build plus zip of **only** `available-plugins/<name>/<pluginVersion>/` (not sibling versions) |
| `plugin publish <plugin-name> [--marketplace]` | Pack+upload private draft; `--marketplace` also publishes. `@name` = marketplace-only |
| `plugin unpublish <plugin-name>` | Unpublish from marketplace (name skips confirm) |
| `upload-plugin [plugin-name]` | Alias for `plugin publish` |
| `run dev [--no-open] [--backend] [--frontend] [--redis] [--postgres] [--all]` | Open Docker Desktop if needed, `docker compose -f base/docker-compose.yaml up` (foreground); **default log attach = backend only**; opens frontend after backend (:8080) + frontend (:80) respond; on failure runs `compose down` |
| `setup [--yes]` | Install Node.js LTS (skip if `node` on PATH) and Docker Desktop for this OS/arch (skip if already present). Download shows a progress bar |
| `doctor` | Check Node.js, Docker Desktop, free disk space, PostgreSQL (:5432), Redis (:6379), and HTTP ports 80 / 8080 / 8081. Exit `1` if any check fails |
| `plugin clean <plugin-name>` / `clean <name>` | Remove every `node_modules` dir and `package-lock.json` under `plugins/<name>/` only |
| `plugin clean` / `clean` | `npm cache clean --force` + `docker builder prune -af` + `docker image prune -af` (unused images) |
| `plugin clean --plugin-only` | All plugins’ `node_modules` + `package-lock.json` (no npm/Docker) |
| `plugin install <plugin-name>` | Remove `package-lock.json` in frontend + backend (if present), then `npm install` in both; pin each `@quan-erp-plugins/*` dependency to the exact version from `package.json` |
| `plugin seed <plugin-name>` / `seed-plugin` | Seed `module` row (non-interactive when name given). Optional `--display-name`, `--description`, `--update`, `--flush-redis`, `-u`/`-d`/`-p`. On success, bumps `base/data/frontend/web-env.json` `VITE_MODULE_CACHE_ID` to a random hash |
| `login [--username] [--password]` | Sign in; password may use `QUAN_ERP_PASSWORD` |
| `register [--username] [--password]` | Create account; password may use `QUAN_ERP_PASSWORD` |
| `logout` | Clear the saved session (`credentials.json`) |
| `whoami` | Print the saved session |
| `credit` | Show credit balance (`credit history` for ledger) |
| `deploy` | Interactive cloud deploy via management APIs (same as user portal). Requires login |
| `deploy list` / `deploy ops [id]` | Browse / manage deployments (health, metrics, snapshot, backup, restart, power, resize, archive, billing) |
| `deploy delete [id]` | Tear down via cloud-deploy delete + poll |
| `deploy tokens` | Manage saved cloud access tokens on the management server (DO / Vultr / Hetzner / …) |
| `cloud-deploy` | Same as `deploy` (portal-backed; poll every 5s) |
| `cloud-deploy list\|ops\|archives\|resume\|delete` | Portal cloud deploy commands |

`--version <tag>` (default `latest`) applies to `new`, `new-plugin`, and `new-project`.

### `watch`

```bash
quan-erp plugin watch <plugin-name>
quan-erp plugin watch <plugin-name> --debounce 500
# alias: quan-erp watch …
```

- Plugin folder: `plugins/<plugin-name>/` with `module.metadata.json`
- Frontend: `npm run dev` in `plugins/<name>/frontend`; copies `dist/` after a successful Vite build
- If the frontend process exits (e.g. initial `tsc -b` fails before `vite build --watch`), watch keeps listening and **restarts `npm run dev` on the next frontend file change**
- DevTools (`:8081`): probes every **1s**; build/reload notifies keep retrying every **1s** until DevTools accepts them
- Backend: rebuilds with `npm run build:dev` on file change
- `--debounce <ms>` (default **500**): **trailing** quiet-period across all files — many rapid saves coalesce into **one** rebuild; changes during an in-flight backend build are queued for a single follow-up rebuild
- Failed builds must show in the dashboard (`[FRONTEND]: Build failed` / `[BACKEND]: Build failed` plus error lines from stdout and stderr) — never treat a failed build as completed
- Dashboard keeps the last **1000** log lines
- Log prefixes: `[CLI]:`, `[FRONTEND]:`, `[BACKEND]:`
- Ignores `dist/`, `node_modules/`, `.DS_Store`
- Works on macOS, Linux, and Windows

### `build:dev:log`

```bash
quan-erp plugin build:dev:log <plugin-name>
# alias: quan-erp build:dev:log …
```

One-shot compile check for agents. Use this instead of `watch` when you need to **read TypeScript / Vite / Rollup errors** — `watch` clears the terminal and filters logs in a TUI.

- Frontend: `npm run build` in `plugins/<name>/frontend` (not `dev`, which may `--watch`)
- Backend: `npm run build:dev` in `plugins/<name>/backend`
- Prints the **full** combined stdout/stderr for each side, then a `=== SUMMARY ===` (`frontend: ok|failed`, `backend: ok|failed`)
- Does **not** copy `dist/` into `available-plugins` / `installed-plugins`
- Exit code `1` if metadata is missing or either build fails

### `migration create`

```bash
quan-erp plugin migration create <plugin-name>
```

Generates a Quan ERP `IDatabaseMigration` from a TypeORM schema diff against the local compose Postgres DB:

1. Reads `POSTGRES_*` from `base/docker-compose.yaml` (`db` service)
2. Temporarily sets `username` / `password` / `database` on `plugins/<name>/backend/src/migrations/source.ts`
3. Runs TypeORM `migration:generate`
4. Writes `plugins/<name>/backend/src/migrations/migration-<8hex>-<pluginVersion>.ts` (`getSource()` always `{ plugin: 'default', name: 'default' }`)
5. Appends the class to `backend/src/index.ts` `getMigrations()`
6. Restores `source.ts` credentials to `""`

Requires entities listed in `source.ts`, a reachable DB, and `module.metadata.json` `pluginVersion`. Prefer this over raw `npm run migration:generate`.

### `migration remove`

```bash
quan-erp plugin migration remove <plugin-name>
quan-erp plugin migration remove <plugin-name> --migration migration-xxx.ts --yes
quan-erp plugin migration remove <plugin-name> --all --yes
```

Interactive: lists `plugins/<name>/backend/src/migrations/*.ts` (except `source.ts`). **Space** toggles selection, **Enter** confirms, then a yes/no confirm.

Non-interactive: pass `--migration <file>` (repeatable) or `--all`, plus **`--yes`** (required). Deletes selected files and removes their import + class from `backend/src/index.ts` `getMigrations()`.

### `migration dry-run`

```bash
quan-erp plugin migration dry-run <plugin-name>
```

Dry-runs TypeORM `migration:generate` against compose DB, prints colored raw SQL (up/down), then deletes the temp file. Does **not** write an `IDatabaseMigration` or edit `index.ts`.

### `new` / `new-plugin`

> [!IMPORTANT]
> **Agents MUST scaffold new plugins with this command.** Never `cp` / rsync another plugin (e.g. `phone-pos`, `sample`) into `plugins/<name>/`.

```bash
quan-erp new pawnshop
quan-erp plugin new pawnshop --description "Pawn shop module" --install
quan-erp new-plugin pawnshop
quan-erp new
# aliases: quan-erp plugin new / new-plugin
npx @quan-erp/cli new pawnshop
```

**Agents / non-interactive:** pass the plugin name on the command line (no prompts). `-y` / `--yes` is optional when a name is present.

| Flag | Meaning |
|------|---------|
| `<name>` | Plugin folder/name — if present, non-interactive (skip install/seed unless flagged) |
| `-y` / `--yes` | Explicit non-interactive (name still required) |
| `--install` | Run npm install in frontend/backend |
| `--seed` | Seed local module table |
| `--description text` | Optional description |
| `--type text` | Optional type |
| `--version tag` | Template tag (default `latest`) |

Do **not** pipe `/dev/null` or `printf` into `plugin new`.

Prompts (interactive, name omitted): name (spaces → hyphens), optional description/type, optional npm install, optional seed.

Writes `plugins/<name>/` from the official template sample plugin, updates `module.metadata.json` and package names (`@quan-erp-plugins/<name>-backend|frontend`).

After scaffold, implement features in that folder. Optionally seeds the local `module` table during `new` (prompt). Standalone re-seed: `quan-erp plugin seed <name>` — see [Add module seed](./backend/add-module-seed.md).

### `new-project`

| Invocation | Target |
|------------|--------|
| `new-project` | Prompt for name (hyphenated, no spaces) → `./<name>` |
| `new-project my-app` | Create `./my-app` |
| `new-project .` | Clone into **current directory** (must be empty aside from `.DS_Store`) |

Template: `https://github.com/TheParadance/quan-erp-template.git`. After copy, runs `git init` in the project folder (template `.git` is stripped).

### `clean`

```bash
quan-erp plugin clean inventory                    # one plugin: node_modules + package-lock.json only
quan-erp clean                                     # npm cache + Docker build cache + unused images
quan-erp plugin clean                              # same as erp clean
quan-erp clean --plugin-only                       # all plugins only
quan-erp clean --node-only                         # npm cache only
quan-erp clean --docker-build-only                 # Docker build cache (docker builder prune -af)
quan-erp clean --docker-image-only                 # unused Docker images (docker image prune -af)
quan-erp clean --plugin-only --node-only           # combine scopes
# alias: quan-erp plugin clean …
```

`plugin clean <name>` (no flags) walks that plugin tree and deletes every `node_modules` / `package-lock.json`. Bare `clean` / `plugin clean` (no name) runs `npm cache clean --force`, then `docker builder prune -af` and `docker image prune -af` — it does **not** wipe plugin `node_modules` unless you pass `--plugin-only` or a plugin name. Scope flags select subsets and may be combined with a plugin name. Starts Docker Desktop briefly if the engine is down for Docker scopes.

### `plugin install`

```bash
quan-erp plugin install inventory
# alias: quan-erp plugin i inventory
```

For `plugins/<name>/frontend` and `plugins/<name>/backend` (skips a side if no `package.json`):

1. Remove `package-lock.json` if present
2. `npm install`
3. Collect every `dependencies` key starting with `@quan-erp-plugins/`, strip `^` / `~` / `=` from the version, then `npm install @quan-erp-plugins/accounting-backend@1.0.0-beta.3 …` (exact pins). Skips `file:` / `link:` / `workspace:` / git / URL refs.

Exit `1` if any npm step fails.

### `seed-plugin`

```bash
quan-erp plugin seed inventory
quan-erp plugin seed fujian --update --flush-redis
quan-erp plugin seed inventory --display-name "Inventory" --description "Stock module"
# Optional: -u / -d / -p "$POSTGRES_PASSWORD" — never put a real password literal in docs or chat
# alias: quan-erp seed-plugin …
```

Local/dev only. Passing a plugin name is **non-interactive** (no prompts). Reads `plugins/<plugin-name>/module.metadata.json` and seeds (or updates) the `module` table using Postgres credentials from `base/docker-compose.yaml` (`db` service) via:

```bash
docker compose -f base/docker-compose.yaml exec -T db psql …
```

| Flag | Meaning |
|------|---------|
| `--display-name` | Override display name (default: metadata / humanized name) |
| `--description` | Override description (default: metadata; empty OK) |
| `--update` | If row exists, UPDATE it (default: skip when already exists) |
| `--flush-redis` | Run Redis `FLUSHALL` after seed (default: skip) |
| `-u` / `--user` | DB username override |
| `-d` / `--database` | DB name override |
| `-p` / `--password` | DB password override |

Falls back to host `psql` on `127.0.0.1:<host-port>` if compose exec fails. Requires the local stack (`quan-erp run dev`) so the `db` container is up.

After a successful insert/update, sets `VITE_MODULE_CACHE_ID` in `base/data/frontend/web-env.json` to a new random hex hash so the browser reloads plugin modules.

See [Add module seed](./backend/add-module-seed.md).

### `run dev`

```bash
quan-erp run dev                         # start all services; stream backend logs only (default)
quan-erp run dev --no-open
quan-erp run dev --backend --frontend    # stream backend + frontend logs
quan-erp run dev --redis --postgres
quan-erp run dev --all                   # stream every compose service
# alias: quan-erp base:dev
```

Opens Docker Desktop if the engine is not ready (poll up to ~120s), then starts the base stack from `base/docker-compose.yaml` in the foreground (`up`, no `-d`). **All services still start**; log streaming uses `docker compose --attach`.

| Flag | Compose service attached |
|------|--------------------------|
| *(none)* / `--backend` | `backend` (**default** when no log flags) |
| `--frontend` | `frontend` |
| `--redis` | `redis` |
| `--postgres` / `--db` | `db` (PostgreSQL) |
| `--all` | every service (overrides other log flags) |

Combine log flags freely, e.g. `--backend --frontend --redis`.

After compose is running, polls until **both** services respond (up to ~5m), then opens the app once in the default browser:

| Service | Compose host port | Ready check |
|---------|-------------------|-------------|
| Frontend | `80:80` | `http://127.0.0.1/` |
| Backend | `8080:8080` | `http://127.0.0.1:8080/` |

- Opens `http://127.0.0.1/app` only after both checks succeed
- `--no-open` — skip the browser (use in CI / agent loops / headless)
- If Desktop is not installed, exits with `erp setup`
- If `up` fails, automatically runs `compose down`
- Port conflicts (e.g. 6379) are host issues — do not kill unrelated user services unless asked

### `setup`

```bash
quan-erp setup
quan-erp setup --yes
```

Ensures local tooling:

1. **Disk space** — fail early if free space is below the budget for remaining installs (~800 MiB Node, ~3 GiB Docker Desktop).
2. **Node.js** — skip if `node` is on PATH (warn if major &lt; 18); otherwise download+install latest LTS (progress bar). On Alpine: `apk add nodejs npm` (musl; not the glibc nodejs.org tarball).
3. **Docker** — Desktop on macOS / Windows / Ubuntu|Debian|Fedora|RHEL amd64; on Alpine: `apk add docker` (+ compose) and start via OpenRC (`rc-service docker start`).

Linux Desktop supports Ubuntu/Debian/Fedora/RHEL (amd64). On **Alpine**, Docker Desktop is not available.

### `doctor`

```bash
quan-erp doctor
```

Checks Node.js, Docker Desktop, free disk space (≥ ~4.2 GiB for local stack, plus install headroom if Node/Docker are missing), PostgreSQL (`:5432`), Redis (`:6379`), and HTTP on ports `80`, `8080`, and `8081`. Exit `1` if any check fails. Suggests `erp setup` when tooling/disk fails, or `erp run dev` when only ports fail.

### CLI state (`quan-erp` dir)

Persistent CLI state lives in the **user config directory**, never inside the npm package or project tree:

| OS | Directory |
|----|-----------|
| macOS | `~/Library/Application Support/quan-erp/` |
| Linux | `~/.config/quan-erp/` (`$XDG_CONFIG_HOME/quan-erp` if set) |
| Windows | `%AppData%\quan-erp\` |

| File | Mode | Contents |
|------|------|----------|
| `config.json` | `0644` | Last server URL and username (survives logout) |
| `credentials.json` | `0600` | `accessToken` / `refreshToken` / user identity — **never a password** |
| `update-check.json` | `0644` | Cached npm latest version (24h TTL) |

Go helpers: `helper/cli/src/utils/state`. Session files live in the OS `quan-erp/` config dir above. One-shot commands (not `watch` / `dev` / `build:dev:log`) check `https://registry.npmjs.org/@quan-erp/cli/latest`. If npm is newer than the binary, print `npm i -g @quan-erp/cli` on stderr. Skip with `QUAN_ERP_NO_UPDATE_CHECK`. Cache is 24h, but is ignored when it is older than this binary, and `version` / `-v` always rechecks npm.

### `login` / `register` / `logout` / `whoami`

```bash
quan-erp login
quan-erp login --username a@b.com --password '…'
quan-erp register --username a@b.com --password '…'
QUAN_ERP_PASSWORD='…' quan-erp login --username a@b.com
quan-erp whoami
quan-erp logout
```

Username is **email**. With `--username` + `--password` (or `QUAN_ERP_PASSWORD`), login/register are non-interactive. Omitting flags keeps prompts. `login` / `register` / `deploy` / `cloud-deploy` need a reachable management server or they fail with connection refused.

### `plugin publish`

```bash
quan-erp plugin publish my-plugin
quan-erp plugin publish my-plugin --marketplace
quan-erp plugin publish @my-plugin
quan-erp plugin publish ./my-plugin.zip
quan-erp upload-plugin my-plugin
```

Uploads to the portal **plugin market** (`POST /public/me/plugin`, form field `file`) — same as the portal Private tab. A bare plugin name runs `pack:prod` then upload and leaves the draft **private** (no confirm). `--marketplace` also sets `isPublished=true` (draft must already have icon, category, description ≥10 chars — no interactive picks). `@name` publishes an existing private draft.

### `plugin unpublish`

```bash
quan-erp plugin unpublish my-plugin
quan-erp plugin unpublish
```

Sets `isPublished=false` via `PUT /public/me/plugin/:idOrName`. Passing a name skips confirmation. Interactive select when no name is given.

### `deploy`

```bash
quan-erp deploy
quan-erp deploy list
quan-erp deploy ops [id]
quan-erp deploy delete [id]
quan-erp deploy tokens
```

Interactive only. Requires `quan-erp login`. Do not invent extra flags. Source: thin façade in `helper/cli/src/cli/deploy/` → `helper/cli/src/cli/cloud-deploy/`.

**No local SSH/SDK provision.** The management server provisions; the CLI only calls portal APIs and polls.

**New deployment wizard** (same order as user portal `/deployments/new`):

1. **Myan Myan Tone Cloud** (Shared default | Dedicated) vs **BYOK** (DigitalOcean / Vultr / Hetzner / Linode / UpCloud / Contabo / AWS Lightsail / LightNode / OVH / Alibaba SAS / Huawei Flexus token, or existing SSH host)
2. Beginner vs Advanced → organization (Quark: domain check; BYOK: **customDomain**)
3. **baseVersion** → catalog plugins (channel + base; free/purchased/private), **package**, or restore from instance archive (deps + hardware floors)
4. Plan / Shared size / estimate (credits for Quark; USD for BYOK) → BYOK OpenAI/Firebase/admin config → credit guard → confirm
5. `POST /public/me/cloud-deploy` with `plugins` as `name@version` → poll `GET /public/me/deployment/:id` every **5s**

**Deployment ops** (`deploy list` / `deploy ops`): status/health (Shared labels), metrics, resume (`setupDnsLater`), Assign DNS & SSL, install plugins (catalog/package), restart app, power on/off, resize (`resize/sizes`), snapshots, app backups (download), provider backups, billing, archive, delete — all management APIs.

**Resume / delete:** `POST .../cloud-deploy/:id/resume|delete` then poll.

### `cloud-deploy`

```bash
quan-erp cloud-deploy
quan-erp cloud-deploy list
quan-erp cloud-deploy ops [id]
quan-erp cloud-deploy archives
quan-erp cloud-deploy resume [id]
quan-erp cloud-deploy delete [id]
```

Same as `deploy`. Source: `helper/cli/src/cli/cloud-deploy/`.

## Agent rules

1. Restart a running `quan-erp plugin watch` after the local CLI binary is rebuilt.
2. To inspect plugin compile errors, run `quan-erp plugin build:dev:log <plugin-name>` (alias `build:dev:log`) — do not use `watch` for this (TUI clears the screen).
3. **Do not `git add .`** mixed CLI + local `file:` / `web-env.json` / `.DS_Store`.
4. **npm publish** of `@quan-erp/cli` goes to `https://registry.npmjs.org/` (`make publish-cli`). Scope `@quan-erp/cli` requires the **`quan-erp`** npm org.
5. **README-only npm updates** need a **patch bump** if that version is already published.
6. The published package has **no persistent CLI state**. Do not store prefs inside the npm package files. User state belongs in the OS config dir under `quan-erp/` (`helper/cli/src/utils/state`).
7. **Do not document `dev`** in help/README unless the user asks.
8. **`deploy` and `cloud-deploy` are interactive** and need `quan-erp login` plus a reachable management server. Do not script region/size/token flags that do not exist. Do not add local SSH/SDK provision back.
9. Upload plugins with `quan-erp plugin publish` → `POST /public/me/plugin`, never `/plugin-package`.
10. For agent/CI local-stack starts, prefer `quan-erp run dev --no-open` so the CLI does not try to open a browser.

## Maintainers — package & publish

```bash
# from repo root
make build-cli      # local CLI binary for this machine
make package-cli    # stage platform binaries for npm
make publish-cli    # package + npm publish @quan-erp/cli
```

Platforms: macOS (arm64, amd64), Linux (amd64, arm64), Windows (amd64).

## Related

- [Folder structure](./plugin-development-folder-structure.md)
- [Module metadata](./backend/module.metadata.md)
- [Package naming](./package-json-naming.md)
- [Add module seed (local DB)](./backend/add-module-seed.md)
