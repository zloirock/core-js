// resolveKey's Symbol.X computed-member branch only fires when object resolves to the Symbol
// global. For Object.X / Reflect.X bound-key chains, resolveKey returns null, so `k in obj`
// takes branch 3 (string key in known global), where `obj` must be a known object. Neither
// fires here (`g` is a local), so no polyfill - this documents the miss
const k = Object.create;
k in g;
