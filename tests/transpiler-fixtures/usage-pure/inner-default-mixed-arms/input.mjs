// A MIXED pattern under a receiver-bearing inner default - a flat constructor beside a nested static
// (`[{ Set: S, Array: { of } } = globalThis]`) - takes the one shared plan on every host, and the plan
// answers by the slot the default pairs with: mirrored whole where the slot proves `undefined` (a hole,
// an absent key) or stays open (a call), left as written where the slot proves a value (a binding that
// holds the user's object - its own members bind natively), and a caller a closed census sees (a named
// function called once, or once with a hole and once with the realm) settles the arm at the call. No
// inline default and no body-extracted binding stands beside the mirror: what the literal supplies is
// never undefined. Where no host spells the slot at all - a thrown value, a spread call the census
// cannot pair, a head over an iterable the source holds, a declarator over an opaque binding, at any depth above the default - the default alone is mirrored, hosted on
// the pattern that carries it, and the live value's own read stays native. Both legs read one plan.
const held = { Set: function HeldSet() { return held; }, Array: { of: x => [x, 'held'] } };
const pick = () => undefined;
export const iifeAbsent = (([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)])([]);
export const iifeBlock = (([{ Set: S, Array: { of } } = globalThis]) => { return [S, of(7)]; })([]);
export const iifeHeld = (([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)])([held]);
export const iifeOpen = (([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)])([pick()]);
export const iifeRealm = (([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)])([globalThis]);
export const iifeKeyed = (({ p: { Set: S, Array: { of } } = globalThis }) => [S, of(7)])({});
const [{ Set: declSet, Array: { of: declOf } } = globalThis] = [];
const [{ Set: heldSet, Array: { of: heldOf } } = globalThis] = [held];
const [{ Set: openSet, Array: { of: openOf } } = globalThis] = [pick()];
const { p: { Set: keyedSet, Array: { of: keyedOf } } = globalThis } = {};
let assignedSet, assignedOf;
[{ Set: assignedSet, Array: { of: assignedOf } } = globalThis] = [];
const once = ([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)];
export const calledOnce = once([]);
function twice([{ Set: S, Array: { of } } = globalThis]) { return [S, of(7)]; }
export const calledTwice = [twice([pick()]), twice([globalThis])];
let caughtSet, caughtOf;
try {
  throw [];
} catch ([{ Set: S, Array: { of } } = globalThis]) {
  caughtSet = S;
  caughtOf = of;
}
const spreadArgs = [[pick()]];
export const spread = once(...spreadArgs);
const rows = [[], [held]];
export const heads = [];
for (const [{ Set: S, Array: { of } } = globalThis] of rows) heads.push(S, of(7));
function viaOpaque(slot) { const [{ Set: S, Array: { of } } = globalThis] = slot; return [S, of(7)]; }
export const opaque = [viaOpaque([]), viaOpaque([held])];
function viaOpaqueKey(o) { const { p: { Set: S, Array: { of } } = globalThis } = o; return [S, of(7)]; }
function viaOpaqueTwoLevels(o) { const [{ k: { Set: S, Array: { of } } = globalThis } = {}] = o; return [S, of(7)]; }
export const opaqueDeep = [viaOpaqueKey({}), viaOpaqueTwoLevels([])];
export { declSet, declOf, heldSet, heldOf, openSet, openOf, keyedSet, keyedOf, assignedSet, assignedOf, caughtSet, caughtOf };
