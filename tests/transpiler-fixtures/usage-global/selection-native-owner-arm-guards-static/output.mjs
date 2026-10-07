import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// A member read off a selection the build does not decide - an opaque operand, a realm read of a global
// core-js does not fill - injects the static of every constructor arm, whichever arm runs: a constructor
// core-js extends in place (`Array`, `Number`, `Object`, `String`, `Math`) and one it ships whole (`Promise`)
// alike; a name a local binding shadows is the user's value (no `Object.hasOwn` module)
const list = [1, 2];
export const viaOr = (shim || Array).from(list);
export const viaConditional = (flag ? Number : user).isInteger(7);
export const viaNullish = (source ?? Object).fromEntries([['k', 1]]);
export const viaRealmLeft = (globalThis.WeakRef || Array).of(3);
export const readOnly = (shim || String).raw;
let effects = 0;
export const effectOnce = (shim || (effects++, Math)).sumPrecise(list);
export const optionalCall = (source ?? Object).groupBy?.(list, x => x);
export const swappedArm = (shim || Promise).withResolvers();
export function shadowed(Object) {
  return (shim || Object).hasOwn({}, 'k');
}