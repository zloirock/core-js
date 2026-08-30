// a `??` / `||` over a guaranteed realm name yields its left operand - `globalThis` by the
// language, `self` by the entry the injection itself provides - so a static read THROUGH the
// carrier injects its module and types as the realm's static, at every nesting level of the
// default: no `.name` here pulls es.function.name, every one reads off a NUMBER. the boundary:
// `window` has no entry and keeps the carrier opaque (no es.number.parse-float), like a nav
// that can short-circuit (no es.number.is-finite)
const overRealm = (globalThis ?? {}).Number.MAX_SAFE_INTEGER.name;
const overProbeName = (self ?? {}).Number.EPSILON.name;
const overProbeNameOr = (self || {}).Number.MIN_SAFE_INTEGER.name;
const overNestedDefault = ((self ?? {}) || {}).Number.isInteger(1);
const overProbeWindow = (window ?? {}).Number.parseFloat('1.5');
const overProbeNav = (globalThis.window?.self ?? { Number }).Number.isFinite(1);
const ctorOverRealm = new (globalThis ?? {}).Map();
const ctorOverProbeName = new (self ?? {}).Set();
export const read = [overRealm, overProbeName, overProbeNameOr, overNestedDefault, overProbeWindow, overProbeNav, ctorOverRealm, ctorOverProbeName];
