import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// the caller-correct FALLBACK SLOT stops the probe rule: the slot fires only when nothing was passed,
// so a PLAIN undefinable receiver keeps the always-defined literal instead of an environment probe.
// asked in the shared plan, so both emitters answer one source alike - spelled per render channel they
// disagreed by channel, and by which pass happened to run last.
// each form gets its OWN bindings: a second write to the same alias deopts the follow, and the forms
// would then agree for a reason that has nothing to do with the slot.
// the last two are the negatives - a live `?.` IN the navigation is a branch the source wrote and
// keeps its probe inside the slot too, and the same plain navigation OUTSIDE a slot keeps its probe
let a1, a2, b1, b2, c1, c2, d1, d2, out;
function eff() {}
function aliasRooted({
  trunc
} = null == (a1 = _globalThis, a2 = _self) ? void 0 : _Promise$race.zzz.Math) {
  return trunc;
}
function bareRooted({
  trunc
} = null == (b1 = (eff(), _self)) ? void 0 : _Promise.noSuchStatic.Math) {
  return trunc;
}
function liveProbe({
  trunc
} = null == (c1 = null == _globalThis.window ? void 0 : _self) ? void 0 : _Promise$race.zzz.Math) {
  return trunc;
}
export const outsideTheSlot = null == (d1 = _globalThis, d2 = null == d1.window ? void 0 : _self) ? void 0 : _Promise$race.zzz.Math;
out = [aliasRooted, bareRooted, liveProbe, b2, c2];
export const read = out;