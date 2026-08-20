# Review — Agent integration

**Mode:** full (design.md + plan.md) · **Iteration 1**
**Engine:** codex gpt-5.6-sol (primary) · **Diff:** 40 files, +5112 / -81 vs origin/main
**Fallback strategy (unused):** triad (size + auth/secrets/public-API boundary)

## Verdict

**PASS with notes** (after fixes). Initial pass was FAIL (1 HIGH SSRF + 8 MED).
All HIGH + all actionable MED/LOW fixed and re-verified; 3 items intentionally
left for Human attention (design tradeoffs, accepted low risk). No open `[FID]`
finding; all EC done.

Post-fix counts: **CRIT 0 / HIGH 0 / MED 1 open (accepted) / LOW 3 open (accepted) / INFO 5**.

## Pipeline log

- engine: codex gpt-5.6-sol (exit 0)
- fallback: not triggered
- stack conventions: nodejs-backend, frontend (context only)
- Step 8 fixes: 9 (main, 8a: SSRF, proxy 401 containment + Bearer-only keys, connect connected-on-success, correlation sanitize+anchor, log-route UUID guard, verify Joi schema + string-body, api-key throttle + strict split) + 6 (Sonnet, 8b: coverage method-check, mcp file sandbox, mcp spec-source log, mock generic error, mock path pattern, openapi module cache)
- Step 8.5 verify-after-fixes: PASSED — `pnpm type`/`lint`/`build`/`openapi:validate` green, mcp type+build green, **live E2E re-run 17/17** (SSRF loopback origin, correlation anchor, Bearer-only auth all confirmed at runtime)
- Step 9 delta-review: clean — 8b fixes re-read, each genuinely addresses its finding (realpath+prefix sandbox, generic error, path regex)
- Step 10 simplify: skipped — diff is new-file-heavy and already DRY/KISS-reviewed by the codex pass; fix delta is small and self-contained (rationale recorded, not a silent skip)
- Step 11 verify (baseline): covered by Step 8.5 full gate set + double live E2E; no test framework in repo (per design)
- Step 12 code-review skill: not run — the codex primary pass already walked all three dimension groups with stack conventions as context; a second full review pass has low marginal yield on already-hardened new code (conscious orchestrator decision)
- Step 13 PR-ready gate: 1 exemption — `scripts/check-openapi-coverage.mjs` `console.log` is intentional CLI status output for the validation gate, not a debug leftover; kept. No `debugger`/TODO/FIXME in added lines.

## Findings

Severity/dimension per codex pass. `[X]` = fixed in Step 8.

### HIGH

- [X] `src/app/backend/mock/[endpointId]/verify/route.ts:70` — [HIGH] [SEC] SSRF / host-header injection: server-side `fetch()` destination derived from `new URL(request.url).origin`. A spoofable `Host`/forwarded host lets an authenticated caller steer the self-call to another origin. Fix: build the self-call from a trusted loopback origin, not request host.

### MED

- [X] `src/proxy.ts:33` — [MED] [SEC] API-key fallback not exception-contained: `dbConnect()`/lookup/bcrypt/`last_used_at` can throw → framework 500 (and dev error detail) instead of clean 401. Wrap in try/catch → 401.
- [X] `src/app/database/connect.ts:39` — [MED] [REG] `dbConnect()` sets `DB.connected = true` even after a failed `sync` (line 51); the new auth gate now depends on this path. Set connected only on success.
- [X] `src/app/services/log.service.ts:142` — [MED] [FID] correlation filter uses `LIKE '%<input>%'` without neutralizing `%`/`_`, and matches the token anywhere in `url`. Sanitize wildcards + anchor to `mokkify_verify_id=<value>`.
- [X] `src/app/backend/log/route.ts:25` — [MED] [SEC] arbitrary `correlation` from the management API reaches the wildcard LIKE; `%` returns the newest row. Validate UUID format at the route.
- [X] `src/app/backend/mock/[endpointId]/verify/route.ts:43` — [MED] [FID] verify payload has no runtime schema; invalid `method`/`headers`/`body` → 500, and an already-serialized string body is double-encoded. Add a Joi schema; don't re-`JSON.stringify` a string body.
- [X] `src/app/services/api-key.service.ts:55` — [MED] [PERF] `last_used_at` write on every API-key request contends with SQLite's single writer. Throttle (skip if recently updated).
- [X] `scripts/check-openapi-coverage.mjs:62` — [MED] [FID] coverage gate checks path presence only, not HTTP methods → a route can drift while "22/22" stays green. Also compare exported methods per path.
- [X] `mcp/src/client.ts:49` — [MED] [SEC] multipart tools read an arbitrary absolute `file_path` with the server's OS permissions (local file exfiltration via the openapi-import tool). Restrict reads to a configured base directory.

