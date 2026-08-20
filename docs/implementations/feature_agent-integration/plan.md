# Agent integration — Implementation Plan

> **For agentic workers:** Use `/flow:implement` to execute this plan
> task-by-task (one Sonnet subagent per task, with Opus orchestration).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An AI agent can authenticate with a revocable API key, create a
complete mock in one call, discover the management API from a served
OpenAPI spec (via a generated MCP server), and verify a mock with a single
call that returns the response plus its correlated log.

**Architecture:** Four additive pillars over the existing Joi-validated
`/backend/*` REST layer — a dedicated `ApiKey` credential accepted in
`src/proxy.ts`, a transactional `POST /backend/mock` composite builder, a
served OpenAPI 3.1 contract feeding an in-repo `mcp/` server, and a verify
route that returns the synchronous mock response with a correlation-matched
log row. The mock engine's request path is untouched.

**Tech Stack:** Next.js 16, TypeScript, Sequelize + SQLite, Joi, bcryptjs,
`@modelcontextprotocol/sdk`, OpenAPI 3.1.

---

## Preconditions

- No database migration is required: schema is created by
  `sequelize.sync({ alter })` in `src/app/database/connect.ts:38-51`;
  registering the new `ApiKey` model is sufficient (design DD-002).
- No new test framework is added — the repo has none
  (`package.json` has no `test` script). Per-task verification is
  `pnpm type` + `pnpm lint` + `pnpm format`; end-to-end behavior is
  checked by the scripted Task 10 against a locally-run instance.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/database/interfaces/api-key.interface.ts` | `ApiKey` attribute/instance/model types |
| Create | `src/app/database/models/api-key.model.ts` | `api_keys` Sequelize model (key_id, secret hash, is_active, last_used_at) |
| Modify | `src/app/database/models/index.ts:1-6` | Export `ApiKey` model |
| Modify | `src/app/database/connect.ts:20-28` | Register `ApiKey` in `DB.models` |
| Create | `src/app/services/api-key.service.ts` | Generate `<key_id>.<secret>`, hash, create/list/revoke/toggle, verify |
| Modify | `src/app/services/index.ts:1-14` | Export `ApiKeyService`, `MockService` |
| Modify | `src/proxy.ts:16-31` | Accept `Bearer <api-key>` alongside JWT |
| Create | `src/app/backend/api-key/route.ts` | `GET` list, `POST` create (plaintext once) |
| Create | `src/app/backend/api-key/[keyId]/route.ts` | `DELETE` revoke, `PATCH` toggle active |
| Create | `src/ui/api/api-keys.ts` | Frontend API client for key CRUD |
| Create | `src/ui/sections/Settings/ApiKeys.tsx` | Settings section: list/create/revoke keys |
| Modify | `src/ui/sections/Settings/index.tsx:16-41` | Add `api-keys` slug + nav link |
| Create | `src/app/services/mock.service.ts` | Transactional composite create (template + relay + endpoint) |
| Create | `src/app/backend/mock/route.ts` | `POST /backend/mock` composite endpoint |
| Create | `src/app/backend/mock/validation.ts` | Joi schema for composite mock payload |
| Modify | `src/app/services/log.service.ts:100-146` | Promote `flush()` to public; add `correlation` filter |
| Modify | `src/types/common.d.ts:50-56` | Add `correlation` to `LogListFilters` |
| Modify | `src/app/backend/log/route.ts:19-25` | Pass `correlation` query param into filters |
| Create | `src/app/backend/mock/[endpointId]/verify/route.ts` | Fire mock + flush + correlated log read |
| Create | `public/openapi.yaml` | OpenAPI 3.1 contract for `/backend/*` |
| Create | `src/app/openapi/route.ts` | Serve the spec (ungated path, no auth) |
| Create | `scripts/check-openapi-coverage.mjs` | Assert every `/backend/**/route.ts` has a spec path |
| Modify | `package.json:6-16` | Add `openapi:validate` script + validator devDep |
| Create | `mcp/package.json` | MCP server package manifest |
| Create | `mcp/tsconfig.json` | MCP server TS config |
| Create | `mcp/src/index.ts` | stdio MCP server: spec → tools → proxy to Mokkify |
| Create | `mcp/README.md` | MCP server usage (base URL + API key env) |

---

## Task 1: API key model and service

**Files:**

- Create: `src/app/database/interfaces/api-key.interface.ts`
- Create: `src/app/database/models/api-key.model.ts`
- Modify: `src/app/database/models/index.ts:1-6`
- Modify: `src/app/database/connect.ts:20-28`
- Create: `src/app/services/api-key.service.ts`
- Modify: `src/app/services/index.ts:1-14`

**Context:** The foundation for machine auth — a revocable credential
stored as an indexed `key_id` plus a bcrypt hash of the secret, so lookup
is a single indexed read followed by `bcrypt.compare` (no full-table scan).

**Covers:** DD-001, DD-002, DD-006

**Dependencies:** None

- [ ] **Step 1.1: Create the interface**

  ```typescript
  // src/app/database/interfaces/api-key.interface.ts
  import type Sequelize from "sequelize"
  import type { Model, Optional } from "sequelize"

  export interface ApiKeyAttributes {
    id: number
    key_id: string
    name: string
    secret_hash: string
    is_active: boolean
    last_used_at: Date | null
    created_at: Date
  }

  export type ApiKeyCreationAttributes = Optional<
    ApiKeyAttributes,
    "id" | "last_used_at" | "created_at" | "is_active"
  >

  export interface ApiKeyInstance
    extends Model<ApiKeyAttributes, ApiKeyCreationAttributes>,
      ApiKeyAttributes {}
  export type ApiKeyModel = Sequelize.ModelStatic<ApiKeyInstance>
  ```

- [ ] **Step 1.2: Create the model**

  Mirror `src/app/database/models/user.model.ts` structure
  (`timestamps: false`, `underscored: true`, `createdAt: "created_at"`).
  Columns: `id` (PK autoIncrement), `key_id` (STRING, unique index,
  allowNull false), `name` (STRING), `secret_hash` (STRING), `is_active`
  (BOOLEAN, defaultValue true), `last_used_at` (DATE, allowNull true),
  `created_at` (DATE, defaultValue NOW). Add `indexes: [{ fields:
  ["key_id"], unique: true }]`.

- [ ] **Step 1.3: Register the model**

  ```typescript
  // src/app/database/models/index.ts — add:
  export { ApiKey } from "./api-key.model"
  ```

  ```typescript
  // src/app/database/connect.ts — add to DB.models (after line 26):
  ApiKey: Models.ApiKey(sequelize, DataTypes)
  ```

  Also add `ApiKey: ApiKeyModel` to the `Models`/`Db` type in
  `src/app/database/interfaces/database.interface.ts` (read it first for
  exact shape).

- [ ] **Step 1.4: Create `ApiKeyService`**

  ```typescript
  // src/app/services/api-key.service.ts — key methods:
  // generate(): { key_id, secret } — key_id = short random id, secret = 32+ byte random
  // createKey(name): returns { plaintext: `${key_id}.${secret}`, key: {id,name,...} }
  //   -> bcrypt.hash(secret); persist { key_id, name, secret_hash }
  // list(): rows WITHOUT secret_hash
  // revoke(id) / setActive(id, active)
  // verify(presented: string): boolean
  //   -> const [key_id, secret] = presented.split("."); find active by key_id;
  //      bcrypt.compare(secret, row.secret_hash); on match update last_used_at; return bool
  ```

  Reuse `bcryptjs` (already a dependency) and `import { DB } from "../database"`.

- [ ] **Step 1.5: Export the service**

  ```typescript
  // src/app/services/index.ts — add:
  export { ApiKeyService } from "./api-key.service"
  ```

  `MockService` is exported in Task 5 when its file exists, keeping this
  task's `pnpm type` self-verifiable.

- [ ] **Step 1.6: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 type errors, 0 lint errors.

- [ ] **Step 1.7: Commit**

  ```bash
  git add src/app/database/interfaces/api-key.interface.ts src/app/database/models/api-key.model.ts src/app/database/models/index.ts src/app/database/connect.ts src/app/database/interfaces/database.interface.ts src/app/services/api-key.service.ts src/app/services/index.ts
  git commit -m "feat: add ApiKey model and service for agent auth"
  ```

---

## Task 2: Accept API keys in the auth gate

**Files:**

- Modify: `src/proxy.ts:16-31`

**Context:** Extend the existing `/backend/*` gate so an API key is a
second accepted credential; JWT is tried first, unchanged.

**Covers:** DD-001, DD-006

**Dependencies:** Task 1

- [ ] **Step 2.1: Extend `backedAuth`**

  ```typescript
  // Before (lines 21-30):
  const token = request.headers.get("Authorization") || url.searchParams.get("token") || ""
  try {
    const jwtArray = token.split(" ")
    const jwtToken = jwtArray[jwtArray.length - 1]
    await jwtVerify(jwtToken, new TextEncoder().encode(appConfig.jwtSecret))
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // After:
  const token = request.headers.get("Authorization") || url.searchParams.get("token") || ""
  const presented = token.split(" ").pop() || ""
  try {
    await jwtVerify(presented, new TextEncoder().encode(appConfig.jwtSecret))
    return NextResponse.next()
  } catch {
    // not a valid JWT — fall through to API-key check
  }
  if (await new ApiKeyService().verify(presented)) return NextResponse.next()
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  ```

  Add `import { ApiKeyService } from "@/app/services"`. Confirm the DB is
  connected in this path (call `dbConnect()` if `!DB.connected`, mirroring
  `src/app/api/route.ts:78`).

- [ ] **Step 2.2: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 errors.

- [ ] **Step 2.3: Commit**

  ```bash
  git add src/proxy.ts
  git commit -m "feat: accept API keys in the backend auth gate"
  ```

---

## Task 3: API key management routes

**Files:**

- Create: `src/app/backend/api-key/route.ts`
- Create: `src/app/backend/api-key/[keyId]/route.ts`

**Context:** CRUD used by the Settings UI and available to agents. Create
returns the plaintext key exactly once.

**Covers:** DD-001, DD-006

**Dependencies:** Task 1

- [ ] **Step 3.1: Create list + create route**

  ```typescript
  // src/app/backend/api-key/route.ts
  // GET  -> NextResponse.json({ keys: await service.list() })
  // POST -> body { name }; const created = await service.createKey(name)
  //         return NextResponse.json({ key: created.key, plaintext: created.plaintext })
  ```

  Follow the shape of `src/app/backend/endpoint/route.ts` (use
  `getBodyPayload` from `../helpers`, Joi-validate `{ name: string }`).

- [ ] **Step 3.2: Create revoke/toggle route**

  ```typescript
  // src/app/backend/api-key/[keyId]/route.ts
  // DELETE -> service.revoke(Number(params.keyId))
  // PATCH  -> body { is_active }; service.setActive(id, is_active)
  ```

  Use `NextQuery` params pattern from
  `src/app/backend/endpoint/[endpointId]/log/route.ts:8-9`.

- [ ] **Step 3.3: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 errors.

- [ ] **Step 3.4: Commit**

  ```bash
  git add src/app/backend/api-key/
  git commit -m "feat: add API key management routes"
  ```

---

## Task 4: API keys section in Settings UI

**Files:**

- Create: `src/ui/api/api-keys.ts`
- Create: `src/ui/sections/Settings/ApiKeys.tsx`
- Modify: `src/ui/sections/Settings/index.tsx:16-41`

**Context:** Let users manage agent keys from the UI. The plaintext key is
shown once in a copyable field after creation.

**Covers:** DD-001

**Dependencies:** Task 3

- [ ] **Step 4.1: Create the API client**

  Mirror `src/ui/api/settings.ts` (uses `getAuthToken()` from
  `./helpers`). Methods: `list()`, `create(name)`, `revoke(id)`,
  `toggle(id, isActive)` hitting `/backend/api-key*`.

- [ ] **Step 4.2: Create the section component**

  `ApiKeys.tsx` — table of keys (name, key_id, is_active, last_used_at)
  with create + revoke actions; render the returned plaintext once in a
  copyable dialog. Follow `General.tsx` props (`{ token }`).

- [ ] **Step 4.3: Wire into Settings nav**

  ```tsx
  // src/ui/sections/Settings/index.tsx
  // getContent(): add case "api-keys": return <SettingsApiKeys token={token} />
  // Nav: add a second SideMenu.Link -> router.push("/settings/api-keys", ...)
  // Set isActive per router.query.slug instead of hardcoded true.
  ```

- [ ] **Step 4.4: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 errors.

- [ ] **Step 4.5: Commit**

  ```bash
  git add src/ui/api/api-keys.ts src/ui/sections/Settings/ApiKeys.tsx src/ui/sections/Settings/index.tsx
  git commit -m "feat: manage API keys from Settings UI"
  ```

---

## Task 5: Composite mock builder

**Files:**

- Create: `src/app/services/mock.service.ts`
- Create: `src/app/backend/mock/route.ts`
- Create: `src/app/backend/mock/validation.ts`
- Modify: `src/app/services/index.ts` (add `MockService` export)

**Context:** One call creates the response template (+ optional relay
payload template) and the endpoint atomically, removing id-threading and
partial-failure handling from the agent.

**Covers:** DD-004

**Dependencies:** Task 1

- [ ] **Step 5.1: Create the Joi schema**

  ```typescript
  // src/app/backend/mock/validation.ts
  // { title, path, method(enum), response: { code, content_type?, headers?, body },
  //   relay?: { target, method(enum), body? }, max_pending_time? }
  ```

  Reuse the method enum and response-field rules from
  `src/app/backend/endpoint/validation.ts` and
  `src/app/backend/template/validation.ts`.

- [ ] **Step 5.2: Create `MockService`**

  ```typescript
  // src/app/services/mock.service.ts
  // createMock(payload):
  //   const t = await DB.sequelize.transaction()
  //   try {
  //     const responseTemplate = await DB.models.ResponseTemplate.create({...}, { transaction: t })
  //     let relayId = null
  //     if (payload.relay) { const rp = await DB.models.RelayPayloadTemplate.create({...}, { transaction: t }); relayId = rp.id }
  //     const endpoint = await DB.models.Endpoint.create({
  //       ...path/method/title, response_template_id: responseTemplate.id,
  //       relay_enabled: !!payload.relay, relay_target, relay_method, relay_payload_template_id: relayId,
  //       is_multiple_templates: false, user_id: 1, uuid: v4()
  //     }, { transaction: t })
  //     await t.commit(); return endpoint
  //   } catch (e) { await t.rollback(); throw e }
  ```

  Reuse the path-normalization rule from `EndpointService.getPayload`
  (strip leading `/`).

- [ ] **Step 5.3: Create the route**

  ```typescript
  // src/app/backend/mock/route.ts
  // POST -> getBodyPayload -> schema.validate -> MockService.createMock -> cache.clear()
  //      -> NextResponse.json({ endpoint })
  ```

  Import `cache` from `../../cache` and mirror error handling in
  `src/app/backend/endpoint/route.ts:23-38`.

- [ ] **Step 5.4: Add the `MockService` export**

  ```typescript
  // src/app/services/index.ts — add:
  export { MockService } from "./mock.service"
  ```

- [ ] **Step 5.5: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 errors.

- [ ] **Step 5.6: Commit**

  ```bash
  git add src/app/services/mock.service.ts src/app/services/index.ts src/app/backend/mock/route.ts src/app/backend/mock/validation.ts
  git commit -m "feat: add composite POST /backend/mock builder"
  ```

---

## Task 6: Log correlation filter and public flush

> **Superseded during implementation** (commit `45d6088`): shipped as a
> per-correlation in-memory waiter (`LogService.awaitLog`/`resolveWaiters`,
> `flush()` kept **private**) plus an indexed nullable `logs.correlation`
> column — not a public `flush()` + polling. The exact-match filter reads
> the `correlation` column, not a `LIKE` on `url`. Steps below reflect the
> original blueprint; see design.md DD-005 post-implementation note.

**Files:**

- Modify: `src/app/services/log.service.ts:100-146`
- Modify: `src/types/common.d.ts:50-56`
- Modify: `src/app/backend/log/route.ts:19-25`
- Modify: `src/app/database/models/log.model.ts` (indexed `correlation` column)

**Context:** Verification must read the exact log row for its own request.
Logging is fire-and-forget and buffered (`log.service.ts:26,89-97`), so
verify needs a correlation-keyed awaitable read.

**Covers:** DD-005

**Dependencies:** None

- [ ] **Step 6.1: Promote `flush()` to public**

  ```typescript
  // src/app/services/log.service.ts:100 — change signature:
  // Before: private async flush(): Promise<void>
  // After:  public async flush(): Promise<void>
  ```

- [ ] **Step 6.2: Add the `correlation` filter**

  In `getEndpointLogs` `where` (lines 126-142), add:

  ```typescript
  ...(filters.correlation && { url: { [Op.like]: `%${filters.correlation}%` } })
  ```

  The correlation token is carried in the request URL query string and
  stored in the TEXT `url` column (`log.model.ts:18-19`), so `LIKE` on it
  is exact enough for a namespaced UUID.

- [ ] **Step 6.3: Extend the filter type and route**

  ```typescript
  // src/types/common.d.ts — add to LogListFilters:
  correlation: string
  ```

  ```typescript
  // src/app/backend/log/route.ts — add to filters object (after line 24):
  ...(url.searchParams.get("correlation") && { correlation: url.searchParams.get("correlation") || "" })
  ```

- [ ] **Step 6.4: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 errors.

- [ ] **Step 6.5: Commit**

  ```bash
  git add src/app/services/log.service.ts src/types/common.d.ts src/app/backend/log/route.ts
  git commit -m "feat: add log correlation filter and public flush"
  ```

---

## Task 7: Verify route

**Files:**

- Create: `src/app/backend/mock/[endpointId]/verify/route.ts`

**Context:** A single call that fires the mock and returns the synchronous
response plus the correlated log row (or `pending`), never a foreign row.

**Covers:** DD-005

**Dependencies:** Task 5, Task 6

- [ ] **Step 7.1: Implement the verify handler**

  ```typescript
  // POST body: { method?, query?, body?, headers? }
  // 1. Load endpoint via EndpointService.getEndpointById(params.endpointId)
  // 2. correlation = v4(); build the public mock URL:
  //    `${origin}/api/${endpoint.path}?...query&mokkify_verify_id=${correlation}`
  // 3. const res = await fetch(mockUrl, { method, headers, body })  // synchronous, authoritative
  //    const responseBody = await res.text()
  // 4. await new LogService().flush()
  // 5. poll getEndpointLogs({ correlation }) up to ~4 times over ~400ms (>FLUSH_INTERVAL_MS)
  //    -> const log = first matching row, else null
  // 6. return { response: { status: res.status, body: responseBody, headers }, log: log ?? { pending: true } }
  ```

  `origin` from `new URL(request.url).origin`. The `mokkify_verify_id`
  param is namespaced to avoid colliding with template `@request.*` vars.

- [ ] **Step 7.2: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm format
  ```

  Expected: 0 errors.

- [ ] **Step 7.3: Commit**

  ```bash
  git add src/app/backend/mock/
  git commit -m "feat: add mock verify route (response + correlated log)"
  ```

---

## Task 8: OpenAPI contract and validation

**Files:**

- Create: `public/openapi.yaml`
- Create: `src/app/openapi/route.ts`
- Create: `scripts/check-openapi-coverage.mjs`
- Modify: `package.json:6-16`

**Context:** The single contract for agent tooling. A reproducible
validation + coverage gate keeps routes and spec from drifting.

**Covers:** DD-003

**Dependencies:** Task 3, Task 5, Task 7

- [ ] **Step 8.1: Author `public/openapi.yaml`**

  OpenAPI 3.1 documenting every `/backend/*` route: auth, endpoint,
  template, relay, log, stats, settings, api-key, mock, mock verify. Use
  `bearerAuth` (`http`/`bearer`) security scheme. Enumerate request/response
  schemas from the Joi validators and route JSON shapes.

- [ ] **Step 8.2: Serve the spec (ungated, no auth)**

  ```typescript
  // src/app/openapi/route.ts
  // GET -> read public/openapi.yaml, parse with js-yaml, return NextResponse.json(spec)
  ```

  The proxy matcher is `/backend/:path*` (`src/proxy.ts:9`), so a route
  under `src/app/openapi/` is outside the auth gate — no `proxy.ts` change
  needed. `js-yaml` is already a dependency.

- [ ] **Step 8.3: Coverage script**

  ```javascript
  // scripts/check-openapi-coverage.mjs
  // - glob src/app/backend/**/route.ts -> derive /backend/<path> for each
  // - parse public/openapi.yaml paths
  // - exit 1 listing any backend route missing from the spec
  ```

- [ ] **Step 8.4: Add scripts + validator dep**

  ```jsonc
  // package.json scripts:
  "openapi:validate": "redocly lint public/openapi.yaml && node scripts/check-openapi-coverage.mjs"
  // devDependencies: add "@redocly/cli"
  ```

  Run `pnpm add -D @redocly/cli`.

- [ ] **Step 8.5: Verify**

  ```bash
  pnpm type && pnpm lint && pnpm openapi:validate
  ```

  Expected: spec valid, 0 uncovered `/backend/*` routes.

- [ ] **Step 8.6: Commit**

  ```bash
  git add public/openapi.yaml src/app/openapi/route.ts scripts/check-openapi-coverage.mjs package.json pnpm-lock.yaml
  git commit -m "feat: serve OpenAPI spec for the backend API with a validate gate"
  ```

---

## Task 9: MCP server package

**Files:**

- Create: `mcp/package.json`
- Create: `mcp/tsconfig.json`
- Create: `mcp/src/index.ts`
- Create: `mcp/README.md`

**Context:** A thin stdio MCP server that loads the OpenAPI spec and
exposes one tool per operation, proxying to a Mokkify base URL with an API
key — generated from the spec, not hand-authored (DD-003, DD-007).

**Covers:** DD-003, DD-007

**Dependencies:** Task 8

- [ ] **Step 9.1: Scaffold the package**

  `mcp/package.json` with `@modelcontextprotocol/sdk`, a YAML/JSON spec
  loader, and `type`/`lint`/`build`/`start` scripts (self-contained; not
  covered by the root `eslint ./src`). `mcp/tsconfig.json` standalone.

- [ ] **Step 9.2: Implement the server**

  ```typescript
  // mcp/src/index.ts
  // - read MOKKIFY_BASE_URL and MOKKIFY_API_KEY from env
  // - fetch `${base}/openapi` (or read bundled spec)
  // - for each path+method operation: register an MCP tool
  //   (name = operationId, input schema = operation params/body)
  //   whose handler does fetch(base+path, { method, Authorization: `Bearer ${key}`, body })
  // - expose over StdioServerTransport
  ```

- [ ] **Step 9.3: Document usage**

  `mcp/README.md`: env vars, how to register with Claude/`wavix-mcp-server`
  pattern, example "create then verify a mock" flow.

- [ ] **Step 9.4: Verify**

  ```bash
  cd mcp && pnpm install && pnpm type && pnpm lint && pnpm build
  ```

  Expected: builds; server boots and lists a tool count equal to the
  spec's operation count.

- [ ] **Step 9.5: Commit**

  ```bash
  git add mcp/
  git commit -m "feat: add MCP server generated from the OpenAPI spec"
  ```

---

## Task 10: End-to-end scripted verification

**Files:** [no-code]

**Context:** Exercise the full agent workflow against a locally-run
instance (design testing strategy). No production code changes.

**Covers:** DD-NONE

**Dependencies:** Task 9

- [ ] **Step 10.1: Start a local instance**

  ```bash
  pnpm cli dbcreate && pnpm cli useradd admin admin && pnpm dev
  ```

  Expected: server on `http://localhost:3000`, DB created.

- [ ] **Step 10.2: API key lifecycle**

  Log in (`POST /backend/auth`) to get a JWT; `POST /backend/api-key`
  `{ name }`; confirm plaintext returned once and DB stores only a hash;
  confirm an invalid/revoked key → 401 on a `/backend/*` call.

  Expected: valid key passes, invalid/revoked → 401.

- [ ] **Step 10.3: Composite create + atomicity**

  `POST /backend/mock` with the key; confirm one endpoint + its template(s)
  exist; send a deliberately invalid payload and confirm no orphan template
  rows remain (rollback).

  Expected: valid → endpoint created; invalid → no partial rows.

- [ ] **Step 10.4: Verify loop + concurrency**

  Fire the verify route; confirm the synchronous mock response and the
  correlated log row. Fire two requests concurrently; confirm each verify
  result carries its own row, never a foreign one.

  Expected: each verify returns its own correlated row (or `pending`).

- [ ] **Step 10.5: Contract + MCP**

  ```bash
  pnpm openapi:validate
  ```

  Then boot the MCP server against the instance and confirm its tool count
  equals the spec's operation count.

  Expected: spec valid, all `/backend/*` routes covered, tools generated.

---

## Summary

| Task | Files modified | LOC changed | Dependencies |
|------|---------------|-------------|--------------|
| Task 1 | model/interface/service (+3 edits) | +160 | None |
| Task 2 | `src/proxy.ts` | +8 / -6 | Task 1 |
| Task 3 | `api-key/` routes | +90 | Task 1 |
| Task 4 | Settings UI (+1 edit) | +160 | Task 3 |
| Task 5 | `mock.service.ts`, `mock/` route + validation | +120 | Task 1 |
| Task 6 | `log.service.ts`, `common.d.ts`, `log/route.ts` | +6 / -1 | None |
| Task 7 | `mock/[endpointId]/verify/route.ts` | +70 | Task 5, 6 |
| Task 8 | `openapi.yaml`, spec route, coverage script, `package.json` | +250 | Task 3, 5, 7 |
| Task 9 | `mcp/` package | +200 | Task 8 |
| Task 10 | [no-code] verification | 0 | Task 9 |
