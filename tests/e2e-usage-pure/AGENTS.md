# e2e-usage-pure

End to end: source is transformed with the `usage-pure` method, bundled, and executed. This is the runtime oracle for the whole transpiling stack - for a fix, a runtime fail-before / pass-after here is the primary evidence, and a fixture diff is secondary.

## Target environment

Tests are written in modern syntax and transpiled to ES5. They run both in Node (`npm run test-e2e-usage-pure`) and in browsers via Karma (`npm run test-e2e-usage-pure-karma`), so assertions that depend on `window` - and the side-effect counters around them - must branch on the environment instead of assuming a browser.

The suite rebuilds its bundles itself; only the inner `*-run` scripts reuse prebuilt ones.

## Coverage axis

New coverage is keyed on **syntactic form** - destructuring, parameter defaults, optional chaining, class context, iterators, chaining, globals - not on which polyfill is involved. Ask which form is untested, not which method. Files named after a polyfill do exist here, but they are not the axis to extend.

The `.ts` files are not decoration: the plugin sees a typed AST before the types are stripped, so they are the only runtime oracle for type-driven dispatch.

Mutation tests live in their own modules, one per channel rather than one per kind: mutated statics, global-object slot writes, load-time slot writes, and the pure-import channel. The reason is contagion - a slot write of a name deoptimizes *that name* for the whole file, so a module that mutates one name cannot host the clean reads of another.

TypedArrays are not polyfilled in pure at all and need no coverage here.

`.name` carries no blanket guarantee in pure. A factory-produced function - a wrapped constructor (`"Wrapper"`), a bound helper, a generated dispatcher (`""`) - does not preserve it, and neither is a wrapped constructor's `.length` preserved; a mismatch with native on these is a known limitation, not a finding. Plain statics written as named functions do preserve `.name`, and those are the only place a `.name` assertion belongs - the way the unit-pure suite does it, through the environment-gated `assert.name`. Everywhere else build the oracle on behavior: return values, short-circuits, side-effect counters.

## Stripped realms

The babel bundle and unplugin's `pre+post` are also run in realms with the native built-ins removed. That leg is the primary guard against vacuous tests, the ones that pass on the native implementation without any polyfill being involved. The remaining legs stay full-environment on purpose.

What the manifest cannot strip - `Object.assign`, which the lowered outputs call themselves - stays native in every local run, and the pure module hands that native back, so an assertion resting on its absence agrees here and fails only under Karma.

What may be stripped is decided by the manifest in `tests/transpiler-differential/`, and the rule is pairing rather than a per-feature verdict: a global and the prototype helpers that ship with it are stripped together, because removing only the global leaves a half-state no real engine has, where a surviving native still serves pure calls. `Symbol` is deliberately never stripped for the same reason. Realm-sensitive work is verified across the Node versions CI runs, not on your local one alone.

A test that patches a built-in saves and restores it through `Object.getOwnPropertyDescriptor` / `Object.defineProperty`: both halves of the obvious pair are themselves rewritten here - a `key in obj` probe folds to the polyfilled world's answer, and the member read hands back core-js's own implementation - so it restores into a stripped realm a method that realm never had, and every later test of that method silently runs on a native. The last-imported module re-checks the realm at the end of the run, so a slip fails instead of going quiet.
