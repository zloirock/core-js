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
const overRealm = (globalThis ?? {}).Number.MAX_SAFE_INTEGER.name;
const overRealmOr = (globalThis || {}).Number.MAX_SAFE_INTEGER.name;
const overProbeName = (self ?? {}).Number.MAX_SAFE_INTEGER.name;
const overProbeNameOr = (self || {}).Number.MAX_SAFE_INTEGER.name;
const overNestedDefault = ((self ?? {}) || {}).Number.MAX_SAFE_INTEGER.name;
const overProbeWindow = (window ?? {}).Number.MAX_SAFE_INTEGER.name;
const overProbeNav = (globalThis.window?.self ?? { Number }).Number.MAX_SAFE_INTEGER.name;
const overConditional = (c ? globalThis : {}).Number.MAX_SAFE_INTEGER.name;
// the CTOR claim through the same carrier is a THIRD path: the receiver IS the logical there, where
// the static's receiver sits one member below it
const ctorOverRealm = new (globalThis ?? {}).Map();
const ctorOverProbeName = new (self ?? {}).Map();
const ctorOverProbeWindow = new (window ?? {}).Map();
out = [overRealm, overRealmOr, overProbeName, overProbeNameOr, overNestedDefault, overProbeWindow, overProbeNav, overConditional, ctorOverRealm, ctorOverProbeName, ctorOverProbeWindow];
export const read = out;
