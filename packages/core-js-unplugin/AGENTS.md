# @core-js/unplugin

Bundler binding for `@core-js/polyfill-provider`. Read [the provider contract](../core-js-polyfill-provider/AGENTS.md) for shared decisions, rendering, canon search and validation. This package owns parsing, traversal, ESTree insertion, printing, sourcemaps and bundler integration.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`, plus Bun for its entry. Keep `@core-js/compat` in dependencies: although unused at runtime, `index.d.ts` imports its types for consumers' tsc.

## Entry points and layout

Each public bundler has a `<bundler>.js` / `<bundler>.d.ts` pair re-exporting `index.js`. Adding one also requires checking `KNOWN_BUNDLERS`, `CHUNK_LOADER_BUNDLERS`, the Rollup/Rolldown hook branch and `PRE_POST_UNSAFE_BUNDLERS` (`pre+post` falls back to `post`). `KNOWN_BUNDLERS` is exactly the public entries: a bundler upstream unplugin names but this package does not ship (`unloader`) belongs in no set, so it is reported as unknown rather than handled as a neighbour.

`index.js` builds the adapters and filters module ids. SFC admission depends on `enforce`: source markup at `pre`, compiled JavaScript at `post`. Other language facts come from the provider's `moduleIdLanguage`; `sourceDialectOf` translates them for oxc. Parser and printer must use the same language.

Key files under `internals/`:

- `plugin.js`: oxc parse, estree-toolkit traversal, body edits and esrap print, for every phase. Applies the provider's minifier-sequence split before detection.
- `detect-entry.js`, `detect-usage.js`, `entry.js`: detection adapters and entry insertion.
- `import-injector.js`, `snapshot-cache.js`: imports, generated refs and phase-state handoff.
- `print.js`, `estree-compat.js`, `sfc-shapes.js`, `plugin-helpers.js`: printing, dialect translation, module ids and host helpers.
- `usage-pure.js`: claim dispatch; `proxy-spine.js`, `optional-dispatch.js`, `se-dispatch.js`, `claim-guards.js` and `nav-spine.js` provide its host channels.
- `destructure.js`, `destructure-drain.js`, `destructure-helpers.js`, `destructure-emit-utils.js`: visit, deferred insertion and supporting operations.

Keep the emitter dependency graph acyclic. `proxy-spine`, `optional-dispatch` and `destructure-drain` are per-transform factories; shared decisions and render forms belong in the provider, not another host helper.

## Host contracts

- Each phase parses its own tree. `pre+post` transfers injector state, never the AST; post re-scans imports inserted by siblings.
- Snapshot identity includes the environment, query and fragment. Only numeric HMR timestamps are noise. Do not add eviction that can discard a pending pre-to-post handoff; build-end reset and watch invalidation own its lifetime. See `snapshot-cache.js` for path normalization.
- Undo detection-only mutations such as `neutralizeUnwalkedParamPatterns` before printing.
- Normalize TS instantiation before optional calls in every method: `((X)<T>)?.(a)` becomes `(X)?.<T>(a)`. Babel's later optional-call lowering otherwise loses `this`; doing it only at post is too late.
- Nodes acquired from another evaluation frame need `stampNodeSite`; scope-aware queries use `nodeSite`, and copies use `cloneStamped`. Do not substitute an unrelated `metaPath`.
- Clone host source nodes before embedding them in another tree position, including keys marked `fromSource` by `synthEntryKey`. Reusing one node aliases subsequent mutations even when printed output looks correct.

## Validation and sidecars

- `npm run test-unplugin`: shared fixtures, structurally compared with Babel through `tests/unplugin/structural.mjs`.
- `npm run test-unplugin-unit`: internals.
- `npm run test-unplugin-roundtrip`: no-op reprint preserves structure, comments and directive associations, and reaches a print fixed point.

An `output-unplugin.mjs` sidecar records a reviewed divergence and is checked byte-for-byte. Accepted classes remain environmental differences (targets, require dialect), parser acceptance, and documented structural spellings (kept aliases, ref-hoist placement, TS type reprints). These are debt, not permission to accept any runtime-equivalent output. Explain the exact difference; formatting is already normalized by the comparator. Regenerate and remove obsolete sidecars through the runner, following [fixture rules](../../tests/transpiler-fixtures/AGENTS.md).

For behavior changes, run bare `npm run test-transpiler-differential` and `npm run test-e2e-usage-pure`; the `unplugin` filter is diagnostic and omits import parity. Runtime e2e covers every phase, with stripped-realm coverage on `pre+post`. Hook, module-id and bundler-facing changes also need `npm run test-transpiler-integration`.

At final handoff of code changes, run `npm run test-transpiling` once, then the performance gate specified by [the shared validation rules](../core-js-polyfill-provider/AGENTS.md#validation). Do not also run composite members on the same invocation line.
