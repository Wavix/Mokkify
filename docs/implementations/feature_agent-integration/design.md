# Agent integration: API keys, composite mock builder, OpenAPI contract, verify loop

## Problem statement and context

Mokkify is configured entirely through its web UI or its already-existing
REST management API under `/backend/*` (endpoints, response templates,
relay templates, logs). Setting up a realistic mock today is a manual,
multi-step chore: a user creates a response template, optionally a relay
payload template, then an endpoint that references those by numeric id,
then manually fires requests and eyeballs the log tab to confirm behavior.

For AI agents (the team is standardized on MCP via `wavix-mcp-server`,
which is OpenAPI-first) this workflow is a poor fit for three reasons:

1. **No machine credential.** Auth is login/password → JWT only
   (`src/app/backend/auth/route.ts`, `src/app/services/user.service.ts`).
   An agent would have to store a human's password, and the token cannot
   be revoked or rotated independently of that password.
2. **Normalized model = orchestration burden.** Creating one working mock
   requires 3 id-linked calls (template → relay template → endpoint), so
   an agent must thread ids across calls and handle partial failure.
3. **No published contract.** Mokkify *imports* OpenAPI to generate
   endpoints (`src/app/services/openapi.service.ts`) but never *exports* a
   spec for its own `/backend/*` API, so no tool generator can consume it.

**Impact:** Agents cannot reliably configure or self-test mocks. Closing
these three gaps turns "describe the mock you want" into a one-shot,
verifiable agent action, while the existing UI flow is unchanged.

## Chosen approach: OpenAPI-first contract over the existing backend, unlocked by API keys

Four additive pillars, no rewrite of the mock engine or the UI:

1. **API keys** — a dedicated `ApiKey` credential accepted by the existing
   auth gate (`src/proxy.ts`) alongside user JWTs, managed from Settings.
2. **Composite `POST /backend/mock`** — creates response template (+ relay
   template) + endpoint atomically in one transaction from an inline spec.
3. **OpenAPI export** — a spec describing `/backend/*` served by the app,
   the single contract from which agent tools are generated.
4. **Verify loop** — one call that fires the mock via the public `/api/*`
   path and returns the response plus the freshly-written log row.

The MCP server is a **thin wrapper generated from the OpenAPI spec** (same
pattern as `wavix-mcp-server`), not a hand-maintained parallel tool set.

### Rationale

| Approach | Complexity | Risk | Recommendation |
|----------|-----------|------|----------------|
| OpenAPI-first contract + thin MCP wrapper over existing `/backend/*` | Medium | Low | **Chosen** |
| Hand-written MCP server duplicating each backend call | Medium | Medium | Rejected — two contracts drift; no reuse for non-Claude agents |
| In-app LLM "describe your mock" feature | High | High | Rejected — couples product to a model; duplicates what an external agent does better over the API |
| Expose raw `/backend/*` only, document it | Low | Medium | Rejected — leaves the 3-call orchestration and no-credential problems unsolved |

The existing `/backend/*` layer is already REST, Joi-validated, and
JWT-gated — so the marginal code is a credential type, one composite
endpoint, a spec file, and one convenience read. OpenAPI-first means a
single contract serves both MCP (Claude) and any other agent framework.

### Alternatives considered

1. **Agent-scoped JWT** (reuse `SignJWT` with `type: "agent"`) — rejected
   by the user in favor of dedicated keys: no independent revocation or
   rotation without changing `JWT_SECRET` (which invalidates all sessions).
2. **Hand-written MCP tools** — rejected: a second contract to keep in sync
   with `/backend/*`, and useless to non-MCP agent frameworks.
3. **In-app natural-language builder** — rejected as first move; only makes
   sense layered *on top of* this API later, not instead of it.

## Key design decisions

### DD-001: Dedicated `ApiKey` credential accepted in the existing auth gate

**Source:** ticket — user chose "Отдельные API-ключи" for the agent auth model
**Why:** Keys must be revocable and rotatable independently of any user password.

A new `ApiKey` model (id, `key_id`, name, secret hash, `is_active`,
`last_used_at`, `created_at`) is added. `src/proxy.ts` currently verifies
only a JWT; it is extended to also accept `Authorization: Bearer <api-key>`
— if JWT verification fails, it parses the presented key, looks up the row
by the indexed `key_id`, and passes when the row is active and the secret
matches (see DD-006 for the searchable-id + hash format). The `/backend/*`
matcher and the `/backend/auth` exemption are unchanged; API keys are
simply a second accepted credential.

