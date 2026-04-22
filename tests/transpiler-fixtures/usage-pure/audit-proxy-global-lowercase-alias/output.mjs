import _globalThis from "@core-js/pure/actual/global-this";
// `const { foo } = globalThis` — `foo` is not a known global, plugin must not push
// `'foo'` into downstream global lookups (would emit spurious `_foo` polyfill probes).
const {
  foo
} = _globalThis;
foo.someMethod?.();