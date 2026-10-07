// A member read off a selection the build does not decide - an opaque operand, a realm read of a global
// core-js does not fill - keeps the selection, captured once, and an arm naming a constructor core-js ships no
// replacement of takes its static through the identity guard, the call riding each branch; an arm swapped
// whole reads its own statics (`Promise`), and a name a local binding shadows is the user's value
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
