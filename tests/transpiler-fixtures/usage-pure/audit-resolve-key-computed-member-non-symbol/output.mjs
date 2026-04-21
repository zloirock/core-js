import _Object$create from "@core-js/pure/actual/object/create";
// resolveKey's Symbol.X computed-member branch only fires when object resolves to the Symbol
// global. For Object.X / Reflect.X bound-key chains, resolveKey returns null, so `k in obj`
// takes branch 3 (string key in known global), where `obj` must be a known object. Neither
// fires here (`g` is a local), so no polyfill - this documents the miss
const k = _Object$create;
k in g;