// a `??` / `||` over `globalThis` or `self` - the realm object, guaranteed by the language or by its pure
// entry, never nullish or falsy - always yields its left, so the right side is dead and both channels
// collapse at any nesting: the static is substituted and typed (no `.name` dispatch on a number). `window`,
// which has no pure entry, a nav that can short-circuit and a conditional's two live arms keep the carrier
// opaque: the static reads through an identity guard on the `Number` it yields, a native static owner
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
