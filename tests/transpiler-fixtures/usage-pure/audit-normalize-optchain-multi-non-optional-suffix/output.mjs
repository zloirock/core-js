import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
// `normalizeOptionalChain` walking past multiple non-optional `.X(...).Y(...)` after the
// polyfilled inner. for `arr?.at(-1).valueOf().toString()` the polyfill replaces inner
// `arr?.at`, then `normalizeOptionalChain` must lift the wrap past chain continuations
// `.valueOf()` and `.toString()` (which are OptionalMember/OptionalCall with `.optional=false`
// when the chain root itself is optional). distinct outer methods per line for visibility
const a = arr == null ? void 0 : _at(arr).call(arr, -1).valueOf();
const b = arr == null ? void 0 : _flatMaybeArray(arr).call(arr).toString();
const c = arr == null ? void 0 : _includes(arr).call(arr, 'x').valueOf().toString();
export { a, b, c };