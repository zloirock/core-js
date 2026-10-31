import _Array$from from "@core-js/pure/actual/array/from";
// empty BlockStatement body - no ReturnStatement, so receiver resolution bails. caller's
// `.from` / `.intersection` cannot be linked to a known constructor; no polyfill fires for
// these member accesses (unrelated raw `Array.from(...)` elsewhere still polyfills normally
// to confirm the runner is wired).
const empty1 = (() => {})().from([1]);
const empty2 = (() => {})().prototype.intersection;
const baseline = _Array$from([2]);
export { empty1, empty2, baseline };