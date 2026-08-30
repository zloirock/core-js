// a `??` / `||` over `globalThis` ITSELF always yields that left operand - the language guarantees the
// binding, and an object is neither nullish nor falsy - so the defensive right side is dead code. BOTH
// channels read through it: the TYPE channel (reading the carrier as opaque left the static untyped
// and pulled `function/instance/name` in for a `.name` on a NUMBER) and the VALUE channel (the static
// itself stayed a live read, which answers `undefined` on a host without it).
// the name matters, and so does the shape: `self` is an environment PROBE, a nav that can
// short-circuit makes the right side live, and a conditional is two arms with no dead one - all three
// keep the carrier opaque
let out;
const c = 1;
const overRealm = (globalThis ?? {}).Number.MAX_SAFE_INTEGER.name;
const overRealmOr = (globalThis || {}).Number.MAX_SAFE_INTEGER.name;
const overProbeName = (self ?? {}).Number.MAX_SAFE_INTEGER.name;
const overProbeNav = (globalThis.window?.self ?? { Number }).Number.MAX_SAFE_INTEGER.name;
const overConditional = (c ? globalThis : {}).Number.MAX_SAFE_INTEGER.name;
// the CTOR claim through the same carrier is a THIRD path: the receiver IS the logical there, where
// the static's receiver sits one member below it
const ctorOverRealm = new (globalThis ?? {}).Map();
const ctorOverProbeName = new (self ?? {}).Map();
out = [overRealm, overRealmOr, overProbeName, overProbeNav, overConditional, ctorOverRealm, ctorOverProbeName];
export const read = out;
