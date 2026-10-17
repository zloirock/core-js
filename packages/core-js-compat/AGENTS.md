# @core-js/compat

The shared knowledge base of the whole toolchain, and the tooling that queries it. Four kinds of data live here, and only the first is compat data in the narrow sense:

- which engine version supports which module, and the same for features outside core-js
- what the entry points contain, and which modules and entries belong to a given core-js version
- how the built-ins map onto polyfill entry paths - the table the injection plugins resolve usage against
- what the standard built-ins evaluate to, which is how those plugins infer receiver types

On top of that it resolves a target specification - a browserslist query, an explicit engine map, a core-js version - into the list of modules that target actually needs. Everything else in the repository that has to know "what does this environment need" goes through here rather than deciding on its own.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`.

## Sources and generated files

The data sources live in `src/`, the query API is the hand-written `.js` at the package root. Every `.json` there except `package.json` is generated and gitignored - most of them by `npm run build-compat` (`scripts/build-compat/`) - and must never be edited.

| Source | Generated | Content |
|---|---|---|
| `src/data.mjs` | `data.json` | module -> first supporting version of each engine |
| `src/mapping.mjs` | - | version inference: fills in an engine that has no data of its own from a related one, Node from Chrome and similar. Merged into `data.json` and `external.json`, so those are not plain dumps of their sources. Engine name aliasing is a different thing and lives in `targets-parser.js` |
| `src/built-in-definitions.mjs` | `built-in-definitions.json` | globals / statics / instance members, accessors included -> polyfill entry paths, consumed by the injection plugins |
| `src/known-built-in-return-types.mjs` | `known-built-in-return-types.json` | what the standard built-ins evaluate to: the type a constructor produces when called with and without `new`, what each static and instance method returns, the type of each property, which statics are type guards, and which globals are namespaces or proxies for the global object. This is what lets the plugins name the receiver type of an expression instead of bailing |
| `src/external.mjs` | `external.json` | features outside core-js itself, keyed the same way - currently syntax support (ES modules, arrow functions, shorthand properties and the like) |

Four more generated files are derived rather than written:

| Generated | Content |
|---|---|
| `entries.json` | entry point -> its modules, from a bare `modules/*` to the `es/`, `stable/`, `actual/`, `full/` aggregates; built from the entry registry in `scripts/build-entries-and-types/` |
| `modules.json` | the module names, in the order `src/data.mjs` declares them |
| `entries-by-versions.json`, `modules-by-versions.json` | the same two grouped by the core-js version that introduced them. Until the first stable v4 release the generators short-circuit to a single unreleased-version bucket; afterwards they diff against the previous major fetched from the registry |

## Rules

- A new module in `src/data.mjs` needs a probe in `tests/compat/tests.js`; the rules for writing one are in that directory's `AGENTS.md`
- The compat data is the contract the plugins depend on: adding an entry to `built-in-definitions` changes what every consumer injects
- Tests: `npm run test-compat-data` (every module has a probe), `npm run test-compat-tools` (query API), `npm run check-mapping` (goes online to compare the data against upstream release histories)
