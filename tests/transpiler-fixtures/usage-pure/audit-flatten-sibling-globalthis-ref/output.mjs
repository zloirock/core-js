import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// multi-declarator: first declarator is a flattened `globalThis` proxy destructure;
// sibling holds a bare `globalThis` reference that must also be rewritten to the
// polyfill binding even though it sits outside any arrow / function body
const from = _Array$from;
const host = _globalThis;
export { from, host };