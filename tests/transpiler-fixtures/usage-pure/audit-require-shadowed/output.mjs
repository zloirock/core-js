import _Map from "@core-js/pure/actual/map/constructor";
// user shadows `require` with a local binding - a subsequent call looks like `require('@core-js/pure/actual/map')`
// but is NOT a real core-js import. plugin must not deduplicate against it and still emits its own Map constructor
// polyfill for a `typeof` read; the bare statement read performs nothing and leaves
const require = x => null;
require('@core-js/pure/actual/map');
export const kind = typeof _Map;