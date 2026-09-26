import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a `??` / `||` over a guaranteed realm name ITSELF always yields that left operand - `globalThis`
// is guaranteed by the language, `self` by its own pure entry (the read resolves through the
// ponyfill, always the realm object) - and an object is neither nullish nor falsy, so the defensive
// right side is dead code and BOTH channels collapse: the TYPE channel types the static (no
// `function/instance/name` for a `.name` on a NUMBER) and the VALUE channel substitutes it. the
// guarantee holds at every nesting level, so a stacked default collapses too.
// the boundary: `window` has no pure entry and stays the environment PROBE, a nav that can
// short-circuit makes the right side live, and a conditional is two arms with no dead one - all
// three keep the carrier opaque
let out;
const c = 1;
const overRealm = _Number$MAX_SAFE_INTEGER.name;
const overRealmOr = _Number$MAX_SAFE_INTEGER.name;
const overProbeName = _Number$MAX_SAFE_INTEGER.name;
const overProbeNameOr = _Number$MAX_SAFE_INTEGER.name;
const overNestedDefault = _Number$MAX_SAFE_INTEGER.name;
const overProbeWindow = _nameMaybeFunction((window ?? {}).Number.MAX_SAFE_INTEGER);
const overProbeNav = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self) ?? {
  Number
}).Number.MAX_SAFE_INTEGER);
const overConditional = _nameMaybeFunction((c ? _globalThis : {}).Number.MAX_SAFE_INTEGER);
// the CTOR claim through the same carrier is a THIRD path: the receiver IS the logical there, where
// the static's receiver sits one member below it
const ctorOverRealm = new _Map();
const ctorOverProbeName = new _Map();
const ctorOverProbeWindow = new (window ?? {}).Map();
out = [overRealm, overRealmOr, overProbeName, overProbeNameOr, overNestedDefault, overProbeWindow, overProbeNav, overConditional, ctorOverRealm, ctorOverProbeName, ctorOverProbeWindow];
export const read = out;