import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// DUPLICATED receiver under a side-effect KEY (the residual survives so the key effect runs once): the
// receiver is copied into the extraction AND kept in place. its FUNCTION value's body (an instance call)
// must substitute in both copy and residual, visitor-driven like babel's clone, not left raw.
let log = 0;
const n = _includesMaybeArray([() => { var _ref; return _flatMaybeArray(_ref = [3, 4]).call(_ref); }]);
const { [(log++, 'includes')]: _unused } = [() => { var _ref; return _flatMaybeArray(_ref = [3, 4]).call(_ref); }];
export const out = [n, log];
