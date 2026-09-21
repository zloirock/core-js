# @core-js/babel-plugin

Babel binding for `@core-js/polyfill-provider`. Read [the provider contract](../core-js-polyfill-provider/AGENTS.md) for shared decisions, rendering, canon search and validation. This package owns Babel tree insertion, scope registration, requeueing and sibling-plugin compatibility.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`; Babel 7 and 8. Keep `@core-js/compat` in dependencies: although unused at runtime, `index.d.ts` imports its types for consumers' tsc.

## Layout

- `index.js`: plugin lifecycle, options, visitors and method dispatch.
- `internals/detect-entry.js`, `internals/detect-usage.js`: Babel adapters for shared detection.
- `internals/import-injector.js`: imports, directives, generated names and scope bookkeeping.
- `internals/estree-to-babel.js`: insertion-boundary conversion, total over the provider's builder vocabulary, not arbitrary source ASTs.
- `internals/babel-compat.js`: Babel AST operations. The Babel 7/8 scope-bag differences belong to the import injector.
- `internals/destructure-emission-plan.js`, `internals/destructure-emitter.js`, `internals/synth-swap-emitter.js`, `internals/synth-key-utils.js`: host emission. Shared decisions and render forms belong in the provider.

## Host contracts

- Detect and apply together in `pre()`, while source types and patterns remain intact. `Program:exit` backstops later sibling output; do not defer the main apply across phases onto a changed tree.
- Emitted nodes must survive subsequent Babel lowerings. Restructure unnecessary grouping during emission; restore necessary `ParenthesizedExpression` nodes in `post()`, after sibling `Program:exit` hooks. Earlier insertion can break regenerator on `await` / `yield`.
- Clone through `rangePreservingTypes`. Babel cloning drops `start` / `end`; the wrapper restores them from `loc` for the provider's positional proofs.
- Use the injector's scope bags for Babel 7 object maps and Babel 8 `referencesSet` / `uidsSet`.
- Ask `resolveModuleFormat` with the filename and explicit parse goal. A declared script is evidence; Babel's default `module` goal is not.

## Validation

- `npm run test-babel-plugin` and `npm run test-babel-plugin-unit`: Babel 8 fixtures and internals.
- `npm run test-babel-plugin-v7` and `npm run test-babel-plugin-unit-v7`: Babel 7 coverage. Legitimate differences use fixture siblings; `tests/babel-plugin-v7/skip.mjs` is the last resort. See [fixture rules](../../tests/transpiler-fixtures/AGENTS.md).

For behavior changes, run bare `npm run test-transpiler-differential` and `npm run test-e2e-usage-pure`; the `babel` filter is diagnostic and omits import parity. Babel has a runtime bundle and a stripped-realm leg. Use `npm run test-transpiler-integration` for pipeline changes.

At final handoff of code changes, run `npm run test-transpiling` once, then the performance gate specified by [the shared validation rules](../core-js-polyfill-provider/AGENTS.md#validation). Do not also run composite members on the same invocation line.

For independent manual output/import-set comparisons, normalize formatting and use one probe per process to exclude prior module state. The differential harness deliberately runs both emitters in one process; retain that coverage.
