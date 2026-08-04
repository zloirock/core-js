import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$fround from "@core-js/pure/actual/math/fround";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _self from "@core-js/pure/actual/self";
// a guard belongs to the ARGUMENT it was built for. lifting it over the call the source wrote turns
// that argument's short-circuit into the whole call's, and the call then never runs where native
// runs it with an undefined argument. only a wrapper the PLUGIN builds around the claim may carry a
// guard outward - it stays undefined-tolerant, and the source's own call does not. the rows walk the
// syntactic contexts because the climb is decided per node, not per file
export const topLevel = _Array$of(null == _globalThis.window ? void 0 : _Math$trunc(1.5));
export function inFunction() {
  return _Array$of(null == _globalThis.window ? void 0 : _self.Math.round(0.4));
}
export const inArrow = () => _Array$of(null == _globalThis.window ? void 0 : _Number$parseFloat('1.5'));
export function paramDefault(a = _Array$of(null == _globalThis.window ? void 0 : _Math$sign(-2))) {
  return a;
}
export class Holder {
  field = _Array$of(null == _globalThis.window ? void 0 : _Math$cbrt(8));
  static stat = _Array$of(null == _globalThis.window ? void 0 : _Math$fround(1.5));
}
// the same call with the claim NOT alone in the argument list - the control that pins the single
// argument as the climb's trigger rather than the call itself
export const withSibling = _Array$of(0, null == _globalThis.window ? void 0 : _Math$trunc(2.5));
// a nested nav keeps its own test too: neither guard may swallow the other
export const nestedNav = null == _globalThis.window ? void 0 : _Array$of(null == _globalThis.window ? void 0 : _Math$expm1(0));