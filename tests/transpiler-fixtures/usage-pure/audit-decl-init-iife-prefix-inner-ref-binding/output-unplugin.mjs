import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// VariableDeclaration host with IIFE-bodied SE prefix containing an inner instance-method
// polyfill. inner `[1].at(0)` registers `var _ref;` inside the IIFE body DURING sibling
// traversal; the outer-polyfill emit must absorb that inner ref-decl into its replacement
// text BEFORE queuing the overwrite, otherwise the insert lands inside the overwrite range
((function () {
var _ref; return _atMaybeArray(_ref = [1]).call(_ref, 0); })(), Array);
const from = _Array$from;
from([2, 3]);