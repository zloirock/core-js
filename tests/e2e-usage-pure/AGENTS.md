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

## Stripped realms

The babel bundle and unplugin's `pre+post` are also run in realms with the native built-ins removed. That leg is the primary guard against vacuous tests, the ones that pass on the native implementation without any polyfill being involved. The remaining legs stay full-environment on purpose.

What may be stripped is decided by the manifest in `tests/transpiler-differential/`, and the rule is pairing rather than a per-feature verdict: a global and the prototype helpers that ship with it are stripped together, because removing only the global leaves a half-state no real engine has, where a surviving native still serves pure calls. `Symbol` is deliberately never stripped for the same reason. Realm-sensitive work is verified across the Node versions CI runs, 22 through 26.
