import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// two polyfillable instance calls in one optional chain `x?.a().b()`: each call site
// is rewritten and the chain guard is shared correctly.
null == (_ref = arr == null ? void 0 : _at(arr).call(arr, 0)) ? void 0 : _includes(_ref).call(_ref, 1);