# @core-js/types

The TypeScript definitions shipped for the library, covering both of its flavors: `core-js`, where a declaration adds members to an existing built-in, and `@core-js/pure`, where it describes what a module exports.

## Target environment

TypeScript **5.6+** - `typesVersions` maps every consumer to `ts5-6/`.

## Sources and generated files

`src/base/` is hand-written: the declarations themselves, with the pure counterparts under `src/base/pure/`. `ts5-6/` is generated, gitignored, and never edited by hand. The package's `package.json` starts as a copy of `package.tpl.json` and gets its `typesVersions` and `exports` only from the build, so after a bare `prepare-monorepo` the package does not resolve yet.

A feature counts as typed only when both flavors have their declaration; either one alone leaves half the library untyped.

## How the definitions are built

`npm run build-types` runs `scripts/build-entries-and-types/build-types.mjs`, next to - and from the same registry as - the entry-point build, so the type surface and the entry surface cannot drift apart.

- A hand-written declaration is bound to a polyfill by a `// @types: <path>` comment in `packages/core-js/modules/*.js`. That directive is what points an entry at a file under `src/base/`, and `// @no-types` is the explicit opt-out. There is no name-based convention doing this behind your back
- Each entry point in `entries-definitions.mjs` is rendered through a template from `templates.mjs` and appended to the file of its subset - `es`, `stable`, `actual`, `full`, `pure`, `index`, `configurator` - so one definition reaches several outputs, filtered by what that subset contains
- The pure side is not a separate source tree: `build-types-pure.mjs` derives it from the same entries, which is why a global-only declaration silently leaves the pure flavor untyped. What that derivation does to a single declaration is steered by a `// @type-options:` comment closing the line that opens it - `no-extends`, `no-prefix`, `no-constructor`, `no-redefine`, `no-export`, `export-base-constructor`, `prefix-return-type`, comma-separated - and the list has to end the line, or the parser does not see it
- A file under `src/base/pure/` that opens with `// empty` says the pure side of that path lives in another declaration - the comment below that line says which
- The output directory is named after the TypeScript breakpoint it serves. `src/base/` is copied in first, then an optional `src/ts<version>/` overlay for that breakpoint on top - an overlay named after no current breakpoint never reaches the output, which does not make it garbage: one may be kept as groundwork for a breakpoint that is not built yet
- The same run writes `typesVersions` and `exports` into the package's `package.json`

## Tests

- `npm run test-type-definitions-smoke` - fast smoke check, part of the default suite
- `npm run test-type-definitions-ci`, `npm run test-type-definitions-all` - wider matrices
- `npm run types-coverage` - every `esnext.` and `web.` module in `packages/core-js/modules/` must carry a `// @types:` or `// @no-types` comment, and the build fails without one
