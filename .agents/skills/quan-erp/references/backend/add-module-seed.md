# Add module seed (local development only)

Insert a row into the `module` table so a plugin appears in the local Quan ERP
dev database.

> [!IMPORTANT]
> **Development setup only.** Prefer the CLI. Never run this against UAT/prod,
> remote hosts, or any DB that is not the local developing setup.

## Preferred: CLI

```bash
quan-erp plugin seed <plugin-name>
# e.g. quan-erp plugin seed my-plugin
# alias: quan-erp seed-plugin …
# Optional overrides (never hardcode real passwords in docs or commits):
# quan-erp plugin seed my-plugin -u postgres -d quan-erp -p "$POSTGRES_PASSWORD"
```

Reads `plugins/<plugin-name>/module.metadata.json` and seeds (or updates) the
`module` table using Postgres credentials from `base/docker-compose.yaml`
(`db` service) via `docker compose … exec db psql`. Override with `-u` / `-d` /
`-p` (or `--user` / `--database` / `--password`) — pass passwords via env vars
only; never paste them into docs, chat, or git. Falls back to host `psql`
on `127.0.0.1` if compose exec fails.

- Requires local stack up (`quan-erp run dev`) so the `db` container is running
- Prompts for display name (and description when metadata is empty)
- If `(name, plugin_version)` already exists, asks before `UPDATE`

Also offered as an optional step at the end of `quan-erp plugin new` / `new` / `new-plugin`.

## When to use

- User asks to seed / insert / register a module for local plugin development
- A new plugin exists under `plugins/<name>/` and needs a `module` row
- User points at the README module `INSERT` pattern

## Manual fallback (psql)

Use only if the CLI is unavailable. Credentials come from
`base/docker-compose.yaml` (`db` → `POSTGRES_*`) or `base/backend/.env`.

### Prerequisites

- Local developing setup is active (`quan-erp run dev` / Docker workflow)
- `psql` available **or** docker compose `db` container reachable
- Postgres reachable with local/dev values

### DB credentials

**Prefer compose** (`base/docker-compose.yaml` → `db` service):

| Compose key | Typical local value |
|---|---|
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | from compose (do not hardcode in commits) |
| `POSTGRES_DB` | `quan-erp` |
| host port | `5432` (mapped `5432:5432`) |

Or from `base/backend/.env`: `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_SCHEMA`.

**Guardrails before connecting:**

1. Confirm the target is local/dev (`localhost` / `127.0.0.1` / docker compose `db`).
2. If host is not local, **stop** and ask the user — this flow is local/dev only.
3. Prefer loading password via `PGPASSWORD` / compose env; do not echo it into chat logs unnecessarily.

Docker one-shot (matches the CLI):

```bash
docker compose -f base/docker-compose.yaml exec -T \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  db psql -U postgres -d quan-erp -v ON_ERROR_STOP=1
```

Host example (after reading compose or `.env`):

```bash
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_SCHEMA"
```

## Seed query shape (from README)

Use this `INSERT` shape:

```sql
INSERT INTO module
("name","displayName","description","unInstallable","module_entry_object","plugin_version","dependencies","base_version","version")
VALUES
('<name>','<Display Name>','<description>',true,'Module','1.0.0','{}','1.0.0',1);
```

Field mapping from `plugins/<name>/module.metadata.json`:

| SQL column | Source |
|---|---|
| `name` | `metadata.name` (must match plugin folder / metadata) |
| `displayName` | Human title (ask user if missing; do not invent brand-heavy copy) |
| `description` | `metadata.description` |
| `unInstallable` | `true` for normal plugins (README convention) |
| `module_entry_object` | `metadata.moduleEntryObject` (usually `Module`) |
| `plugin_version` | `metadata.pluginVersion` (usually `1.0.0`) |
| `dependencies` | JSON string of `metadata.pluginDependencies` (use `'{}'` when empty) |
| `base_version` | `metadata.requiredBasedVersion` (usually `1.0.0`) |
| `version` | optimistic lock / row version — use `1` like README seeds |

Unique constraint: `(name, plugin_version)`. Check before insert:

```sql
SELECT id, name, "displayName", plugin_version, installed
FROM module
WHERE name = '<name>' AND plugin_version = '<plugin_version>';
```

- If a row exists, **do not** duplicate unless the user explicitly wants an update.
- For updates, ask first; prefer a targeted `UPDATE` over blind re-insert.

## Agent flow

1. Prefer `quan-erp plugin seed <plugin-name>` (interactive prompts for display name / update confirm).
2. If CLI is unavailable: confirm local/dev DB via compose or `base/backend/.env`, then run `psql` / `docker compose exec db psql`.
3. Verify with a `SELECT` and report `id` / `name` / `displayName` to the user.

## Do not

- Seed UAT/prod or non-local databases
- Expose, hardcode, or paste passwords (docs, chat, commits, command history examples) — use `$POSTGRES_PASSWORD` / `$DB_PASSWORD` / compose env only
- Commit `.env`, passwords, or connection dumps
- Invent extra columns beyond the README seed shape unless the live `\d module` schema requires it
- Skip the existence check when seeding a known plugin name

## Related

- CLI: [cli.md](../cli.md) (`plugin seed` / `seed-plugin`)
- Plugin data seeding (`@OnInit` / `DataSeedHistoryService`): [how-to-seed-data.md](./how-to-seed-data.md)
- Module metadata: [module.metadata.md](./module.metadata.md)
