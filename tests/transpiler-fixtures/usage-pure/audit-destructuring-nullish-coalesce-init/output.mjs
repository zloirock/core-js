import _Array$from from "@core-js/pure/actual/array/from";
// destructure with `??` nullish-coalesce init: only `null` and `undefined` trigger
// the fallback; the polyfill rewrite handles both branches.
const from = _Array$from;