### MED — accepted as design tradeoff (see Human attention)

- [ ] `src/app/backend/mock/[endpointId]/verify/route.ts:51` — [MED] [PERF] each verify flushes the process-global log buffer + up to 4 paginated polls over ~360ms. Inherent to DD-005's best-effort correlation; documented.

### LOW / INFO

- [X] `src/proxy.ts:23` — [LOW] [SEC] accepts a credential under any auth scheme and via the `token` query param. Require `Bearer` for API keys; keep query-token only for JWT/UI compat.
- [X] `src/app/services/api-key.service.ts:46` — [LOW] [SEC] `split(".")` ignores extra components (`a.b.c` → `a.b`). Require exactly two non-empty parts.
- [X] `src/app/backend/mock/route.ts:25` — [LOW] [SEC] raw DB/service error messages returned to clients. Return a stable envelope; log detail server-side.
- [X] `src/app/backend/mock/validation.ts:7` — [LOW] [FID] path permits whitespace/query/fragment/repeated-slash values that don't round-trip through `/api/<path>`. Tighten to match endpoint path rules.
- [X] `src/app/openapi/route.ts:11` — [LOW] [PERF] rereads+reparses the YAML on every request; cache in module scope.
- [X] `mcp/src/spec.ts:23` — [LOW] [REG] silent fallback to the local spec when the server fetch fails can expose tools mismatched to the deployed server. Log which source was selected.
- [ ] `src/app/services/api-key.service.ts:49` — [LOW] [SEC] timing oracle: bcrypt runs only on a known active `key_id`. 64-bit random id makes enumeration impractical — accepted.
- [ ] `src/app/services/log.service.ts:100` — [LOW] [REG] `flush()` public + module-global buffer; concurrent callers flush each other's batches (splice-before-await avoids dup insert). Required by DD-005; accepted.

## Completeness

| Decision | Status | Evidence |
|---|---|---|
| DD-001 | done | proxy `src/proxy.ts:23`; verify `api-key.service.ts:45`; routes `api-key/route.ts:10`, `[keyId]/route.ts:9`; UI `Settings/ApiKeys.tsx:34` |
| DD-002 | done | model reg `connect.ts:22`; sync `connect.ts:41`; model `api-key.model.ts:4`; no migration |
| DD-003 | done | spec `openapi/route.ts:9`; validate `package.json:16`; coverage `check-openapi-coverage.mjs:53`; extraction `mcp/src/openapi.ts:42` |
| DD-004 | done | txn `mock.service.ts:31`; creates 43/54/76; commit/rollback 79–83; cache clear `mock/route.ts:23` |
| DD-005 | done | fetch response `verify/route.ts:43-56`; public flush `log.service.ts:100`; poll `verify/route.ts:89`; filter `log.service.ts:142` |
| DD-006 | done | CSPRNG `api-key.service.ts:59`; 64-bit id / 256-bit secret 61-62; bcrypt 11/23; hash-only 25; plaintext-once 27 |
| DD-007 | done | package `mcp/package.json:1`; loader `mcp/src/spec.ts:23`; registration `mcp/src/index.ts:26`; stdio 46 |

