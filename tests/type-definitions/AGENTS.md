# type-definitions

Compilation tests for `@core-js/types`: the definitions are type-checked against real TypeScript versions, for both flavors.

## Target environment

Node `^22.18.0 || >=24.11.0`, with its own `package.json` and `tsconfig.json`. Each run installs its own TypeScript and environment packages into `tmp/`, which is generated and gitignored.

The matrix is a cross-product of five axes: the flavor, the ES target of the compilation, the TypeScript version, the ambient environment package, and the extra `lib`. The last two both include the case of having none at all, since a definition that only compiles because `@types/node` or the DOM lib supplied something is exactly the bug these runs look for. The base config starts with an empty `types` list so every compiler loads only the ambient packages a project requests. The mode selects the environment packages and TypeScript versions. Each selected compiler also checks every entry, template and tooling project.

`npm run test-type-definitions` is the default and takes one point of each: the newest TypeScript and the newest `@types/node`. `-all` widens both to everything the definitions claim to support - the only run where the declared floors are exercised at all, and the one CI uses. A change that depends on a newer TypeScript, or on a newer `@types/node`, is therefore green by default and red in CI.

## Layout

- `entries/` checks the entry layers, import styles of both flavors and the configurator. Most entry tests use `es2023` and `dom` to keep later ECMAScript library declarations out of their subset checks. The standalone `proposals`, `web` and `annex-b` entries use bare `es6` to expose missing dependencies
- `entries/pure-pollutions/` checks the global surface after loading pure declarations. Its lib supplies the native `Iterator.from` while leaving the tested methods to core-js. TypeScript 5.x supplies the constructor in `esnext.iterator`. Newer compilers use the fixed `es2025` lib so additions to `esnext` cannot mask pollution
- `global/`, `pure/` - the tests of the definitions themselves, one flavor each, next to the `tsconfig.*.json` variants the matrix compiles them under
- `templates/` - one case per template of the entry registry, in both the import and the require style: that `$justImport` really exposes no default export, that a generic prototype method degrades to `any`, and so on
- `tools/` - the same treatment for the public `.d.ts` of the tooling packages
- `coverage.mjs` (`npm run types-coverage`) - the separate gate that every `esnext.` and `web.` module declares a type path recognized by the generator or opts out with a line containing `// @no-types` or `// @no-types: <reason>`

## Rules

- Compiling the file *is* the check, so the assertions have to be written into it: annotate the binding, which makes assignability do the work, and mark what must not compile with `// @ts-expect-error`. A bare call with no annotation passes even when the type resolved to `any`
- Both flavors need the case. The global one checks the member on the built-in, the pure one checks the module export
- The file name is part of the matrix: `*es2018*test.ts` is left out of the `es6` target leg, `*dom*test.ts` is compiled only in the leg that adds the DOM lib. Both are substring matches over the path, so the name is a claim about what the case needs in order to compile
- Adding a TypeScript version to the matrix is a decision about what the package supports - `typesVersions` in the built `package.json` has to agree with it
