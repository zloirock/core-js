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

// DEEP array-wrap layers pair positionally too: the global slot folds even when nested two levels
const [[{ Promise: D }]] = [[globalThis]];
export const viaDeepGlobal = D.any([]);
// a deep user-object slot stays native at depth (positional protection recurses)
const box = { Array: function () {} };
const [[{ Array: Q }]] = [[box]];
export const viaDeepUser = Q.of(1);
