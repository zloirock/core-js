import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// the dead-tail lift drops a sequence tail whose value nothing reads. a skip-mark alone does not
// prove that: a residual binding still reads the receiver off it, and dropping the tail bound that
// residual off the bare prefix instead (`name` came out undefined). the full-consume rows keep
// their lift, and the rest sibling keeps the whole init
const arr = [1];
const _ref = (0, Array);
export const of = _Array$of;
export const name = _nameMaybeFunction(_ref);
export const at = _atMaybeArray((0, arr));
export const from = _Array$from;
export const of2 = _Array$of;
export const { of: _unused, ...rest } = (0, Array);