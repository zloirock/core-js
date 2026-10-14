import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A guard over a realm leaf pulls its tail in by the shared rule: the `?.` reading the ponyfill folds
// in, plain reads keep pulling, and a later `?.` over a value that can be absent stays outside on the
// guard's own value - over a long tail, and whatever spells the root.
const g = _globalThis;
const A = _globalThis.window;
export const direct = (null == _globalThis.window ? void 0 : _self.box?.alpha)?.beta;
export const viaAlias = (null == g.window ? void 0 : _self.cfg.opts?.gamma.delta)?.epsilon;
export const viaHeld = (null == A ? void 0 : _self.api?.zeta.eta)?.theta;
export const viaSelf = (null == _self.window ? void 0 : _self.store?.iota.kappa.lambda)?.mu;