import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a VALUE-OBSERVING carrier (`??`) between the guarded chain and the static keeps the read on
// the carrier RESULT (the fallback object may own the key): the static is read off the carrier
// once and dispatched by IDENTITY - the realm constructor takes the ponyfill, any other value its
// own raw read - and the root SE runs once inside the kept test
const nc = () => _globalThis;
export const viaNullishCarrier = _at(_ref = (_ref2 = ((null == nc().window ? void 0 : _self) ?? {
  Array
}).Array, _ref2 === Array ? _Array$of(29) : _ref2.of(29))).call(_ref, 0);