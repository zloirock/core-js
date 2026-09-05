import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// the dead-tail lift drops a sequence tail whose value nothing reads. a skip-mark alone does not
// prove that: a residual binding still reads the receiver off it, and dropping the tail bound that
// residual off the bare prefix instead (`name` came out undefined). the full-consume rows keep
// their lift, and the rest sibling keeps the whole init.
// the sidecar is the re-reference of an EFFECT-FREE prefix: babel reads the peeled tail
// again, the unplugin memoizes it. nothing observes the difference while the prefix has no effects
const arr = [1];
export const of = _Array$of;
export const name = _nameMaybeFunction(Array);
export const at = _atMaybeArray((0, arr));
export const from = _Array$from;
export const of2 = _Array$of;
export const {
  of: _unused,
  ...rest
} = Array;