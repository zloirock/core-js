import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// Plain middle navigation collapses consistently inside and outside parameter default slots.
// A source-written optional window hop retains its probe, while an invented guard must not
// be added to a plain hop. Each form uses separate bindings so reassignment cannot mask this
// navigation decision.
let a1, a2, b1, b2, c1, c2, d1, d2, out;
function eff() {}
function aliasRooted({
  trunc
} = (a1 = _globalThis, a2 = _self, _Promise$race).zzz.Math) {
  return trunc;
}
function bareRooted({
  trunc
} = (b1 = (eff(), _self), _Promise).noSuchStatic.Math) {
  return trunc;
}
function liveProbe({
  trunc
} = null == (c1 = null == _globalThis.window ? void 0 : _self) ? void 0 : _Promise$race.zzz.Math) {
  return trunc;
}
export const outsideTheSlot = (d1 = _globalThis, d2 = _self, _Promise$race).zzz.Math;
out = [aliasRooted, bareRooted, liveProbe, b2, c2];
export const read = out;