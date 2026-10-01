import _Map from "@core-js/pure/actual/map/constructor";
// `declare var Map: ...` - ambient declaration. `ambient binding filter` covers
// VariableDeclarator parent with `parent.declare === true`, so the binding is
// filtered from the shadow check and the polyfill fires for `new Map()`. distinct
// from `enum Map` (runtime binding) - declare types are tsc-elided, no runtime
// emission, references resolve to the global at runtime
declare var Map: {
  new <K, V>(): Map<K, V>;
};
const m = new _Map();
const has = m.has(1);
export { m, has };