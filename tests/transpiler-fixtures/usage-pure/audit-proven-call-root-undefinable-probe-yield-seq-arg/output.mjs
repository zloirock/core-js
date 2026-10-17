import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// proving WHICH global a call root yields is not proving it yields a DEFINED one: a body that
// navigates to the environment probe is undefined off-window, so a `?.` over such a call is
// load-bearing. erased, the collapse read the ponyfill where the source short-circuits - and the
// plan built on that root rendered a test that dereferences the probe
let n = 0,
  w;
const provenProbe = () => _globalThis.window;
export { n };
export const probeYieldSeqArg = null == (n++, provenProbe(n++)) ? void 0 : _atMaybeArray(_ref = _Array$of(3)).call(_ref, 0);