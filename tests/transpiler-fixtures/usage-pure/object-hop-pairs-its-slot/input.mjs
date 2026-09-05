// a sole-key object hop pairs with the slot it names, exactly as an array wrapper pairs with its
// sole element: the level is consumed and the claim below it reads the value standing there. a
// GETTER pairs too where its body is one pure return - the read yields that value and the consumed
// level drops nothing observable. what keeps a level whole is what dropping the literal would take
// with it: a getter body with an effect, an unnameable key that could BE this one at runtime, an
// accessor-free spread that could override it (usage-global resolves through that one - it injects
// where the slot MIGHT be read, and over-injection is its safe side). the getter rows live HERE
// rather than in the runtime suite: its baseline forbids ES5 accessors, so only bytes can hold them
const other = {};
const { w: { Map: hopCtor } } = { w: globalThis };
const src = { P: Array };
const { P: { from: hopStatic } } = src;
const { w: { WeakMap: hopThroughGetter } } = { get w() { return globalThis; } };
// ... and a hop VALUE that navigates to the realm names the constructor its key spells, the way the
// flat spelling of the same receiver does - the leaf answers a ctor ON the realm, not a static OF it
const { w: { Array: { from: hopThroughNav } } } = { w: globalThis.globalThis };
const { w: { WeakSet: keptByGetterEffect } } = { get w() { mark(); return globalThis; } };
function keptBySpread(extra) {
  const { w: { Array: { of: kept } } } = { w: globalThis, ...extra };
  return kept;
}
// a binding REASSIGNED between realm names holds one object under several spellings, so a read
// through it answers the same whichever write reached the use - the claim stands
let realmAlias = globalThis;
realmAlias = self;
const { w: { Map: viaRealmAlias } } = { w: realmAlias };
// ... and only while the slots stand: a name the file REPLACES holds the user's object, and the
// values are no longer one realm - the leaf below it stays native
globalThis.window = { Map: other };
let mutatedAlias = globalThis;
mutatedAlias = window;
const { w: { Map: viaMutatedAlias } } = { w: mutatedAlias };
// a SEQUENCE the source wrote around the paired value owes its prefix: the dispatch spells the value
// the collapse takes, never the comma run in front of it, so the literal stays and runs it
function seqPrefixKeepsLiteral(bump) {
  const { w: { [Symbol.iterator]: viaPrefix } } = { w: (bump(), globalThis) };
  return viaPrefix;
}
// a spread standing BEFORE the key is an effect of its own - it reads the source's own enumerable
// keys - so the literal outlives the claim that reads through it, husk and all. the husk keeps its
// own KEY too: a well-known-symbol sentinel reads the realm's `Symbol`, so it takes the ponyfill
function symbolBehindSpread(extra) {
  const { w: { [Symbol.iterator]: aheadSymbol } } = { ...extra, w: globalThis };
  return aheadSymbol;
}
// ... a STATIC claim behind the same spread keeps it too: the extraction takes the pure binding
// and the husk stays, so the read the spread performs still runs where the source wrote it
function staticBehindSpread(extra) {
  const { w: { Array: { from: aheadStatic } } } = { ...extra, w: globalThis };
  return aheadStatic;
}
// ... and so does a CTOR claim over the same level: the alias binds the ponyfill rather than the
// realm's own name, and the husk keeps the read the spread performs
// (the effect-bearing SIBLING spelling of this row lives in the differential instead: the legs print
// one runtime there in two shapes - husk against sequence prefix - which bytes cannot hold)
function ctorBehindSpread(extra) {
  const { w: { Map: behindSpread } } = { ...extra, w: globalThis };
  return behindSpread;
}
function keptByKey(key) {
  const ns = { Q: Array, [key]: Map };
  const { Q: { of: kept } } = ns;
  return kept;
}
// a key standing AFTER the match that nothing can name could BE the slot at runtime, so the level
// stays whole on every host - the canonical resolver asks the pairing's own rule
function keptByUnnameableKey(key) {
  const { w: { Map: keptDecl } } = { w: globalThis, [key]: other };
  let keptAssign;
  ({ w: { Map: keptAssign } } = { w: globalThis, [key]: other });
  return [keptDecl, keptAssign];
}
// ... while a key that FOLDS through its binding names another slot and leaves the pairing alone,
// on the symbol route as on every other - the resolver folds it with the same scope the pairing uses
const boundKey = 'q';
const { w: { [Symbol.iterator]: viaBoundKey } } = { w: globalThis, [boundKey]: other };
// a value the level SELECTS between arms is the selecting-receiver channel's, not a pair
const { w: { WeakRef: keptByBranch } } = { w: other ? globalThis : globalThis };
// a NUMERIC key names a slot like any other, and a write to it keeps the level whole all the same
const holder = { 0: globalThis };
holder[0] = other;
const { 0: { Promise: keptByWrite } } = holder;
// the slot read through the value canon at every depth, on every host: a NESTED comma run, a
// defensive realm default (`?? {}`, `|| {}`, nested), a `?.` off a guaranteed realm name - each
// is the value the flat spelling reads, and the ASSIGNMENT host reads it the same way. the
// assignment host lifts a comma run ahead of the extraction and reads a nav past the literal's
// slot for a receiver-less claim, where a kept literal shipped the claim native
const { w: { Map: viaOrDefault } } = { w: globalThis || {} };
function nestedSeqKeepsLiteral(f, g) {
  const { w: { Array: { from: viaNestedSeq } } } = { w: (f(), (g(), globalThis)) };
  return viaNestedSeq;
}
function seqDefaultKeepsLiteral(f) {
  const { w: { Map: viaSeqDefault } } = { w: (f(), globalThis ?? {}) };
  return viaSeqDefault;
}
const { w: { Map: viaNestedDefault } } = { w: (globalThis ?? {}) ?? {} };
const [{ Map: wrapNestedDefault }] = [(globalThis ?? {}) ?? {}];
const { w: { Map: viaOptionalNav } } = { w: globalThis?.globalThis };
const { w: { Array: { prototype: { at: viaOptionalNavInstance } } } } = { w: globalThis?.globalThis };
const { w: { [Symbol.iterator]: viaOptionalNavSymbol } } = { w: globalThis?.globalThis };
function assignForms(f, g) {
  let nestedSeq;
  let seqDefault;
  let hopOrDefault;
  let hopNav;
  let hopOptional;
  ({ Array: { from: nestedSeq } } = (f(), (g(), globalThis)));
  ({ Map: seqDefault } = (f(), globalThis ?? {}));
  ({ w: { Map: hopOrDefault } } = { w: globalThis || {} });
  ({ w: { Array: { from: hopNav } } } = { w: globalThis });
  ({ w: { Map: hopOptional } } = { w: globalThis?.globalThis });
  // ... and a SLOT carrying the prefix: the literal stays as a statement of its own, running the
  // prefix where the source ran it, and the level consumes
  let hopSeq;
  let hopSeqDefault;
  ({ w: { Array: { from: hopSeq } } } = { w: (f(), (g(), globalThis)) });
  ({ w: { Map: hopSeqDefault } } = { w: (f(), globalThis ?? {}) });
  return [nestedSeq, seqDefault, hopOrDefault, hopNav, hopOptional, hopSeq, hopSeqDefault];
}
// a binding reassigned to a realm name from INSIDE a nested function: the write is reachable and
// every reachable value names the realm, so the hop reads it as the flat form does - a static
// claims, an instance key stays native (the realm object carries no `at`)
let closedAlias = globalThis;
function closeOver() {
  closedAlias = self;
}
const { w: { Array: { from: viaClosedAlias } } } = { w: closedAlias };
const { w: { at: noClaimOnClosedAlias } } = { w: closedAlias };
// ... and NOT where the reaching write proves nothing: a write under an optional spine may never
// run (`a?.[g = globalThis]`), and a `var` re-declaration inside a block reads its init THERE, where
// a block-scoped shadow may hold something else - both hops stay native, like their flat twins
const maybeNull = null;
let underOptional = other;
maybeNull?.[underOptional = globalThis];
const { w: { Map: noClaimUnderOptionalWrite } } = { w: underOptional };
const outerSrc = globalThis;
var shadowed = outerSrc;
{
  const outerSrc = other;
  var shadowed = outerSrc;
}
const { w: { Map: noClaimBehindBlockShadow } } = { w: shadowed };
// the hop on the hosts that MIRROR their receiver - a parameter default, a for-of head element, an
// IIFE argument: a literal container in the slot pairs the hop key with its slot value, and the
// mirror lands IN that slot (the container stays as written), for a ctor, a static and an instance
// leaf alike - the flat parameter's synth one level down. an own-pass mirror is never re-mirrored:
// a pattern-valued leaf under a mirrored static receives the ponyfill VALUE
function paramHop({ w: { Map: viaParamCtor } } = { w: globalThis }) {
  return viaParamCtor;
}
function paramHopStatic({ w: { Array: { from: viaParamStatic } } } = { w: globalThis }) {
  return viaParamStatic;
}
function paramHopInstance({ w: { at: viaParamInstance } } = { w: [1, 2] }) {
  return viaParamInstance;
}
function paramHopWrapped([{ w: { Map: viaParamWrapped } }] = [{ w: globalThis }]) {
  return viaParamWrapped;
}
function forOfHop() {
  const out = [];
  for (const { w: { Map: viaHeadCtor } } of [{ w: globalThis }]) out.push(viaHeadCtor);
  return out;
}
const viaIifeCtor = (({ w: { Map: m } }) => m)({ w: globalThis });
// ... and an ARRAY wrapper on the way is one more hop of the same descent
function paramWrappedInstance([{ w: { at: viaWrappedInstance } }] = [{ w: [1, 2] }]) {
  return viaWrappedInstance;
}
// ... on the IIFE argument too, and a for-of head's wrapped element types its slot through the
// wrapper level exactly as the flat head types the element
const viaIifeWrappedStatic = (([{ w: { Array: { from: m } } }]) => m)([{ w: globalThis }]);
function forOfWrapped() {
  const out = [];
  for (const [{ w: { at: viaWrappedHead } }] of [[{ w: [1, 2] }]]) out.push(viaWrappedHead);
  return out;
}
// a BOUND computed hop key folds through the consuming canon on the mirroring hosts too, and an IIFE
// argument's sequence TAIL is what the instance synth types (the prefix stays where the call wrote it)
const hopKey = 'w';
function boundKeyParam({ [hopKey]: { Map: viaBoundKeyParam } } = { w: globalThis }) {
  return viaBoundKeyParam;
}
const viaBoundKeyIife = (({ [hopKey]: { at: m } }) => m)({ w: [1, 2] });
const viaSeqArg = (({ at: m }) => m)((mark(), [1, 2]));
const viaIifeInstance = (({ w: { at: m } }) => m)({ w: [1, 2] });
function mark() {}
// a BOUND computed hop key names its slot on every host the consume reaches - the declaration (a
// ctor and an instance leaf), the followed alias, the identifier init, the loop head and the catch
// clause - exactly as the literal spelling does; a wrapper standing UNDER the key pairs its slot
// like one standing over it, on the declaration and the assignment host alike
const hopSlot = 'w';
const { [hopSlot]: { Map: viaBoundHopCtor } } = { w: globalThis };
const { [hopSlot]: { at: viaBoundHopAt } } = { w: [1, 2] };
const hopAlias = { w: [3, 4] };
const { [hopSlot]: { at: viaBoundHopAlias } } = hopAlias;
function viaBoundHopIdent(box) {
  const { [hopSlot]: { at: viaIdent } } = box;
  return viaIdent;
}
function viaBoundHopHeads(list) {
  const out = [];
  for (const { [hopSlot]: { at: headAt } } of list) out.push(headAt);
  const thrown = new Error('x');
  thrown.w = [10];
  try {
    throw thrown;
  } catch ({ [hopSlot]: { at: caughtAt } }) {
    out.push(caughtAt);
  }
  return out;
}
const { [hopSlot]: [{ at: viaKeyedWrapper }] } = { w: [[1, 2]] };
let assignKeyedWrapper;
({ [hopSlot]: [{ at: assignKeyedWrapper }] } = { w: [[1, 2]] });
// an emptied hop beside a REST on an assignment host writes the sentinel it mints, and a write to
// an undeclared name throws in strict code - so the host declares it
function restAssignSentinel() {
  let restAt;
  let restRest;
  ({ w: { at: restAt }, ...restRest } = { w: [1, 2], z: 1 });
  return [restAt, restRest];
}

