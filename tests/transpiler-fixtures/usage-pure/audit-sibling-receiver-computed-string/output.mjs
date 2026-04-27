import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
const from = _Array$from;
// polyfillSiblingReceiverRefs filter excluded only non-computed MemberExpression
// (`globalThis.Map`), letting computed-string `globalThis['Map']` through. result
// raced with outer-MemberExpression `_Map` rewrite, corrupted to `__Map`. fixed
// filter: skip both `obj.Map` and `obj['Map']` shapes
const y = _Map;
export { from, y };