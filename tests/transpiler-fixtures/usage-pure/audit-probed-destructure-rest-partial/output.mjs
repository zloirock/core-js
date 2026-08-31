import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
export const viaRestDeclinedAnchor = _Math$trunc;
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// a REST sibling declines the single-prop anchor: the flat residual keeps the guard-value
// init (an always-defined receiver binding would erase the probe's throw AND hand rest the
// realm global); a flat PARTIAL consume off a probed member nav rides the same guard
export const {
  Math: _unused,
  ...viaRestRest
} = null == _globalThis.window ? void 0 : _self;
export const viaPartialProbed = _Number$isInteger;
export const {
  customZ: viaPartialCustom
} = null == _globalThis.window ? void 0 : _self.Number;