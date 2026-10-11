import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The receiver prefix and folded computed-key effect retain native order inside one declaration:
// the receiver's effect runs first, the key expression next, then the pure static binds.
const e = [];
const from = (_pushMaybeArray(e).call(e, 'r'), (_pushMaybeArray(e).call(e, 'k'), 'fr') + 'om', _Array$from);
export const r = [from, e];