### DD-002: New table created by `sequelize.sync`, no migration file

**Source:** derived — schema-management choice within scope
**Why:** The project has no migration runner in use; schema is synced from models.

`src/app/database/connect.ts` builds the schema via
`sequelize.sync({ alter })` on connect and `sync({ force })` on
`cli dbcreate`. Registering the `ApiKey` model in the `DB.models` map is
sufficient for the table to be created/altered — no migration file is
authored (the `src/app/migrations` dir referenced by `package.json` does
not currently exist).

### DD-003: OpenAPI spec is the canonical contract; MCP is generated from it

**Source:** derived — runtime choice left to the author over the user-selected "OpenAPI export" + MCP scope
**Why:** One contract avoids drift and serves both Claude/MCP and arbitrary agent frameworks.

The app serves an OpenAPI 3.1 document for `/backend/*` (including the new
`POST /backend/mock` and the verify route). The MCP server consumes that
spec to expose tools, mirroring `wavix-mcp-server`'s OpenAPI-first
generation, rather than defining tools by hand.

### DD-004: Composite `POST /backend/mock` creates template + endpoint atomically

**Source:** ticket — user selected "Composite create-mock" as an in-scope pillar
**Why:** A single transactional call removes id-threading and partial-failure handling from the agent.

A new route + `MockService` accept an inline spec (path, method, response
body/code/content_type/headers, optional relay target/method/payload). It
creates the `ResponseTemplate` (and `RelayPayloadTemplate` when relay is
requested) and the `Endpoint` inside one `sequelize.transaction()`, then
clears the endpoint cache (`cache.clear()`), returning the created endpoint.
It reuses the existing services (`TemplateService`, `EndpointService`,
`RelayService`) rather than reimplementing their logic.

### DD-005: Verify returns the synchronous mock response; log/relay is best-effort via a correlation id

**Source:** derived — implementation choice within the "Verify-loop tool" scope
**Why:** The mock's HTTP response is synchronous and authoritative, but logging is fire-and-forget and buffered, so a naïve "read the fresh log" would race the write and could return another request's row.

The mock engine records logs **fire-and-forget and buffered**:
`src/app/api/route.ts:124` calls `logWithRelay(...)` without awaiting it,
and `LogService.writeLog` pushes to a module-level buffer flushed every
`FLUSH_INTERVAL_MS` (300ms) or at `FLUSH_BUFFER_SIZE`
(`src/app/services/log.service.ts:26-98`). Therefore verify does **not**
depend on the log for its core result:

1. **Core result (authoritative, synchronous):** verify fires the request
   against the public `/api/<path>` engine (`src/app/api/route.ts`, already
   unauthenticated) and returns that HTTP response (status, body, headers)
   directly. This alone answers "does my mock respond as expected?"
2. **Relay/log enrichment (best-effort):** verify injects a unique
   correlation marker (`mokkify_verify_id`) into the fired request and
   registers a per-correlation waiter (`LogService.awaitLog`) **before**
   firing. The mock engine persists the log with a dedicated
   `logs.correlation` column; the next buffer flush resolves the waiter
   with that exact row (indexed exact-match, not a `LIKE` scan). If no
   row arrives within the wait timeout, the relay detail is returned as
   `pending`, never a foreign row.

No new mock-serving or template-rendering logic is added; verify
orchestrates the existing engine plus a correlation-keyed awaitable read.

> **Post-implementation note:** the shipped design replaced the original
> public-`flush()` + bounded-polling approach with an in-memory
> per-correlation waiter (`awaitLog`/`resolveWaiters`, `flush()` kept
> private) plus an indexed `logs.correlation` column. This removes the
> forced global flush and the ~360ms poll window. Trade-off: coordination
> is **process-local** — in a clustered/serverless deploy the log may be
> written by a worker without the waiter, returning a false `pending`.
> Acceptable under DD-002 (single-process SQLite).

### DD-006: Searchable key id + hashed secret; plaintext shown once at creation

**Source:** derived — security implementation detail within the API-key scope
**Why:** A leaked database must not expose usable credentials, yet a salted bcrypt hash is not directly searchable — so lookup needs a plaintext id and hash needs a comparable secret.

A key is generated server-side as `<key_id>.<secret>` and returned in
plaintext exactly once in the create response. Only `key_id` (indexed,
plaintext) and a bcrypt hash of `secret` are persisted (reusing `bcryptjs`,
already a dependency). `src/proxy.ts` splits the presented key, finds the
active row by `key_id`, then `bcrypt.compare`s the secret — avoiding a
full-table hash scan on every request.

