import _globalThis from "@core-js/pure/actual/global-this";
import _Object$is from "@core-js/pure/actual/object/is";
import _self from "@core-js/pure/actual/self";
// probe-carrying synth reaches the remaining HOSTS through their own visitors: a for-init
// extracted binding and a class-field IIFE param default (SE-key rides the probe once)
let c6 = 0;
class SealedHost {
  field = (({
    is: fv
  } = ((null == _globalThis.window ? void 0 : (c6++, _self)).Object, {
    is: _Object$is
  })) => fv)();
}
export const sealedHost = new SealedHost();
export { c6 };