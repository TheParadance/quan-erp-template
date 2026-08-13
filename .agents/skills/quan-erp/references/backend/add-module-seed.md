# Add module seed (local development only)

Insert a row into the `module` table so a plugin appears in the local Quan ERP
dev database.

> [!IMPORTANT]
> **Development setup only.** Read DB connection values from
> `base/backend/.env`. Never run this against UAT/prod, remote hosts, or any DB
> that is not the local developing setup.

## When to use

- User asks to seed / insert / register a module for local plugin development
- A new plugin exists under `plugins/<name>/` and needs a `module` row
- User points at the README module `INSERT` pattern

## Prerequisites

- Local developing setup is active (`prepare-local-dev.sh` / local core workflow)
- `psql` available
- Postgres reachable with values from `base/backend/.env`

## DB credentials (from `base/backend/.env`)

Read these keys (do **not** hardcode passwords in the skill or commits):

| Env key | Use |
|---|---|
| `DB_HOST` | host (expect `localhost` for local/dev) |
| `DB_PORT` | port |
| `DB_USERNAME` | user |
| `DB_PASSWORD` | password |
| `DB_SCHEMA` | database name |

**Guardrails before connecting:**

1. Confirm `DB_HOST` is a local/dev host (`localhost` / `127.0.0.1`).
2. If host is not local, **stop** and ask the user — this flow is local/dev only.
3. Prefer loading password via `PGPASSWORD` from `.env` for the shell call; do not echo it into chat logs unnecessarily.

Example (after reading `.env`):

```bash
# From repo root — substitute values read from base/backend/.env
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

1. Confirm the target is **local developing** DB via `base/backend/.env`.
2. Identify the plugin (`plugins/<name>/module.metadata.json` and/or user-provided values).
3. Ask for `displayName` if not provided.
4. Check whether the module row already exists.
5. Run the `INSERT` with `psql` using `.env` credentials.
6. Verify with a `SELECT` and report `id` / `name` / `displayName` to the user.

One-shot example:

```bash
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_SCHEMA" -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO module
("name","displayName","description","unInstallable","module_entry_object","plugin_version","dependencies","base_version","version")
VALUES
('reward-point','Reward Point','Reward point management plugin',true,'Module','1.0.0','{}','1.0.0',1);
SQL
```

## Do not

- Seed UAT/prod or non-local databases
- Commit `.env`, passwords, or connection dumps
- Invent extra columns beyond the README seed shape unless the live `\d module` schema requires it
- Skip the existence check when seeding a known plugin name

## Related

- Plugin data seeding (`@OnInit` / `DataSeedHistoryService`): [how-to-seed-data.md](./how-to-seed-data.md)
- Module metadata: [module.metadata.md](./module.metadata.md)
