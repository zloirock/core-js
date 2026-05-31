import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// an optional CALL on a polyfillable static (`Array.from?.(...)`) followed by TWO polyfillable
// instance methods (`.flat().at`). the polyfilled callee is always defined, so both plugins deopt
// the dead `?.` (unplugin also must: a guard over the bare callee would overlap the static rewrite
// range), and both trailing instance rewrites compose over the result. distinct from the single
// trailing-method case. regression lock
_atMaybeArray(_ref = _flatMaybeArray(_ref2 = _Array$from([1])).call(_ref2)).call(_ref, 0);