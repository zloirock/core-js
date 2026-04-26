import _globalThis from "@core-js/pure/actual/global-this";
// lowercase destructure from globalThis: `foo` is not a known global, so its `.someMethod`
// dispatch is left untouched. `globalThis` receiver itself is still polyfilled
const {
  foo
} = _globalThis;
foo.someMethod?.();