// an instance leaf over a slot with a COMMA RUN in front of it rides the prefix inside its dispatch,
// exactly as the flat spelling does (`_at((mark(), arr))`) - on the declaration and under an array
// wrapper alike; a claim INSIDE the prefix is rewritten where it stands
function viaSeqSlot(mark, arr) {
  const { w: { at: viaSeq } } = { w: (mark(), arr) };
  const [{ w: { at: viaSeqWrapped } }] = [{ w: (mark(), arr) }];
  const { w: { at: viaSeqClaim } } = { w: (arr.at(0), arr) };
  return [viaSeq, viaSeqWrapped, viaSeqClaim];
}
// a REST beside the hop keeps the level alive the way a spread in the literal does: the ctor and the
// static leaf extract and leave a sentinel keeping the key excluded, the residual runs where it stood
function ctorUnderRest() {
  const { w: { Map: restCtor }, ...restDecl } = { w: globalThis, z: 1 };
  let restAssign;
  let restAssignRest;
  ({ w: { Map: restAssign }, ...restAssignRest } = { w: globalThis, z: 2 });
  const { w: { Array: { of: restStatic } }, ...restStaticRest } = { w: globalThis, z: 3 };
  return [restCtor, restDecl, restAssign, restAssignRest, restStatic, restStaticRest];
}
// a dead wrapper whose init still carries a DISCARDED effect re-emits it as a statement where the
// declaration stood (`eff2();`), never a `[{}]` husk
function liftedHusk(eff, eff2) {
  const [{ w: { at: liftedAt } }] = [{ w: eff() }, eff2()];
  return liftedAt;
}
// a CONSTANT LITERAL behind a sentinel memoizes on both legs: the source built one array
function literalBehindSpread(extra) {
  const { w: { at: behindSpreadAt } } = { ...extra, w: [1, 2] };
  return behindSpreadAt;
}

