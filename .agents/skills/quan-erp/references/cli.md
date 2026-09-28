# Quan ERP / Quark ERP CLI

> [!IMPORTANT]
> **Do not invent CLI commands.** Use only the commands listed here. Product name is **Quark ERP**; npm package is **`@quan-erp/cli`**.

Pair with [Plugin Lifecycle & CLI](./plugin-lifecycle-cli.md) for how watch output lands in `available-plugins` / `installed-plugins`. Public docs: [Quark ERP Docs](https://www.theparadance.com/en/products/quark-erp/docs).

## When to use

- User asks to scaffold a plugin or project, watch a plugin, inspect a one-shot dev build log (`build:dev:log`), prod-build/pack, or start the Docker base stack
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

After global install these commands are equivalent:

| Command | Role |
|---------|------|
| `quan-erp` | primary — use this |
| `quark-erp` | alias |
| `erp` | alias |

Run plugin commands from a **Quark ERP project root** (folder that contains `plugins/` and `base/`). Node.js 18+ is required for the npm wrapper.

## Commands

Do not advertise `dev` in help or README. Prefer `base:dev` + `watch`. Use `build:dev:log` when an agent (or developer) needs full compile error output.

| Command | What it does |
|---------|----------------|
| `version` / `-v` / `--version` | Print CLI version |
| `help` | Banner + usage |
| `watch <plugin-name>` | Dev watch: rebuild frontend/backend into `base/available-plugins/<name>/<version>/` (and installed copy if present) |
| `build:dev:log <plugin-name>` | One-shot frontend `npm run build` + backend `npm run build:dev`; print full stdout/stderr (for AI agents). Does not copy artifacts. Exit `1` if either side fails |
| `new` / `new-plugin` | Scaffold under `plugins/<name>` from the official template |
| `new-project [name \| .]` | Vite-style project scaffold from the official template |
| `build:prod <plugin-name>` | Production build → `base/available-plugins/<name>/<version>/` |
| `pack:prod <plugin-name>` | Production build plus zip |
| `plugin upload [path-or-name]` | Upload zip (or pack:prod then upload) to plugin market `POST /public/me/plugin` |
| `upload-plugin [path-or-name]` | Alias for `plugin upload` |
| `base:dev` | `docker compose -f base/docker-compose.yaml up -d`; on failure runs `compose down` |
| `login` | Prompt email + password; save session under the user `quan-erp` config dir |
| `register` | Prompt email + password (confirm); save session if registration succeeds |
| `logout` | Clear the saved session (`credentials.json`) |
| `whoami` | Print the saved session |
| `deploy` | Interactive cloud deploy via management APIs (same as user portal). Requires login |
| `deploy list` / `deploy ops [id]` | Browse / manage deployments (health, metrics, snapshot, backup, restart, power, resize, archive, billing) |
| `deploy update-plugin` | Install plugins via `POST .../deployment/:id/install-plugins` |
| `deploy delete [id]` | Tear down via cloud-deploy delete + poll |
| `deploy tokens` | Manage saved cloud access tokens on the management server (DO / Vultr / Hetzner / …) |
| `cloud-deploy` | Same as `deploy` (portal-backed; poll every 5s) |
| `cloud-deploy list\|ops\|archives\|resume\|delete` | Portal cloud deploy commands |

`--version <tag>` (default `latest`) applies to `new`, `new-plugin`, and `new-project`.

### `watch`

```bash
quan-erp watch <plugin-name>
quan-erp watch <plugin-name> --debounce 10
```

- Plugin folder: `plugins/<plugin-name>/` with `module.metadata.json`
- Frontend: `npm run dev` in `plugins/<name>/frontend`; copies `dist/` after a successful Vite build
- Backend: rebuilds with `npm run build:dev` on file change
- Failed builds must show in the dashboard (`[FRONTEND]: Build failed` / `[BACKEND]: Build failed` plus error lines from stdout and stderr) — never treat a failed build as completed
- Dashboard keeps the last **1000** log lines
- Log prefixes: `[CLI]:`, `[FRONTEND]:`, `[BACKEND]:`
- Ignores `dist/`, `node_modules/`, `.DS_Store`
- Works on macOS, Linux, and Windows

### `build:dev:log`

```bash
quan-erp build:dev:log <plugin-name>
```

One-shot compile check for agents. Use this instead of `watch` when you need to **read TypeScript / Vite / Rollup errors** — `watch` clears the terminal and filters logs in a TUI.

- Frontend: `npm run build` in `plugins/<name>/frontend` (not `dev`, which may `--watch`)
- Backend: `npm run build:dev` in `plugins/<name>/backend`
- Prints the **full** combined stdout/stderr for each side, then a `=== SUMMARY ===` (`frontend: ok|failed`, `backend: ok|failed`)
- Does **not** copy `dist/` into `available-plugins` / `installed-plugins`
- Exit code `1` if metadata is missing or either build fails

### `new` / `new-plugin`

> [!IMPORTANT]
> **Agents MUST scaffold new plugins with this command.** Never `cp` / rsync another plugin (e.g. `phone-pos`, `sample`) into `plugins/<name>/`.

```bash
quan-erp new
quan-erp new-plugin
npx @quan-erp/cli new
```

Prompts: name (spaces → hyphens), optional description/type, optional npm install.

Writes `plugins/<name>/` from the official template sample plugin, updates `module.metadata.json` and package names (`@quan-erp-plugins/<name>-backend|frontend`).

After scaffold, implement features in that folder. Local/dev **module table seed** is separate — see [Add module seed](./backend/add-module-seed.md).

### `new-project`

| Invocation | Target |
|------------|--------|
| `new-project` | Prompt for name (hyphenated, no spaces) → `./<name>` |
| `new-project my-app` | Create `./my-app` |
| `new-project .` | Clone into **current directory** (must be empty aside from `.DS_Store`) |

Template: `https://github.com/TheParadance/quan-erp-template.git`.

### `base:dev`

Starts the base stack from `base/docker-compose.yaml`. If `up -d` fails, automatically `down`. Port conflicts (e.g. 6379) are host issues — do not kill unrelated user services unless asked.

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
quan-erp register
quan-erp whoami
quan-erp logout
```

Password is always prompted (never a flag). Username prompt is **email**. There are no `--server` / `--username` flags. `login` / `register` / `deploy` / `cloud-deploy` need a reachable management server or they fail with connection refused.

### `plugin upload`

```bash
quan-erp plugin upload
quan-erp plugin upload my-plugin
quan-erp plugin upload ./my-plugin.zip
quan-erp upload-plugin my-plugin
```

Uploads to the portal **plugin market** (`POST /public/me/plugin`, form field `file`) — same as the portal Private tab. Zip must contain `module.metadata.json`. A bare plugin name runs `pack:prod` then upload. Publish/price stays in the portal.

### `deploy`

```bash
quan-erp deploy
quan-erp deploy list
quan-erp deploy ops [id]
quan-erp deploy update-plugin
quan-erp deploy delete [id]
quan-erp deploy tokens
```

Interactive only. Requires `quan-erp login`. Do not invent extra flags. Source: thin façade in `helper/cli/src/cli/deploy/` → `helper/cli/src/cli/cloud-deploy/`.

**No local SSH/SDK provision.** The management server provisions; the CLI only calls portal APIs and polls.

**New deployment wizard** (same order as user portal `/deployments/new`):

1. **Quark Cloud** (Shared default | Dedicated) vs **BYOK** (DigitalOcean / Vultr / Hetzner / Linode / UpCloud / Contabo / AWS Lightsail / LightNode / OVH / Alibaba SAS / Huawei Flexus token, or existing SSH host)
2. Beginner vs Advanced → organization (Quark: domain check; BYOK: **customDomain**)
3. **baseVersion** → catalog plugins (channel + base; free/purchased/private), **package**, or restore from instance archive (deps + hardware floors)
4. Plan / Shared size / estimate (credits for Quark; USD for BYOK) → BYOK OpenAI/Firebase/admin config → credit guard → confirm
5. `POST /public/me/cloud-deploy` with `plugins` as `name@version` → poll `GET /public/me/deployment/:id` every **5s**

**Deployment ops** (`deploy list` / `deploy ops`): status/health (Shared labels), metrics, resume (`setupDnsLater`), Assign DNS & SSL, install plugins (catalog/package), restart app, power on/off, resize (`resize/sizes`), snapshots, app backups (download), provider backups, billing, archive, delete — all management APIs.

**Resume / delete:** `POST .../cloud-deploy/:id/resume|delete` then poll. `deploy update-plugin` → `POST .../deployment/:id/install-plugins`.

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

1. Restart a running `quan-erp watch` after the local CLI binary is rebuilt.
2. To inspect plugin compile errors, run `quan-erp build:dev:log <plugin-name>` — do not use `watch` for this (TUI clears the screen).
3. **Do not `git add .`** mixed CLI + local `file:` / `web-env.json` / `.DS_Store`.
4. **npm publish** of `@quan-erp/cli` goes to `https://registry.npmjs.org/` (`make publish-cli`). Scope `@quan-erp/cli` requires the **`quan-erp`** npm org.
5. **README-only npm updates** need a **patch bump** if that version is already published.
6. The published package has **no persistent CLI state**. Do not store prefs inside the npm package files. User state belongs in the OS config dir under `quan-erp/` (`helper/cli/src/utils/state`).
7. **Do not document `dev`** in help/README unless the user asks.
8. **`deploy` and `cloud-deploy` are interactive** and need `quan-erp login` plus a reachable management server. Do not script region/size/token flags that do not exist. Do not add local SSH/SDK provision back.
9. Upload plugins with `quan-erp plugin upload` → `POST /public/me/plugin`, never `/plugin-package`.

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
