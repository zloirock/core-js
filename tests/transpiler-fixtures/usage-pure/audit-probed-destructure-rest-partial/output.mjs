import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// a destructure over a probe nav extracts its claimed statics ahead of the residual that keeps the
// probe: beside a rest the residual keeps the claimed key as an exclusion, beside a plain key it keeps
// that key alone. the residual still reads the guarded value, so it throws where native does.
export const viaRestDeclinedAnchor = _Math$trunc;
const {
  Math: _unused,
  ...viaRestRest
} = null == _globalThis.window ? void 0 : _self;
export { viaRestRest };
export const viaPartialProbed = _Number$isInteger;
export const {
  customZ: viaPartialCustom
} = null == _globalThis.window ? void 0 : _self.Number;