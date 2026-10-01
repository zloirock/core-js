import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref;
// `Map?.X.flat?.()` - parity with Promise-leaf bail case: outer instance-call emission
// resolves the receiver chain `Map?.X` to the substituted `_Map.X`. the inner
// MemberExpression's own `Map` substitution must not fire again inside the already-substituted
// receiver - a substring-blind rewrite once produced `__Map.X` (double underscore, a
// ReferenceError at runtime).
_flatMaybeArray(_ref = _Map.X)?.call(_ref);