// an instance leaf under a hop over a slot the level cannot spell twice, while the level stays
// WHOLE (a sibling, a rest): the slot value moves to a ref both readers take - hoisted ahead of the
// declaration where nothing observable stands before the slot, written IN the slot behind an
// observable property (`w: _ref = eff()`, the extraction reading the ref after the destructure);
// a relaxed single read (a member) takes the same shape, so its getter fires once and in order
function slotMemoHoist(eff, holder) {
  const { w: { at: slotHoist }, z } = { w: eff(), z: 1 };
  const { a, w: { at: slotInSlot } } = { a: eff(), w: eff() };
  const { w: { at: slotRest }, ...slotRestRest } = { w: eff(), z: 2 };
  const { p: { w: { at: slotNested } }, q } = { p: { w: eff() }, q: 3 };
  const { b, w: { at: slotMember } } = { b: eff(), w: holder.p };
  return [slotHoist, z, slotInSlot, a, slotRest, slotRestRest, slotNested, q, slotMember, b];
}

// a hop under a wrapper that DIES behind an effectful hole: the hole's effect lifts ahead, and the
// slot value memoizes like the flat twin's element (`eff(); const _ref = getArr(); _at(_ref)`) rather
// than riding the dispatch
function holeThenSlot(eff, getArr) {
  const [, { y: { at: holeAt } }] = [eff(), { y: getArr() }];
  return holeAt;
}