### DD-007: MCP server lives in-repo as a separate package, generated from the spec

**Source:** derived — packaging choice within scope
**Why:** Co-locating keeps the spec and the generated tools versioned together; a separate package keeps it out of the Next.js build.

The MCP server is a self-contained subdirectory (e.g. `mcp/`) with its own
`package.json`, consuming the served OpenAPI spec and talking to a Mokkify
base URL with an API key over stdio transport.

**Addendum (2026-08-24, follow-up PR):** the app now also serves the same
spec-generated tool set over MCP streamable HTTP at `POST /mcp` (stateless,
`WebStandardStreamableHTTPServerTransport`), reusing `mcp/src/openapi.ts` and
`mcp/src/client.ts` via the `@mcp/*` alias so tool generation stays
single-sourced. The stdio package remains for clients without HTTP transport
and for offline inspection; the HTTP endpoint is the recommended default.

## Component interfaces and boundaries

### `src/proxy.ts` — accept API keys alongside JWT

**Before:**

```typescript
const token = request.headers.get("Authorization") || url.searchParams.get("token") || ""
try {
  const jwtToken = token.split(" ").pop()
  await jwtVerify(jwtToken, new TextEncoder().encode(appConfig.jwtSecret))
  return NextResponse.next()
} catch {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

**After (shape):**

```typescript
const token = presentedToken(request, url)
if (await isValidJwt(token)) return NextResponse.next()
if (await isValidApiKey(token)) return NextResponse.next()   // key_id lookup + bcrypt.compare, active only
return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

### `POST /backend/mock` — composite create (new)

**Request (shape):**

```jsonc
{
  "title": "DLR webhook",
  "path": "dlr",
  "method": "POST",
  "response": { "code": 200, "content_type": "application/json", "body": "{\"ok\":true}" },
  "relay": { "target": "https://client/callback", "method": "POST", "body": "{\"id\":\"@request.message_id\"}" }
}
```

Response: the created endpoint (same shape as `POST /backend/endpoint`).

### Scope

- **Files created:**
  - `src/app/database/models/api-key.model.ts`,
    `src/app/database/interfaces/api-key.interface.ts`
  - `src/app/services/api-key.service.ts`, `src/app/services/mock.service.ts`
  - `src/app/backend/api-key/route.ts`,
    `src/app/backend/api-key/[keyId]/route.ts`
  - `src/app/backend/mock/route.ts`, `src/app/backend/mock/validation.ts`
  - `src/app/backend/mock/[endpointId]/verify/route.ts`
  - `public/openapi.yaml` + `src/app/openapi/route.ts` (served ungated)
  - `mcp/` package (generated-from-spec MCP server)
  - `src/ui/sections/Settings/ApiKeys.tsx` + `src/ui/api/api-keys.ts`
- **Files modified:**
  - `src/proxy.ts` (accept API keys)
  - `src/app/database/models/index.ts`,
    `src/app/database/connect.ts` (register `ApiKey`)
  - `src/app/services/index.ts` (export new services)
  - `src/app/services/log.service.ts` (add `awaitLog`/`resolveWaiters` for
    a per-correlation awaitable read; add an exact `correlation` filter to
    `getEndpointLogs`)
  - `src/app/database/models/log.model.ts` (add an indexed nullable
    `correlation` column)
- **No changes** to the mock engine's request path (`src/app/api/route.ts`
  stays fire-and-forget on logging), the template/relay services' core
  logic, the response-template variable system, or the existing UI JWT
  login flow.

## Testing strategy

The repo has **no test framework** today (`package.json` has no `test`
script and no jest/vitest dependency). Adding one is out of scope; primary
gates are the project's existing checks plus scripted integration checks.

### Type + lint gates

`pnpm type` (`tsc --noEmit`) and `pnpm lint` (ESLint) must pass — the
project's only automated gates. Note `pnpm lint` runs `eslint ./src`
(`package.json:9`) and so does **not** cover the separate `mcp/` package;
that package ships its own `type` + `lint` scripts, run as their own gate.
New Joi schemas type-check against the service inputs.

### OpenAPI contract gate

A reproducible `openapi:validate` script (spec validator, e.g.
`@redocly/cli` or `swagger-cli`) validates the served spec in CI/local —
not an ad-hoc manual step — plus a coverage check comparing `/backend/*`
route directories against the spec's declared paths so a new route cannot
silently drift from the contract.

