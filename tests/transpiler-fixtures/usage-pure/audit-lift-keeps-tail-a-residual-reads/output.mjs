import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const arr = [1];
export const of = _Array$of;
export const name = _nameMaybeFunction(Array);
export const at = _atMaybeArray((0, arr));
export const from = _Array$from;
const _ref = (0, Array),
  of2 = _Array$of,
  {
    of: _unused,
    ...rest
  } = _ref;
export { of2, rest };