// ... and beside a SIBLING DECLARATOR the slot memo takes the same two shapes: hoisted ahead of the
// declaration, or written in its slot - never the sibling-append the plain kept-key residual takes;
// two leaves off one slot share the one write (`w: _ref = eff()`, both dispatches reading `_ref`)
function slotMemoSiblingDecl(eff) {
  const { w: { at: sibHoist }, z } = { w: eff(), z: 1 }, sibQ = 2;
  const { a, w: { at: sibInSlot } } = { a: eff(), w: eff() }, sibQ2 = 3;
  const { b, w: { at: twinAt, flat: twinFlat } } = { b: eff(), w: eff() };
  return [sibHoist, z, sibQ, sibInSlot, a, sibQ2, twinAt, twinFlat, b];
}

// the flat twin's own in-slot family: a SOLE-prop pattern behind an effectful neighbour that keeps
// the level alive (a sibling, a rest) memoizes in its slot too; an effect in a slot the pattern
// DISCARDS ahead of the claim lifts as a statement, and the memo hoists behind it - while a discarded
// slot BEHIND a bound one stays where it is, and the memo is written in its slot
function inSlotFlatFamily(eff, eff2, eff3) {
  const [fa, { at: flatInSlot }] = [eff(), eff()];
  const [fb, { at: flatRestSlot }, ...flatRest] = [eff(), eff()];
  const [, { at: liftedThenSlot }, fz] = [eff(), eff(), 1];
  const [fx, , { at: boundThenHole }] = [1, eff2(), eff3()];
  const [, { y: { at: liftedHopSlot } }, fz2] = [eff(), { y: eff() }, 1];
  return [fa, flatInSlot, fb, flatRestSlot, flatRest, liftedThenSlot, fz, fx, boundThenHole, liftedHopSlot, fz2];
}

// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
export const { ea, w: { at: exportInSlot } } = { ea: tick(1), w: tick([1, 2]) }, exportQ = 2;
export const [eb, { at: exportFlatInSlot }] = [tick(2), tick([3, 4])], exportQ2 = ticks;
// ... and a hoisted memo behind a LEADING sibling's own init stays behind it under the wrapper as well
export const exportLead = tick(3), [{ at: exportBehindLead }, ec] = [tick([5, 6]), 1];
export const exportLead2 = tick(4), { w: { at: exportHopBehindLead }, ed } = { w: tick([7, 8]), ed: 1 };
// ... and a wrapped STATIC beside its sibling declarator joins the same way, exported with its host
// - two of them, one per host; a mixed pair splits by declarator, the static joining its own host
export const [{ Set: exportWrappedSet }, ee] = [globalThis, 2], [{ Map: exportWrappedMap }, ef] = [globalThis, 3];
export const { w: { Map: exportHopMap }, eg } = { w: globalThis, eg: 4 }, [{ Set: exportWrappedBeside }, eh] = [globalThis, 5];

// two claimed hosts in ONE declaration take the sibling-declarator canon each: an object hop beside
// an array wrapper (either order), two array wrappers, each memo standing behind the declarators
// written ahead of its host and the join resuming after it; a symbol leaf under a hop beside a
// sibling takes the slot memo like the instance leaf of the same slot
function twoHostsOneDeclaration(eff) {
  const { a, w: { at: hostObjAt } } = { a: eff(), w: eff() }, [{ flat: hostArrFlat }, hz] = [eff(), 1];
  const [{ flat: firstFlat }, fz] = [eff(), 1], mid = 3, [{ at: secondAt }, sz] = [eff(), 2], tail = 4;
  const { b, w: { [Symbol.iterator]: symInSlot } } = { b: eff(), w: eff() };
  const { w: { [Symbol.iterator]: symHoist }, c } = { w: eff(), c: 1 }, symQ = 2;
  return [a, hostObjAt, hostArrFlat, hz, firstFlat, fz, mid, secondAt, sz, tail, b, symInSlot, symHoist, c, symQ];
}

// a ctor under a literal hop whose level keeps a SIBLING prop consumes on both legs, like a static
// under the same hop: the leaf leaves with its emptied hop, the sibling keeps the residual
function ctorBesideSibling(eff) {
  const { w: { Map: sibMap }, z } = { w: globalThis, z: 1 };
  const { a, w: { Set: sibSet, WeakMap: sibWeakMap } } = { a: eff(), w: globalThis };
  const { w: { Map: sibMultiMap }, y } = { w: self, y: 2 }, sibQ = 3;
  return [sibMap, z, sibSet, sibWeakMap, a, sibMultiMap, y, sibQ];
}

// a consumed leaf's own default keeps its guard at every depth on both legs - the flat twin's
// spelling, dead text at runtime since the pure is always defined: a ctor or a static under a hop,
// under a wrapper element, beside a sibling
function defaultKeepsGuard() {
  const { w: { Map: dfMap = null }, z } = { w: globalThis, z: 1 };
  const { Array: { from: dfFrom = null } } = globalThis;
  const [{ of: dfOf = null }, y] = [Array, 2];
  const { w: { Array: { from: dfDeep = null } } } = { w: globalThis };
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}

// a literal holding an OBSERVABLE sibling value keeps a deep nav claim under its hop only where the
// residual dies with the leaf; a SIBLING binding keeps the residual - the literal evaluates there,
// the effect runs where the source ran it, and the claim consumes like the shallow twin's. a symbol
// leaf under the hop keeps its sentinel beside the sibling
function siblingKeepsResidual(hit) {
  const { w: { Array: { prototype: { at: deepBeside } } }, z: sibZ } = { w: globalThis, z: (hit(), 1) };
  const { w: { Array: { prototype: { at: deepAlone } } } } = { w: globalThis, z: (hit(), 2) };
  const { w: { [Symbol.iterator]: symBeside }, y: sibY } = { w: globalThis, y: (hit(), 3) };
  return [deepBeside, sibZ, deepAlone, symBeside, sibY];
}

