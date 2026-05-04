import _getIterator from "@core-js/pure/actual/get-iterator";
import _at from "@core-js/pure/actual/instance/at";
// comments in the slot between `?.` and the call / computed-bracket token. the helper
// must classify these as call-optional / computed-optional after the comment scan, not
// fall through to the prop-keep branch. distinct method names per line make the per-line
// dispatch visible. line c covers paren-wrapped optional member with optional outer call:
// `(arr?.at)?.(0)` is semantically equivalent to `arr?.at?.(0)` (Reference Type preserved
// through parens), so `replaceInstanceLike` falls through to the standard `buildMethodCall`
// path and emits proper `.call(arr, 0)` receiver-binding
const a = arr?. /* call */(0);
const b = obj == null ? void 0 : _getIterator(obj);
const c = arr == null ? void 0 : _at(arr)?.call(arr, 0) /* call */;