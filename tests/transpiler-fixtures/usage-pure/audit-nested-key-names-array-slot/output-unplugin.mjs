import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _sortMaybeArray from "@core-js/pure/actual/array/instance/sort";
import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// an object-pattern key can name an array SLOT - the language reads property '0' off an array host,
// so the walk to the receiver and the type resolver behind it must both read the element. one
// canonical index read serves every spelling; the guards it already carried do the rejecting
const spreadSrc = [[9]];
const firstSlot = (function () {
  const at = _atMaybeArray([1, 2]);
  return at;
})();
const stringSpelling = (function () {
  const flat = _flatMaybeArray([3, [4]]);
  return flat;
})();
const laterSlot = (function () {
  const findLast = _findLastMaybeArray([6, 7]);
  return findLast;
})();
// NEGATIVE: a hole has no element node
const overHole = (function () {
  const { 1: { keys } } = [[8], , [9]];
  return keys;
})();
// NEGATIVE: a spread anywhere shifts every static index
const overSpread = (function () {
  const { 0: { values } } = [...spreadSrc];
  return values;
})();
// NEGATIVE: a non-index name addresses an ordinary property, not a slot
const nonIndexName = (function () {
  const { length } = [[10]];
  return length;
})();
// NEGATIVE: a non-canonical spelling addresses an object key, not a slot
const nonCanonicalSpelling = (function () {
  const { '01': { entries } } = [[11]];
  return entries;
})();
// a slot holding a bare Identifier is a CONSTRUCTOR, whose keys are STATICS. an array literal is a
// container on BOTH sides now: the receiver walk descends its slots, and a patch THROUGH a slot
// reaches the mutation gate - so this resolves, and the patched twin below stays native
const constructorSlot = (function () {
  const keys = _Object$keys;
  return keys;
})();
// the object-literal twin IS a static container, so it resolves
const constructorUnderObjectKey = (function () {
  const entries = _Object$entries;
  return entries;
})();
// NEGATIVE: out of bounds
const outOfBounds = (function () {
  const { 5: { fromEntries } } = [[12]];
  return fromEntries;
})();
// NEGATIVE: a user's patch THROUGH the slot must win - the read side resolves the slot, so the write
// side has to see the same slot or the polyfill would silently override the replacement
const patched = [Array];
patched[0].from = function () { return []; };
const patchedSlotStaysNative = (function () {
  const { 0: { from } } = patched;
  return from;
})();
// NEGATIVE: the STRING spelling of that slot names it too, so a patch through it also wins
const patchedString = [Object];
patchedString['0'].values = function () { return []; };
const patchedStringSpellingStaysNative = (function () {
  const { 0: { values } } = patchedString;
  return values;
})();
// a container literal is DISCARDED whole by the collapse, so every effect it carries must be re-run
// once ahead of the extraction - a sibling slot's effect as much as the consumed one's
let effects = 0;
function bump() { effects += 1; return 0; }
const siblingEffectSurvives = (function () {
  const keys = (bump(), _Object$keys);
  return keys;
})();
// the object container in this host shape does not collapse at all - it stays verbatim, which keeps
// the effect too. locked as the boundary: the harvest matters where the collapse DOES discard
const objectSiblingEffectSurvives = (function () {
  const { k: { values } } = { x: bump(), k: Object };
  return values;
})();
// a container nested TWO levels deep still reaches its constructor - the descent follows any slot
// that can hold a built-in, not only the first level
const twoLevelContainer = (function () {
  const entries = _Object$entries;
  return entries;
})();
// a MEMBER read through the same container asks the same walk, so it resolves the static too - the
// destructure and member sides must not disagree about what a container holds
const memberReadThroughSlot = (function () {
  const box = [Object];
  return box[0].getOwnPropertyNames({});
})();
const memberReadThroughObjectKey = (function () {
  const w = { k: Object };
  return w.k.getOwnPropertyDescriptor({}, 'a');
})();
// NEGATIVE: a hoisted `var` container declared on a path the read ESCAPES is not the value read
// here, so the same dominance gate the key-alias fold uses keeps it native
export function escapingContainer(cond) {
  if (cond) { var late = { k: Object }; }
  return late.k.getOwnPropertyNames({});
}
// NEGATIVE: a slot REPLACED after the literal no longer holds what the literal spells, so descending
// it would resolve a DIFFERENT constructor's static - a wrong value, not a missed one. this is not a
// built-in mutation (nothing patches `Object`), so the namespace gate never sees it; the census
// records the written slot separately and the descent consults exactly that pair
const objectSlotReplaced = (function () {
  const w = { k: Object };
  w.k = _Map;
  const { k: { groupBy } } = w;
  return groupBy;
})();
const arraySlotReplaced = (function () {
  const box = [Object];
  box[0] = _Map;
  const { 0: { groupBy } } = box;
  return groupBy;
})();
// a write to an UNRELATED key on a constructor-holding container bails too - not through the
// slot record (which is per-slot and would not match) but through the older, broader gate that
// deopts the constructor the container's value fan reaches. locked as the boundary: the slot record
// narrows nothing here, it only adds the case that gate never saw
const unrelatedKeyWritten = (function () {
  const holder = { k: Object, other: 1 };
  holder.other = 2;
  const { k: { values } } = holder;
  return values;
})();
// NEGATIVE: an in-place array mutator REPOSITIONS existing indices, so the literal's element list
// stops describing what a slot holds - and a method CALL is no member write, so nothing else records
// it. the guard is a spec-closed set of repositioning methods; an APPEND is left out of it because it
// cannot disturb an existing index, though a `push` on a container bails through other machinery
// anyway, so that exclusion is not observable here
// each needs its OWN binding name: the record is per FILE and per NAME, so a slot WRITE on a
// same-named container elsewhere would bail these on the name alone and hide what they guard
const repositionedByUnshift = (function () {
  const shifted = [Object];
  shifted.unshift(_Map);
  const { 0: { groupBy } } = shifted;
  return groupBy;
})();
const repositionedBySplice = (function () {
  const spliced = [Object];
  _spliceMaybeArray(spliced).call(spliced, 0, 1, _Map);
  const { 0: { entries } } = spliced;
  return entries;
})();
const repositionedByReverse = (function () {
  const reversed = [Object, _Map];
  reversed.reverse();
  const { 0: { keys } } = reversed;
  return keys;
})();
// a DETACHED invocation of a repositioning method reaches the same receiver: `call` / `apply` put
// the method one hop deeper with the receiver as the first argument, `Reflect.apply` hands it second.
// a detached NON-mutating method must not bail its receiver
const repositionedByDetachedCall = (function () {
  const called = [Object];
  called.reverse.call(called);
  const { 0: { getOwnPropertyDescriptor } } = called;
  return getOwnPropertyDescriptor;
})();
const repositionedByReflectApply = (function () {
  const reflected = [Object];
  _Reflect$apply(reflected.reverse, reflected, []);
  const { 0: { getOwnPropertyNames } } = reflected;
  return getOwnPropertyNames;
})();
const detachedReadOnlyStillResolves = (function () {
  const sliced = [Object];
  _sliceMaybeArray(sliced).call(sliced, 0);
  const { 0: { getPrototypeOf } } = sliced;
  return getPrototypeOf;
})();
// once the method ESCAPES (stored, passed, returned), its invocation is not statically visible at
// all - the one member read that detaches it is what marks the receiver
const repositionedByStoredMethod = (function () {
  const storedBox = [Object, _Map];
  const m = storedBox.reverse;
  m.call(storedBox);
  const { 0: { groupBy } } = storedBox;
  return groupBy;
})();
// an object PATTERN detaches the method the same way, just without a member node
const repositionedByDestructuredMethod = (function () {
  const patternBox = [Object, _Map];
  const { reverse } = patternBox;
  reverse.call(patternBox);
  const { 0: { getOwnPropertyDescriptor } } = patternBox;
  return getOwnPropertyDescriptor;
})();
// the method key folds like any other: a concat spelling reaches the same mutator, and a key that
// folds to NOTHING reads an unknown member - `box[k]()` may invoke any mutator, so the census
// admits the possibility. a numeric key is a plain slot read and detaches nothing (locked above by
// every resolving slot cell)
const repositionedByConcatKey = (function () {
  const concatBox = [Object, _Map];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  concatBox['rev' + 'erse']();
  const { 0: { isFrozen } } = concatBox;
  return isFrozen;
})();
const repositionedByDynamicKey = (function () {
  const dynBox = [Object, _Map];
  dynBox[_globalThis.pick]();
  const { 0: { isSealed } } = dynBox;
  return isSealed;
})();
// the fold is what keeps a NON-mutator's folded spelling from tripping the wildcard: without it
// this concat key would read as unknown and needlessly bail the slot
const foldedReadOnlyKeyStillResolves = (function () {
  const foldedBox = [Object];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  _sliceMaybeArray(foldedBox).call(foldedBox, 0);
  const seal = _Object$seal;
  return seal;
})();
// the PATTERN spellings fold through the same formula: a concat key detaches the mutator, and an
// unfoldable computed key detaches an unknown member. every resolving slot cell above is already the
// numeric-pattern negative
const patternConcatDetaches = (function () {
  const patternConcatBox = [Object, _Map];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  const { ['rev' + 'erse']: pm } = patternConcatBox;
  pm.call(patternConcatBox);
  const { 0: { preventExtensions } } = patternConcatBox;
  return preventExtensions;
})();
const patternDynamicDetaches = (function () {
  const patternDynamicBox = [Object, _Map];
  const { [_globalThis.pick]: pd } = patternDynamicBox;
  pd?.call?.(patternDynamicBox);
  const { 0: { isExtensible } } = patternDynamicBox;
  return isExtensible;
})();
// --- probed member-path corners, locked as the boundary they showed ---
// an effectful sibling in the container survives a MEMBER-path collapse too
let memberEffects = 0;
function memberBump() { memberEffects += 1; return 0; }
// the METHOD is chosen to be un-patched in this file: `Object.values` is patched through a slot
// above, which rightly deopts that pair file-wide - the patch-wins canon, not a name collision
const memberSiblingEffectSurvives = (function () {
  const effectHolder = { x: memberBump(), k: Object };
  return _Object$getOwnPropertySymbols({ a: 1 });
})();
// an optional hop and a computed STRING key resolve like the plain spellings
const memberOptionalHop = (function () {
  const optionalHolder = { k: Object };
  return _Object$entries({ b: 2 });
})();
const memberComputedStringKey = (function () {
  const computedHolder = { k: Object };
  return _Object$getOwnPropertyNames({});
})();
// a let container REASSIGNED AFTER the read keeps the read's resolution
// NEGATIVE by design: reassigning the binding deopts its name file-wide (the mutated channel is
// per-file), so the read before the write stays native too - the conservative direction
const letReassignedAfterRead = (function () {
  let reassignedHolder = { k: Object };
  const out = reassignedHolder.k.freeze({});
  reassignedHolder = null;
  return out;
})();
// --- slot changes that are NOT plain member writes bail through TWO records: a container handed
// to ANY call escapes (the callee may write any slot - the mutator calls and the closure write are
// one family), and `delete` empties the slot it names ---
const assignedViaObjectAssign = (function () {
  const merged = { k: Object };
  _Object$assign(merged, { k: _Map });
  const { k: { groupBy } } = merged;
  return groupBy;
})();
const assignedViaDefineProperty = (function () {
  const defined = { k: Object };
  Object.defineProperty(defined, 'k', { value: _Map });
  const { k: { groupBy } } = defined;
  return groupBy;
})();
const assignedViaLogicalWrite = (function () {
  const logical = { k: Object };
  logical.k &&= _Map;
  const { k: { groupBy } } = logical;
  return groupBy;
})();
const deletedSlot = (function () {
  const dropped = { k: Object };
  delete dropped.k;
  const { k: { groupBy } = {} } = dropped;
  return groupBy;
})();
// the escape family covers every way a container leaves by value: a SPREAD spells an inline array
// out (or escapes the spread source), a `new` call hands arguments to the constructor, and a
// template TAG receives its interpolations like a call receives arguments
function consume(first) { if (first) first.k = _Map; }
const escapedBySpread = (function () {
  const spreadBox = { k: Object };
  consume(...[spreadBox]);
  const { k: { groupBy } } = spreadBox;
  return groupBy;
})();
// the container may sit INSIDE the argument's value - the walk descends literals, member reads
// off them, branches and spreads; an optional call escapes like a plain one
const escapedInsideArrayLiteral = (function () {
  const litBox = { k: Object };
  consume([litBox][0]);
  const { k: { getOwnPropertyNames } } = litBox;
  return getOwnPropertyNames;
})();
const escapedViaApplyArray = (function () {
  const applyBox = { k: Object };
  consume.apply(null, [applyBox]);
  const { k: { getOwnPropertyDescriptor } } = applyBox;
  return getOwnPropertyDescriptor;
})();
const escapedInsideObjectValue = (function () {
  const objBox = { k: Object };
  consume({ inner: objBox }.inner);
  const { k: { isFrozen } } = objBox;
  return isFrozen;
})();
// re-homing under another name is the same leak without a call: an alias takes writes the
// container's own name never sees, a wrapper literal hands the reference out through its member
// chain - and a member-read alias leaks its SLOT's value while the owner's other slots stay live
const escapedByAlias = (function () {
  const aliasedBox = { k: Object };
  const aliasName = aliasedBox;
  aliasName.k = _Map;
  const { k: { getPrototypeOf } } = aliasedBox;
  return getPrototypeOf;
})();
const escapedByWrapperLiteral = (function () {
  const wrappedBox = { k: Object };
  const wrapAround = { ref: wrappedBox };
  wrapAround.ref.k = _Map;
  const { k: { create } } = wrappedBox;
  return create;
})();
// the member-read leak is a PAIR, not a wildcard: aliasing one slot leaves the owner's other
// slots resolving; and a BRANCHING value escapes both arms - either may take the write
const aliasLeakIsPairPrecise = (function () {
  const twoSlots = { M: _Map, P: Object };
  const aliasM = twoSlots.M;
  void aliasM;
  const keys = _Object$keys;
  return keys;
})();
const branchEscapeBothArms = (function () {
  const armA = { k: Object };
  const armB = { k: Object };
  const picked = _globalThis.cond ? armA : armB;
  picked.k = _Map;
  const { k: { getOwnPropertyNames: fromA } } = armA;
  const { k: { getOwnPropertyDescriptor: fromB } } = armB;
  return [fromA, fromB];
})();
// iterating hands each VALUE to the loop binding, so the for-of head escapes like an argument;
// `for-in` yields keys only and leaks nothing - the read after it stays resolved
// a pattern over a LITERAL init re-homes the literal's members into the pattern's bindings, while
// a pattern over the container itself stays a plain read
const escapedByArrayPatternInit = (function () {
  const patBox = { k: Object };
  const [reHomed] = [patBox];
  reHomed.k = _Map;
  const { k: { getOwnPropertySymbols } } = patBox;
  return getOwnPropertySymbols;
})();
const escapedByObjectPatternInit = (function () {
  const objPatBox = { k: Object };
  const { taken } = { taken: objPatBox };
  taken.k = _Map;
  const { k: { fromEntries } } = objPatBox;
  return fromEntries;
})();
// the matching is POSITIONAL: only members landing on an IDENTIFIER binding re-home, a nested
// pattern keeps unpacking - so a deep literal re-homes through the matching branch while a nested
// pattern over an Identifier element stays the plain container read (locked by the flatten fixtures)
const escapedByNestedPatternLiteral = (function () {
  const deepBox = { k: Object };
  const [{ q: reBound }] = [{ q: deepBox }];
  reBound.k = _Map;
  const { k: { getOwnPropertyNames: deepRead } } = deepBox;
  return deepRead;
})();
// a throw re-homes its value into some catch binding; a switch DISCRIMINANT only compares, so it
// leaks nothing and the read stays resolved
// --- probed corners from earlier iterations, locked verbatim ---
// a member-CHAIN receiver behind a string key resolves the typed instance helper
const memberChainReceiverStringKey = (function () {
  const chainHost = { arr: [5, 6] };
  const fl = _findLastMaybeArray(chainHost.arr);
  return fl;
})();
// a const-bound computed key resolves into the typed instance helper on a param default
const constBoundComputedInstanceKey = (function () {
  const KEY = 'flat';
  return (function ({ [KEY]: f } = { [KEY]: _flatMaybeArray([3, [4]]) }) { return f; })();
})();
// a CLASS in a slot is a user constructor - nothing polyfillable, the read stays verbatim
const classInSlotStaysNative = (function () {
  const { 0: { make } } = [class Holder { static make() { return 1; } }];
  return make;
})();
// an effect INSIDE a nested slot moves with the extraction and runs once
let nestedSlotEffects = 0;
const nestedSeSlotKeepsEffect = (function () {
  const entries = ((nestedSlotEffects += 1, 0), _Object$entries);
  return entries;
})();
// the container REASSIGNED wholly before the read bails (the binding canon, not the slot record)
const containerWhollyReassigned = (function () {
  let swapped = { k: Object };
  swapped = { k: _Map };
  const { k: { groupBy } } = swapped;
  return groupBy;
})();
// a CONDITIONAL slot write still bails - reach is not disprovable without positions
const conditionalSlotWrite = (function (flag) {
  const maybe = { k: Object };
  if (flag) maybe.k = _Map;
  const { k: { entries } } = maybe;
  return entries;
})(1);
// a container arriving AS A PARAMETER is unknown - stays native
const parameterContainer = (function (incoming) {
  const { k: { values } } = incoming;
  return values;
})({ k: Object });
// the repositioning set is spec-closed: fill and sort bail like the three locked earlier,
// and an OPTIONAL mutator call reaches the same receiver
const repositionedByFill = (function () {
  const filled = [Object];
  _fillMaybeArray(filled).call(filled, _Map);
  const { 0: { isFrozen } } = filled;
  return isFrozen;
})();
const repositionedBySort = (function () {
  const sorted = [Object, _Map];
  _sortMaybeArray(sorted).call(sorted);
  const { 0: { isSealed } } = sorted;
  return isSealed;
})();
// a computed IDENTIFIER key reads the slot named by its VALUE - unreadable to the scope-less
// census, so it admits any mutator; a const-bound spelling is the everyday shape of that
const repositionedByBoundKey = (function () {
  const boundKeyBox = [Object, _Map];
  const methodName = 'reverse';
  boundKeyBox[methodName]();
  const { 0: { groupBy } } = boundKeyBox;
  return groupBy;
})();
// NEGATIVE by design: a VARIABLE index on a container is the unreadable-key over-bail - the census
// has no scope to fold `idx`, so it admits any member and the container's slots stop resolving.
// bias-safe: pure degrades to native, global keeps injecting through the union axis
const varIndexOverBail = (function () {
  const idxBox = [Object];
  const idx = 0;
  const picked = idxBox[idx];
  const { 0: { keys } } = idxBox;
  return [picked, keys];
})();
// a DATA array is no container, so the same spelling costs its neighbours nothing
// the method is chosen un-patched in this file (`Object.values` is patched through a slot above,
// which rightly deopts that pair file-wide - same trap as the member cell earlier)
const varIndexOnDataArray = (function () {
  const dataArr = [1, 2, 3];
  const dataIdx = 1;
  const untouchedNeighbour = { k: Object };
  const entries = _Object$entries;
  return [dataArr[dataIdx], entries];
})();
// the escape channel's NOISE boundary: a config object without a constructor in its values is no
// container (its travels cost neighbours nothing); a container merely READ by a callee still bails
// (the conservative price of the wildcard - the census cannot see the callee's body); and a method
// call ON the container itself is no argument escape, so its slots stay live
const configObjectIsNoContainer = (function () {
  const config = { handler() { return 1; }, limit: 5 };
  _JSON$stringify(config);
  const neighbour = { k: Object };
  const keys = _Object$keys;
  return keys;
})();
const readOnlyCalleeStillBails = (function () {
  function onlyReads(t) { return t.k; }
  const readOnlyEscape = { k: Object };
  onlyReads(readOnlyEscape);
  const { k: { entries } } = readOnlyEscape;
  return entries;
})();
const selfMethodCallLeaksNothing = (function () {
  const selfCall = { k: Object, ping() { return 1; } };
  selfCall.ping();
  const getOwnPropertyNames = _Object$getOwnPropertyNames;
  return getOwnPropertyNames;
})();
// async hosts ride the same channels: an async callee taking the container escapes it, and
// `await Promise.resolve(box)` bails through the ARGUMENT escape - the await itself adds nothing
const escapedByAsyncCallee = (function () {
  const asyncEscape = { k: Object };
  async function takeAsync(t) { t.k = _Map; }
  void takeAsync(asyncEscape);
  const { k: { keys } } = asyncEscape;
  return keys;
})();
const escapedThroughPromiseResolve = (function () {
  const awaitedBox = { k: Object };
  void _Promise$resolve(awaitedBox);
  const { k: { entries } } = awaitedBox;
  return entries;
})();
const repositionedByOptionalCall = (function () {
  const optionalMutated = [Object, _Map];
  optionalMutated?.reverse();
  const { 0: { isExtensible } } = optionalMutated;
  return isExtensible;
})();
const escapedByThrow = (function () {
  const thrownBox = { k: Object };
  try { throw thrownBox; } catch (caught) { caught.k = _Map; }
  const { k: { create: viaThrow } } = thrownBox;
  return viaThrow;
})();
const switchDiscriminantLeaksNothing = (function () {
  const switchBox = { k: Object };
  switch (switchBox) { default: break; }
  const viaSwitch = _Object$seal;
  return viaSwitch;
})();
const escapedByForOfHead = (function () {
  const loopBox = { k: Object };
  for (const x of [loopBox]) x.k = _Map;
  const { k: { defineProperties } } = loopBox;
  return defineProperties;
})();
const forInKeysLeakNothing = (function () {
  const inBox = { k: Object };
  let last;
  for (const key in inBox) last = key;
  void last;
  const defineProperty = _Object$defineProperty;
  return defineProperty;
})();
const escapedByYieldedArgument = (function () {
  function * hand(value) { yield value; }
  const yieldBox = { k: Object };
  for (const y of hand(yieldBox)) y.k = _Map;
  const { k: { setPrototypeOf } } = yieldBox;
  return setPrototypeOf;
})();
const escapedByOptionalCall = (function () {
  const optionalBox = { k: Object };
  consume?.(optionalBox);
  const { k: { isSealed } } = optionalBox;
  return isSealed;
})();
const escapedByNew = (function () {
  function TakerShape(target) { if (target) target.k = _Map; }
  const newBox = { k: Object };
  void new TakerShape(newBox);
  const { k: { entries } } = newBox;
  return entries;
})();
const escapedByTemplateTag = (function () {
  function tagShape(strings, value) { if (value) value.k = _Map; return ''; }
  const tagBox = { k: Object };
  void tagShape`x${ tagBox }`;
  const { k: { values } } = tagBox;
  return values;
})();
// a DYNAMIC write key deopts the whole container; the closure write is the escape family above
const dynamicWriteKey = (function (key) {
  const dynamic = { k: Object };
  dynamic[key] = _Map;
  const { k: { groupBy } } = dynamic;
  return groupBy;
})('k');
function poisonContainer(target) { target.k = _Map; }
const closureWrite = (function () {
  const closed = { k: Object };
  poisonContainer(closed);
  const { k: { entries } } = closed;
  return entries;
})();
export {
  memberSiblingEffectSurvives, memberOptionalHop, memberComputedStringKey, letReassignedAfterRead,
  escapedBySpread, escapedByNew, escapedByTemplateTag,
  escapedInsideArrayLiteral, escapedViaApplyArray, escapedInsideObjectValue, escapedByOptionalCall,
  escapedByAlias, escapedByWrapperLiteral, aliasLeakIsPairPrecise, branchEscapeBothArms,
  escapedByForOfHead, forInKeysLeakNothing, escapedByYieldedArgument,
  escapedByArrayPatternInit, escapedByObjectPatternInit, escapedByNestedPatternLiteral,
  escapedByThrow, switchDiscriminantLeaksNothing,
  memberChainReceiverStringKey, constBoundComputedInstanceKey, classInSlotStaysNative,
  nestedSeSlotKeepsEffect, nestedSlotEffects, containerWhollyReassigned, conditionalSlotWrite,
  parameterContainer, repositionedByFill, repositionedBySort, repositionedByOptionalCall,
  repositionedByBoundKey, varIndexOverBail, varIndexOnDataArray,
  configObjectIsNoContainer, readOnlyCalleeStillBails, selfMethodCallLeaksNothing,
  escapedByAsyncCallee, escapedThroughPromiseResolve,
  assignedViaObjectAssign, assignedViaDefineProperty, assignedViaLogicalWrite, deletedSlot,
  dynamicWriteKey, closureWrite, memberEffects,
  patternConcatDetaches, patternDynamicDetaches,
  foldedReadOnlyKeyStillResolves,
  repositionedByConcatKey, repositionedByDynamicKey,
  repositionedByDestructuredMethod,
  repositionedByStoredMethod,
  repositionedByDetachedCall, repositionedByReflectApply, detachedReadOnlyStillResolves,
  repositionedByUnshift, repositionedBySplice, repositionedByReverse,
  objectSlotReplaced, arraySlotReplaced, unrelatedKeyWritten,
  memberReadThroughSlot, memberReadThroughObjectKey,
  firstSlot, stringSpelling, laterSlot, overHole, overSpread, nonIndexName,
  nonCanonicalSpelling, outOfBounds, constructorSlot, constructorUnderObjectKey,
  patchedSlotStaysNative, patchedStringSpellingStaysNative,
  siblingEffectSurvives, objectSiblingEffectSurvives, twoLevelContainer, effects,
};