import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// multiple non-optional `.X(...).Y(...)` continuations after the polyfilled inner. for
// `arr?.at(-1).valueOf().toString()` the polyfill replaces inner `arr?.at`, then the wrap
// must lift past `.valueOf()` and `.toString()` (OptionalMember/OptionalCall with
// `.optional=false` once the chain root is optional). distinct outer methods per line.
const a = arr == null ? void 0 : _at(arr).call(arr, -1).valueOf();
const b = arr == null ? void 0 : _flatMaybeArray(arr).call(arr).toString();
const c = arr == null ? void 0 : _includes(arr).call(arr, 'x').valueOf().toString();
export { a, b, c };