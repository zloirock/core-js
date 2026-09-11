import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref;
const m = _flatMaybeArray([1, _Promise]);
// the residual-extract copies the receiver beside the kept residual; a global nested in the literal
// receiver must be substituted in the COPY too (the in-place residual's visitor rewrite can't reach it),
// else the extracted call ReferenceErrors on engines lacking the global
const {
  [(effectful(), 'flat')]: _unused
} = [1, _Promise];
const probe = _atMaybeArray(_ref = [3]).call(_ref, 0);