### Scripted integration verification (curl / node script)

Against a locally-run instance (`pnpm dev`, `pnpm cli dbcreate`,
`pnpm cli useradd`):

1. Create an API key via `POST /backend/api-key` (JWT-authed); confirm the
   plaintext is returned once and the DB stores only a hash.
2. Call `POST /backend/mock` with the key; confirm one endpoint + its
   template(s) exist and the call is rejected with an invalid/revoked key.
3. Fire the verify route; confirm it returns the mock response
   synchronously, and that the correlated log/relay row is returned (or
   `pending`) — never a foreign concurrent row. Fire two requests
   concurrently and confirm each verify result carries its own row.
4. Run `pnpm openapi:validate`; confirm every `/backend/*` route is present
   in the spec, then confirm the MCP server boots and its tool count
   matches the spec's operation count (generation, not hand-authoring).

### Regression check

Confirm the UI still logs in and manages endpoints with a JWT (API-key
support is additive, not a replacement) — DD-001 must not break existing
credential handling.

## Exit Criteria

### EC-001: API-key auth works and is stored safely

- **Assertion:** A valid active API key passes the `/backend/*` gate; an invalid/revoked key gets 401; the DB never stores plaintext secrets; the `api_keys` table is created by `sequelize.sync`.
- **Evidence target:** `src/proxy.ts` accepts `Bearer <api-key>` via `key_id` lookup + `bcrypt.compare` + `src/app/services/api-key.service.ts` stores only `key_id` + secret hash + `ApiKey` registered in `src/app/database/models/index.ts` and `src/app/database/connect.ts` (`sync` creates the table) + scripted check "invalid/revoked key → 401".
- **Realized by:** DD-001, DD-002, DD-006

### EC-002: One call builds a complete, working mock atomically

- **Assertion:** `POST /backend/mock` creates template(s) + endpoint in a single transaction and rolls back fully on any failure.
- **Evidence target:** `src/app/backend/mock/route.ts` + `src/app/services/mock.service.ts` wrap creation in `sequelize.transaction()` and call `cache.clear()` + scripted check "partial input → no orphan rows".
- **Realized by:** DD-004

### EC-003: A published OpenAPI contract drives generated agent tools

- **Assertion:** The app serves a valid OpenAPI 3.1 spec covering every `/backend/*` route (incl. mock + verify), and the MCP server's tools are generated from that spec (not hand-authored).
- **Evidence target:** `public/openapi.yaml` served by `src/app/openapi/route.ts` passes `pnpm openapi:validate` + a coverage check maps each `src/app/backend/**/route.ts` to a spec path + `mcp/` boots and its tool count equals the spec's operation count.
- **Realized by:** DD-003, DD-007

### EC-004: Verify returns the synchronous response and the correlated (not foreign) log

- **Assertion:** The verify call returns the mock's HTTP response synchronously, and any log/relay detail it returns is the correlated row for that exact request (or `pending`) — never another concurrent request's row.
- **Evidence target:** `src/app/backend/mock/[endpointId]/verify/route.ts` returns the direct `/api/*` response + awaits its correlated row via `LogService.awaitLog` keyed on the indexed `logs.correlation` column (`src/app/services/log.service.ts`) + scripted concurrent-fire check shows each verify result carries its own correlated row.
- **Realized by:** DD-005

### EC-005: Existing UI JWT flow is unregressed

- **Assertion:** UI login and endpoint management over a user JWT continue to work unchanged.
- **Evidence target:** `src/proxy.ts` still passes valid JWTs first + regression check "UI login + list endpoints succeeds".
- **Realized by:** DD-001

## Open decisions

| Decision | State | Resolved by / where | Notes |
|----------|-------|---------------------|-------|
| Per-key scopes / RBAC (read-only vs write keys) | OPEN | follow-up ticket | First iteration: a key grants the same access as a logged-in user; finer scopes deferred to avoid scope creep |
| Rate limiting / abuse protection on `/backend/*` for keys | OPEN | follow-up ticket | Not required for the initial agent workflow; revisit if keys are exposed beyond trusted agents |
| Agent runtime target (MCP vs any framework) | RESOLVED | DD-003 (user deferred to author) | OpenAPI-first contract serves both; MCP is a thin generated wrapper |
| MCP server distribution (in-repo vs published npm) | RESOLVED | DD-007 | In-repo `mcp/` package for the first iteration |