// a leaf that NAVIGATES on from a memoized slot dispatches on the surface spelled off the ref
// (`_ref.Array.prototype`) - written in its slot behind an observable property, hoisted otherwise,
// two leaves sharing the one write; an ASSIGNMENT host with the same nav reads the surface off the
// realm's pure binding, its residual keeping the sibling and every effect the literal holds
function navBelowMemoSlot(hit) {
  const { w: { Array: { prototype: { at: navInSlot } } }, z: nz } = { z: (hit(), 1), w: (hit(), globalThis) };
  const { w: { Array: { prototype: { at: navHoist } } }, y: ny } = { w: (hit(), globalThis), y: 2 };
  const { w: { Array: { prototype: { at: navTwinAt, flat: navTwinFlat } } }, x: nx } = { x: (hit(), 3), w: (hit(), globalThis) };
  let navAssign, na, navAssignAlone, navAssignEffect, ne;
  ({ w: { Array: { prototype: { at: navAssign } } }, a: na } = { w: globalThis, a: 4 });
  ({ w: { Array: { prototype: { at: navAssignAlone } } } } = { w: globalThis });
  ({ w: { Array: { prototype: { at: navAssignEffect } } }, e: ne } = { e: (hit(), 5), w: (hit(), globalThis) });
  return [navInSlot, nz, navHoist, ny, navTwinAt, navTwinFlat, nx, navAssign, na, navAssignAlone, navAssignEffect, ne];
}

// a declaration hosting an object hop AND a wrapped static: the hop's declarator splits off, and
// the static still joins the host it was written beside (the split does not undo the join)
function mixedHopAndWrappedStatic() {
  const { w: { Map: mixedMap }, z: mz } = { w: globalThis, z: 1 }, [{ Set: mixedSet }, my] = [globalThis, 2];
  return [mixedMap, mz, mixedSet, my];
}

export default [
  hopCtor,
  hopStatic,
  hopThroughGetter,
  hopThroughNav,
  viaRealmAlias,
  viaMutatedAlias,
  keptByGetterEffect,
  keptByBranch,
  keptBySpread({}),
  symbolBehindSpread({}),
  staticBehindSpread({}),
  ctorBehindSpread({}),
  seqPrefixKeepsLiteral(() => 1),
  keptByKey('Q'),
  keptByUnnameableKey('q'),
  viaBoundKey,
  keptByWrite,
  viaOrDefault,
  nestedSeqKeepsLiteral(() => 1, () => 2),
  seqDefaultKeepsLiteral(() => 1),
  viaNestedDefault,
  wrapNestedDefault,
  viaOptionalNav,
  viaOptionalNavInstance,
  viaOptionalNavSymbol,
  assignForms(() => 1, () => 2),
  viaClosedAlias,
  noClaimOnClosedAlias,
  closeOver,
  noClaimUnderOptionalWrite,
  noClaimBehindBlockShadow,
  paramHop(),
  paramHopStatic(),
  paramHopInstance(),
  paramHopWrapped(),
  forOfHop(),
  viaIifeCtor,
  viaIifeInstance,
  paramWrappedInstance(),
  viaIifeWrappedStatic,
  forOfWrapped(),
  boundKeyParam(),
  viaBoundKeyIife,
  viaSeqArg,
  viaBoundHopCtor,
  viaBoundHopAt,
  viaBoundHopAlias,
  viaBoundHopIdent({ w: [1, 2] }),
  viaBoundHopHeads([{ w: [9] }]),
  viaKeyedWrapper,
  assignKeyedWrapper,
  restAssignSentinel(),
  viaSeqSlot(() => 1, [1, 2]),
  ctorUnderRest(),
  liftedHusk(() => [1], () => 2),
  literalBehindSpread({}),
  slotMemoHoist(() => [1, 2], { p: [3] }),
  holeThenSlot(() => 1, () => [4]),
  slotMemoSiblingDecl(() => [1, 2]),
  inSlotFlatFamily(() => [1, 2], () => 2, () => [3]),
  twoHostsOneDeclaration(() => [[1], 2]),
  ctorBesideSibling(() => 4),
  defaultKeepsGuard(),
  siblingKeepsResidual(() => 0),
  navBelowMemoSlot(() => 0),
  mixedHopAndWrappedStatic(),
  exportWrappedSet, ee, exportWrappedMap, ef, exportHopMap, eg, exportWrappedBeside, eh,
];
