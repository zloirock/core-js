import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// A user-monkey-patched static no longer returns its known type, so the static-call return narrow must
// drop to generic: patched `Array.from(x)` could return anything, so `.at(0)` resolves through the generic
// `_at`, not a type-locked `_atMaybeArray`. The aliased `const af = Array.from; af(...)` path shares the
// root and also drops to generic (`_includes`). The gate is per-static - the unpatched `Array.of` still
// narrows to Array (`_atMaybeArray`)
Array.from = function (x) {
  return x;
};
_at(_ref = Array.from([1, 2])).call(_ref, 0);
const af = Array.from;
_includes(_ref2 = af([3, 4])).call(_ref2, 5);
_atMaybeArray(_ref3 = _Array$of(7, 8)).call(_ref3, 0);