import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref;
// `Promise?.X.flat?.()` - the outer instance call rewrites the receiver `Promise?.X` to
// `_Promise.X`. the inner MemberExpression must be skipped, else its own `Promise -> _Promise`
// transform re-matches the needle `Promise` inside the already-substituted `_Promise.X` and
// composes the malformed `__Promise.X` (double underscore -> ReferenceError).
_flatMaybeArray(_ref = _Promise.X)?.call(_ref);