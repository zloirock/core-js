import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A receiver literal contains a function whose body itself needs a polyfill.
// The literal is evaluated once, its computed key effect precedes extraction,
// and the nested function body keeps its polyfilled instance call.
let log = 0;
const _ref2 = [() => {
    var _ref;
    return _flatMaybeArray(_ref = [3, 4]).call(_ref);
  }],
  n = null == _ref2 ? _ref2[""] : (log++, _includesMaybeArray(_ref2));
export const out = [n, log];