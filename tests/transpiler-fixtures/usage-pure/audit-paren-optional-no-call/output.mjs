import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// paren-wrapped optional member used in lookup-only position (NO outer call):
// `(arr?.at)` assigned directly. since `isCall` is false, the standard non-call branch
// emits bare `_at(arr)` (with optional null-check on arr) - not the paren-lookup-only
// special case (which only fires when there's an outer non-optional call). distinct
// methods per line so the per-line dispatch is observable
const a = arr == null ? void 0 : _at(arr);
const b = arr == null ? void 0 : _flatMaybeArray(arr);
const c = arr == null ? void 0 : _includes(arr);
export { a, b, c };