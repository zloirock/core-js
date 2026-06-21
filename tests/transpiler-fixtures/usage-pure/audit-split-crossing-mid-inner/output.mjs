import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3;
// chained polyfilled-static feeding a polyfilled instance: `Array.from(x).at(0)` composes
// an outer transform on `Array.from` with an inner transform on `.at`. the inner overwrite
// physically crosses the split prefix mid (the `).` between substituted receiver and the
// instance member) but stays safe. distinct methods per line lock every dispatch shape.
const r1 = _atMaybeArray(_ref = _Array$from(x)).call(_ref, 0);
const r2 = _flatMaybeArray(_ref2 = _Array$from(y)).call(_ref2);
const r3 = _includesMaybeArray(_ref3 = _Array$from(z)).call(_ref3, 1);