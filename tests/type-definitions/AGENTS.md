# type-definitions

Compilation tests for `@core-js/types`: the definitions are type-checked against real TypeScript versions, for both flavors.

## Target environment

Node `^22.18.0 || >=24.11.0`, with its own `package.json` and `tsconfig.json`. Each run installs its own TypeScript and environment packages into `tmp/`, which is generated and gitignored.

The matrix is a cross-product of five axes: the flavor, the ES target of the compilation, the TypeScript version, the ambient environment package, and the extra `lib`. The last two both include the case of having none at all, since a definition that only compiles because `@types/node` or the DOM lib supplied something is exactly the bug these runs look for. Only the environment and TypeScript axes grow with the mode; the rest are the same in every run.

`npm run test-type-definitions-smoke` is the default and takes one point of each: the newest TypeScript and the newest `@types/node`. `-ci` widens both to a few versions each, `-all` to everything the definitions claim to support, which is the only run where the declared floors are exercised at all. A change that depends on a newer TypeScript, or on a newer `@types/node`, is therefore green by default and red in CI.

## Layout

- `entries/` - that each entry point resolves and exports what it promises: one directory per layer, plus the import styles of both flavors, the `configurator`, and `pure-pollutions`, which checks that the pure entries add nothing to the global scope
- `global/`, `pure/` - the tests of the definitions themselves, one flavor each, next to the `tsconfig.*.json` variants the matrix compiles them under
- `templates/` - one case per template of the entry registry, in both the import and the require style: that `$justImport` really exposes no default export, that a generic prototype method degrades to `any`, and so on
- `tools/` - the same treatment for the public `.d.ts` of the tooling packages
- `coverage.mjs` (`npm run types-coverage`) - the separate gate that every `esnext.` and `web.` module carries a `// @types:` or `// @no-types` comment

## Rules

- Compiling the file *is* the check, so the assertions have to be written into it: annotate the binding, which makes assignability do the work, and mark what must not compile with `// @ts-expect-error`. A bare call with no annotation passes even when the type resolved to `any`
- Both flavors need the case. The global one checks the member on the built-in, the pure one checks the module export
- Adding a TypeScript version to the matrix is a decision about what the package supports - `typesVersions` in the built `package.json` has to agree with it
