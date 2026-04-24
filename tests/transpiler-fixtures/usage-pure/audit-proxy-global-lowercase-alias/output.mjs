import _globalThis from "@core-js/pure/actual/global-this";
// lowercase destructure from globalThis - not a known global, no polyfill probes
const {
  foo
} = _globalThis;
foo.someMethod?.();