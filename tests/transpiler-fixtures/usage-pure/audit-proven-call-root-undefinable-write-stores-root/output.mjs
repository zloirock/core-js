import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// proving WHICH global a call root yields is not proving it yields a DEFINED one: a body that
// navigates to the environment probe is undefined off-window, so a `?.` over such a call is
// load-bearing. erased, the collapse read the ponyfill where the source short-circuits - and the
// plan built on that root rendered a test that dereferences the probe
let n = 0,
  w;
_globalThis.callRootBox = {
  list: [[1]]
};
// NEGATIVE: the write stores the always-defined root, so the source of undefined is the hop ABOVE it
// and the test keeps that read (`null == (held = _globalThis).window`)
let held;
export const writeStoresRoot = null == (_ref = null == (held = (n++, _globalThis)).window ? void 0 : _self.callRootBox.list) ? void 0 : _flatMaybeArray(_ref).call(_ref);
export { n };
export { held };