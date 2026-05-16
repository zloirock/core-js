import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref;
// `Promise?.X.flat?.()` - outer instance-call emission resolves the receiver chain
// `Promise?.X` to substituted text `_Promise.X` (Promise leaf replaced with the pure
// import). without skipping the inner MemberExpression too, its per-member fallback
// also queues a transform on `Promise -> _Promise`, and substring-composition matches
// the inner needle `Promise` inside the outer's substituted `_Promise.X` content,
// producing the malformed `__Promise.X` (double underscore -> ReferenceError).
_flatMaybeArray(_ref = _Promise.X)?.call(_ref);