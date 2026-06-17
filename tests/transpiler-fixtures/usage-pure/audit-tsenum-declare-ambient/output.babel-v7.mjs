import _Map from "@core-js/pure/actual/map/constructor";
// `declare enum Map { ... }` is ambient - elided by `tsc` before runtime. references to
// `Map` resolve to whatever the runtime supplies (typically the global). polyfill must
// fire for legacy targets, and the declaration LHS must not be renamed
declare enum Map {
  A,
  B,
}
const m = new _Map();
export { m };