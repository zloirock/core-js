// destructure with `??` nullish-coalesce init: only `null` and `undefined` trigger
// the fallback; the polyfill rewrite handles both branches.
const { from } = Array ?? Promise;
