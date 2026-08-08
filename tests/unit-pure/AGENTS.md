# unit-pure

The pure-flavor half of the unit tests. Everything about naming, the generated index, the shared assertions and how the suites run is in `tests/unit-global/AGENTS.md`; only the differences are below.

## Target environment

Same as the global tests, with one restriction on top: pure tests must not touch the modern standard library, and the lint config enforces that here and in `tests/helpers/`. The polyfill under test cannot be assumed to exist on the built-ins either - that is the whole point of the flavor.

## What differs

- A test imports the entry point instead of relying on a patched global: `import at from '@core-js/pure/es/array/at'`
- Instance methods arrive as plain functions taking the receiver first, so `[1, 2, 3].at(-1)` becomes `at([1, 2, 3], -1)`. The behavioral assertions stay the same; only the call shape changes
- Nothing is installed anywhere, so the descriptor assertions of the global side apply only where the pure entry really is a member of something
- Not every global test has a twin here: a feature that pure does not implement, the TypedArray family above all, has no pure counterpart to test
- The reverse also happens: the `helpers.*` files cover the iteration helper entries, which both flavors ship but only this suite tests
