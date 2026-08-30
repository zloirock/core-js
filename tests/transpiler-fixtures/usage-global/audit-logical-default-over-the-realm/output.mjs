import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
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
const overProbeNav = (globalThis.window?.self ?? {
  Number
}).Number.isFinite(1);
const ctorOverRealm = new (globalThis ?? {}).Map();
const ctorOverProbeName = new (self ?? {}).Set();
export const read = [overRealm, overProbeName, overProbeNameOr, overNestedDefault, overProbeWindow, overProbeNav, ctorOverRealm, ctorOverProbeName];