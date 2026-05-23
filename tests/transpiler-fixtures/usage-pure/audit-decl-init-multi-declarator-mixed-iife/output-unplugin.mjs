import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
// multi-declarator VariableDeclaration where ONE declarator has IIFE-bodied SE init with
// an inner instance polyfill, the OTHER has a plain init. emitPolyfilled must drain refs
// only for the SE-init declarator's range, leaving the plain one untouched. uses `.at` in
// the IIFE so the inner `_ref` declaration is identifiable; second declarator's init is a
// bare polyfilled static so its emit shape is independent
((function () {
var _ref; return _atMaybeArray(_ref = [1]).call(_ref, 0); })(), Array);
const from = _Array$from;
const of = _Array$of;
from([2]);
of(3);