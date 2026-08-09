# core-js

The main library: polyfill implementations that install themselves into the global built-ins. CommonJS.

## Target environment

The baseline is engines **about IE11**: **ES5 with some additions**. Examples of supported engines are IE11, Chrome 38, Safari 7.1, Firefox 15 and Node 0.11 - examples, not an exhaustive list, so treat the baseline as a capability level rather than as that list of names. Engines below it, dropped in v4, include IE10 and earlier, Android 4.4.3 and earlier, PhantomJS, Opera Presto and Duktape.

Syntax stays **ES5** - the additions are runtime capabilities, not syntax. Beyond ES5 the implementation may rely on, for internal use only and tolerating bugs in them:

- basic `WeakMap`
- basic `Map` and `Set`
- the `%TypedArray%`, `ArrayBuffer` and `DataView` constructors
- a way of setting a prototype: `Object.setPrototypeOf` or `__proto__`

"Only observable on an old engine" is never a reason to dismiss a defect: this baseline is the product.

Consequences that hold everywhere here:

- Cache built-ins in module scope instead of reading them at call time
- At runtime, never call a prototype method through the value (`array.slice(...)`) - uncurry it once through `internals/function-uncurry-this` and call the result, because by then the prototype may be patched. During initialization a direct call is fine: polyfills load before any other code

## Layout

- `internals/` - shared helpers like validators, feature detection, caching
- `modules/` - one file per feature, named `namespace.feature-name` (`es.set.intersection`, `esnext.async-iterator.to-array`, `web.url.constructor`)
- `configurator.js` - hand-written, and the only public entry that is: it writes the consumer's opt-in switches into the shared store, so it has to be loaded before the modules that read them
- `es/`, `stable/`, `actual/`, `full/`, `proposals/`, `stage/` and `index.js` - **generated**, gitignored, never edited by hand. They are produced by `npm run build-entries` from `scripts/build-entries-and-types/entries-definitions.mjs`, which also rewrites the `exports` field of the package's `package.json` - that file itself is a copy of `package.tpl.json`

Entry layers widen in this order: `es/` (stable ECMAScript) -> `stable/` (+ web standards) -> `actual/` (+ stage 3) -> `full/` (all proposals). The bare `index.js` is `actual`, not `full`.

## Rules

- Optimize the implementation for size: this code ships into every page, so a shared `internals/` helper and one branch fewer beat expressiveness. Nothing measures it for you
- Export through `internals/export` in the common case; the narrower helpers (`define-built-in-accessor`, `set-species`, `export-typed-array-method` and friends) are for what it cannot express, accessors above all
- Reach a polyfillable built-in through the `internals/get-built-in` family, never by reading it off the global. Host objects nobody polyfills - `document`, `process`, `Bun` - are read directly through `internals/global-this`
- Never import from `modules/` inside `internals/` or `modules/` - a direct import defeats the dead-code elimination the bundlers do over the entry points. To build on another core-js polyfill, take it from the global with `internals/get-built-in-static-method` or `get-built-in-prototype-method` and declare the relation on the line above it: `// @dependency: es.array.from`. The parser is strict - one space, an `es.` / `esnext.` / `web.` module name, nothing else on the line - and that declaration is what orders the entry points. Keep such coupling minimal - every declaration widens the graph of each entry point that pulls the module, so declare one only where the behavior is wrong without it, never for convenience
- A polyfill must not break unrelated features, or the application itself, in engines where it cannot be fully implemented. Degrading is acceptable, poisoning the environment is not
- Loading the library must not invalidate a V8 protector: that would deoptimize the whole application, not just the polyfilled path. `npm run check-v8-protectors` loads the package under `--trace-protector-invalidation` and prints nothing when this holds

## What a polyfill touches

Every place a new module has to appear, in the order it makes sense to fill them; changing an existing polyfill means walking the same list.

1. Implementation in `modules/`, helpers in `internals/`
2. Where the pure flavor differs, a branch on `internals/is-pure` in the same module; a file in `packages/core-js-pure/override/` only when the two implementations genuinely diverge
3. Runtime probe in `tests/compat/tests.js`, compat data in `packages/core-js-compat/src/data.mjs`
4. Entry definition in `scripts/build-entries-and-types/entries-definitions.mjs`
5. Types in `packages/core-js-types/src/base/`, both flavors, bound by a `// @types:` comment in the module
6. `packages/core-js-compat/src/built-in-definitions.mjs`, or the injection plugins will never inject it, and `known-built-in-return-types.mjs` when the feature has a return type worth inferring
7. Registration in `tests/eslint/eslint.config.js`, so the rules about unpolyfilled built-ins know it exists
8. Unit tests in `tests/unit-global/` and `tests/unit-pure/`, a `load(...)` line per new entry in `tests/entries/unit.mjs` - it lists what it has not covered instead of failing, so nothing stops you from skipping it - a type test in `tests/type-definitions/`, and regenerated transpiler fixtures where the new entry changes their output
9. Documentation in `docs/`, plus its entry in `docs/web/docs/menu.json`, and the feature list in the root `README.md`
