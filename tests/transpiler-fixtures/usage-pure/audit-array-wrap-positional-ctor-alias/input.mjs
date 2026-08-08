// a multi-element array-wrap binds each ObjectPattern element to the init element at the SAME
// index: `A` reads `userObj.Set` (native, must NOT rewrite), `M` reads `globalThis.Map` (folds).
// resolving position-blindly (any element is a global) wrongly rewrote the user-object alias
const userObj = { Set: function () {} };
const [{ Set: A }, { Map: M }] = [userObj, globalThis];
export const viaUserElem = A.union(other);
export const viaGlobalElem = M.groupBy([], x => x);

// both-global multi-element: each folds to its own positional global
const [{ Array: F }, { Promise: P }] = [globalThis, globalThis];
export const viaBothA = F.from([1]);
export const viaBothB = P.allSettled([]);

// single-element user array-wrap stays native; single-element global folds
const only = { Map: function () {} };
const [{ Map: U }] = [only];
export const viaSingleUser = U.groupBy([], x => x);
const [{ Set: S }] = [globalThis];
export const viaSingleGlobal = new S(singleSeed);

// two whole-ctor extractions off ONE declarator keep their own per-name registrations: each
// alias's STATIC read folds through its own hint (a single per-declarator entry let the second
// registration clobber the first, stranding the first alias's reads on the local name)
const [{ Symbol: SM }, { Promise: MG }] = [globalThis, globalThis];
export const viaMultiExtractFirst = SM.for(dedupeKey);
export const viaMultiExtractSecond = MG.resolve(ready);

// a computed LITERAL key registers like the plain form; an SE-bearing computed key keeps its
// own slot verbatim (the effect runs once in the residual) while the SIBLING element still
// narrows through its sound positional pairing; a slot write of ONE hint's global deopts only
// that alias - the sibling keeps folding
const [{ ['WeakSet']: WS }, { Promise: PR }] = [globalThis, globalThis];
export const viaComputedLiteralKey = new WS();
export const viaComputedSibling = PR.allSettled([]);
let seKey = () => 'Number';
const [{ [seKey()]: NU }, { Math: MA }] = [globalThis, globalThis];
export const viaSeKey = NU.isFinite(value);
export const viaSeKeySibling = MA.sumPrecise(values);
const [{ String: ST }, { Object: OB }] = [globalThis, globalThis];
Object = shim;
export const viaDeoptSibling = ST.raw(parts);
export const viaDeoptedAlias = OB.groupBy(items, tag);

// a shared BOUND proxy alias feeding both elements resolves each slot independently (the walk
// guard is a recursion stack - a completed hop must not poison the sibling's identical init);
// a mutated proxy KEY declines only its own slot, the sibling still narrows
const g = globalThis;
const [{ Reflect: RE }, { JSON: JS }] = [g, g];
export const viaSharedAliasFirst = RE.ownKeys(target);
export const viaSharedAliasSecond = JS.rawJSON(input);
globalThis.RegExp = fake;
const [{ RegExp: RX }, { WeakMap: WM }] = [globalThis, globalThis];
export const viaMutatedKeySlot = RX.escape(text);
export const viaMutatedKeySibling = new WM(entries);

// a same-name `var` redeclaration MERGES its per-binding entries (last write's hint serves the
// use - runtime last-write-wins); a CONDITIONAL `var` refuses flow-trust and folds through the
// runtime constructor guard instead, keeping the untaken path faithful
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{ Symbol: VB }] = [globalThis];
var [{ Promise: VB }] = [globalThis];
export const viaVarRedecl = VB.try(fn);
function condVar(c) {
  if (c) { var [{ Iterator: CB }] = [globalThis]; }
  return CB && CB.range(0, c);
}
export const viaCondVar = condVar(cond);
/* eslint-enable no-redeclare, vars-on-top, block-scoped-var -- end of redeclaration shapes */

// a nested wrapper sibling that does NOT bind the name must not abort the positional scan
// (its subtree's "not found" is not a terminal answer) - the later element still resolves;
// a slot that DOES bind the name but cannot pair (spread-shifted inner init) keeps bailing
const [[{ URL: XU }], { Number: NP }] = [[globalThis], globalThis];
export const viaScanPastNestedSibling = NP.parseFloat(text);
let unp = [{}];
const [[{ Reflect: XR }], z0] = [[...unp], 0];
export const viaBoundUnpairable = XR.has(target, propKey);

// a deeper array-wrap layer BESIDE a sibling registers through the same positional recursion
// as the alias judge - the deep alias's static keeps its fold (the one-ObjectPattern-level
// registration walk stranded it raw in babel while unplugin re-derived it)
const [[{ Number: DN }], keep2] = [[globalThis], 1];
export const viaDeepSibling = DN.parseInt(digits, 10);

// a same-name redeclaration of STATICS-ONLY hints merges last-wins like the ctor form - the
// use folds through the last write's hint (runtime last-write-wins)
var [{ JSON: VR }] = [globalThis];
var [{ Math: VR }] = [globalThis];
export const viaStaticsRedecl = VR.cbrt(value2);

// DEEP array-wrap layers pair positionally too: the global slot folds even when nested two levels
const [[{ Promise: D }]] = [[globalThis]];
export const viaDeepGlobal = D.any([]);
// a deep user-object slot stays native at depth (positional protection recurses)
const box = { Array: function () {} };
const [[{ Array: Q }]] = [[box]];
export const viaDeepUser = Q.of(1);
