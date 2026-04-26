import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// destructure init `Promise` would normally produce its own constructor polyfill
// rewrite. when the destructure pass consumes the same range to emit `resolve` the
// constructor rewrite must be discarded; otherwise the same byte-range gets two
// overlapping transforms
const resolve = _Promise$resolve;
resolve(1);