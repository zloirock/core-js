import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a for-of / for-in head holds a whole expression up to its `)`, and a case arm's assignment
// runs to the `break` - the fold stays bare in all three
export const spread = [];
for (const item of null == _globalThis.window ? void 0 : _Array$of(3, 4)) _pushMaybeArray(spread).call(spread, item);