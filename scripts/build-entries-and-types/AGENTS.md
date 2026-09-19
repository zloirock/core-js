# build-entries-and-types

The single registry of everything the library exposes, and the generators that turn it into entry points and TypeScript definitions. Adding a feature to core-js means adding it here, whatever else it also touches.

## Target environment

Node `^22.18.0 || >=24.11.0` under `zx`, started through `npm run zxi` - see `scripts/AGENTS.md`. This directory has its own `package.json`, so the bootstrap installs its dependencies before running anything in it.

## What lives here

- `entries-definitions.mjs` - the registry. An entry path maps to the modules it pulls in and to how it should be rendered: `'object/keys-length': { modules: ['esnext.object.keys-length'], template: $static, namespace: 'Object', name: 'keysLength' }`. Nearly all of the directory's size is this file
- `templates.mjs` - the vocabulary those entries are written in: `$static`, `$prototype`, `$uncurried`, `$namespace`, `$instanceArray` and the rest. Picking the right one is the actual decision, because the same template drives both the emitted entry and its type: a static exported as an instance method compiles and ships wrong
- `build-entries.mjs` - writes the entry layers of `packages/core-js`, the `exports` field of both runtime packages' `package.json`, and `entries.json` for `@core-js/compat`
- `build-types.mjs`, `build-types-pure.mjs` - emit the definitions of `packages/core-js-types`; the mechanics are described in that package's `AGENTS.md`
- `get-dependencies.mjs` - reads the `// @dependency:` and `// @types:` directives out of the module sources. Both regexes are strict about spacing and the allowed characters, so a directive that merely looks right is silently invisible
- `helpers.mjs` - `modulesToStage` and `expandModules`, which is where the stage cutoff of the `actual/` layer comes from

## Rules

- The registry is the source of truth for the entry surface: a module that exists in `packages/core-js/modules/` but appears in no entry here ships inside no entry point, so nothing ever pulls it in
- An entry is only complete when both its layer placement and its template are right - the layer decides who gets it, the template decides what it looks like in both flavors
- Never edit the generated results to fix something you can fix here
