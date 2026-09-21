// A call supplying the realm keeps its effects while nested static and instance claims compose.
// Pristine namespace hops need no independent value read after the call.
function realm() { log.push('r'); return globalThis; }
function quiet() { return globalThis; }
export const { groupBy: fromCall } = realm().Map;
export const { groupBy: fromParenCall } = (0, realm)().Map;
export const { groupBy: fromQuiet } = quiet().Map;
export const { of: fromNoEntry } = realm().Array;
let assigned;
({ groupBy: assigned } = realm().Map);
export { assigned };
// A nested INSTANCE leaf under a hop off a call the inline canon proves to yield a proxy global,
// running no effect on the way (`const g = () => globalThis`): the call reads as that global on both
// legs - the nav folds onto `_globalThis`, the discarded call owes nothing - beside a static sibling,
// under a sequence prefix (lifted, once), alone, and with a live default.
let eff = 0;
const g = () => globalThis;
const { Array: { prototype: { flat: nestedBesideStatic }, of: staticBeside } } = g();
const { Array: { prototype: { flat: nestedSeBesideStatic }, of: staticSeBeside } } = (eff++, g());
const { Array: { prototype: { flat: nestedSeSole } } } = (eff++, g());
const { Array: { prototype: { flat: nestedSole } } } = g();
const { Array: { prototype: { flat: nestedDefaulted = () => 1 }, of: staticDefaultedBeside } } = (eff++, g());
export { eff, nestedBesideStatic, staticBeside, nestedSeBesideStatic, staticSeBeside, nestedSeSole, nestedSole, nestedDefaulted, staticDefaultedBeside };
