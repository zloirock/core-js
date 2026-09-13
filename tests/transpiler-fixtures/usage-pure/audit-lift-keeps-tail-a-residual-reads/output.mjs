import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const arr = [1];
export const of = _Array$of;
export const name = _nameMaybeFunction(Array);
export const at = _atMaybeArray((0, arr));
export const from = _Array$from;
export const {
  of: of2,
  ...rest
} = (0, Array);