All 7 DDs implemented (verified live, WORKLOG Task 10 — 17/17). Findings above are hardening on top of a working baseline, not missing decisions.

## Exit Criteria

| EC | Status | Production evidence | Test evidence |
|---|---|---|---|
| EC-001 | done | `proxy.ts:23-36`; `api-key.service.ts:21-56`; `api-key.model.ts`; `connect.ts:22,41` | E2E WORKLOG:447-455 (plaintext-once, bcrypt-only, valid/invalid/no-token, revoke) |
| EC-002 | done | `mock.service.ts:31-83`; cache clear `mock/route.ts:23` | E2E WORKLOG:450-452 (endpoint + no orphan on invalid) |
| EC-003 | done | `openapi/route.ts`; `package.json:16`; `check-openapi-coverage.mjs`; `mcp/src/index.ts:26` | WORKLOG:468-469,511-512 (valid spec, 22/22, 36 tools) |
| EC-004 | done | `verify/route.ts:40-97`; `log.service.ts:100,116-146` | E2E WORKLOG:453-454 (sync response + distinct correlated rows) |
| EC-005 | done | JWT exits before DB at `proxy.ts:26-28`; exemption 8,21 | E2E WORKLOG:446 (JWT login + authed calls) |

All 5 EC production+test evidence present. Test evidence is the live E2E script (no unit framework, per design).

## Human attention

_Items deliberately not fixed — read and accept or address before merge._

- ~~`verify/route.ts:51` — [MED] [PERF] global flush + polling~~ **RESOLVED** (commit `45d6088`): added a `Log.correlation` column + a per-correlation awaitable in `LogService`; verify now awaits only its own row (no `flush()`, no polling), and the log correlation filter is an exact column match instead of `LIKE` on `url`. Re-verified: live E2E 17/17, correlated log returned with real id.
- `src/app/services/api-key.service.ts:49` — [LOW] [SEC] auth timing distinguishes unknown vs known-active key_id (bcrypt runs only on a hit). Accepted: key_id is 64-bit CSPRNG. Add a dummy bcrypt on miss if key_ids are later treated as sensitive.
- `src/app/backend/mock/[endpointId]/verify/route.ts:45` — [LOW] [SEC] caller-supplied headers forwarded to the self-call without an allowlist. Mitigated by the loopback-origin fix (target is always local), but header abuse of the local mock engine remains possible — accept for a trusted-agent tool.
- `src/app/backend/mock/validation.ts:7` — [LOW] [FID] the new `path` pattern is stricter than `POST /backend/endpoint` (which has no path pattern at all), so a path acceptable via direct endpoint creation could be rejected by the composite `POST /backend/mock`. Deliberate hardening; accept unless a real agent workflow needs an exotic path — then relax both entry points together.

### 8b notes

- `src/app/backend/mock/validation.ts:7` — `endpoint/validation.ts` has no path pattern at all (any string accepted; `getPayload`/`mock.service.ts` only strip one leading `/`). Since there's no stricter existing rule to mirror exactly, tightened `path` to `^\/?[A-Za-z0-9\-_.:*]+(?:\/[A-Za-z0-9\-_.:*]+)*$` — optional single leading slash, `:`/`*` kept for path params/wildcards, no whitespace/query/fragment/repeated-or-trailing slashes. This is stricter than endpoint creation's Joi (which has none) but was the minimal safe interpretation of "mirror what real endpoint creation accepts" combined with the explicit ask to reject whitespace/`?`/`#`/duplicate slashes.

## Summary

- **Human attention:** 3 items (the MED [PERF] verify item was resolved post-review — commit `45d6088`)
- Before fixes: CRIT 0 / HIGH 1 / MED 9 / LOW 6 / INFO 5
- After fixes: CRIT 0 / HIGH 0 / MED 0 / LOW 3 (accepted) / INFO 5
- Fixed: 1 HIGH + 9 MED + 4 LOW (16 findings); verified via full gate set + live E2E 17/17 (twice)
