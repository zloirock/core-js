import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _JSON$rawJSON from "@core-js/pure/actual/json/raw-json";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
import _String$raw from "@core-js/pure/actual/string/raw";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _URL from "@core-js/pure/actual/url/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a multi-element array-wrap binds each ObjectPattern element to the init element at the SAME
// index: `A` reads `userObj.Set` (native, must NOT rewrite), `M` reads `globalThis.Map` (folds).
// resolving position-blindly (any element is a global) wrongly rewrote the user-object alias
const userObj = {
  Set: function () {}
};
const M = _Map;
const [{
  Set: A
}, {
  Map: _unused
}] = [userObj, _globalThis];
export const viaUserElem = A.union(other);
export const viaGlobalElem = _Map$groupBy([], x => x);

// both-global multi-element: each folds to its own positional global
const P = _Promise;
const [{
  Array: F
}, {
  Promise: _unused2
}] = [_globalThis, _globalThis];
export const viaBothA = _Array$from([1]);
export const viaBothB = _Promise$allSettled([]);

// single-element user array-wrap stays native; single-element global folds
const only = {
  Map: function () {}
};
const [{
  Map: U
}] = [only];
export const viaSingleUser = U.groupBy([], x => x);
const S = _Set;
export const viaSingleGlobal = new S(singleSeed);

// two whole-ctor extractions off ONE declarator keep their own per-name registrations: each
// alias's STATIC read folds through its own hint (a single per-declarator entry let the second
// registration clobber the first, stranding the first alias's reads on the local name)
const SM = _Symbol;
const MG = _Promise;
const [{
  Symbol: _unused3
}, {
  Promise: _unused4
}] = [_globalThis, _globalThis];
export const viaMultiExtractFirst = _Symbol$for(dedupeKey);
export const viaMultiExtractSecond = _Promise$resolve(ready);

// a computed LITERAL key registers like the plain form; an SE-bearing computed key keeps its
// own slot verbatim (the effect runs once in the residual) while the SIBLING element still
// narrows through its sound positional pairing; a slot write of ONE hint's global deopts only
// that alias - the sibling keeps folding
const WS = _WeakSet;
const PR = _Promise;
const [{
  ['WeakSet']: _unused5
}, {
  Promise: _unused6
}] = [_globalThis, _globalThis];
export const viaComputedLiteralKey = new WS();
export const viaComputedSibling = _Promise$allSettled([]);
let seKey = () => 'Number';
const [{
  [seKey()]: NU
}, {
  Math: MA
}] = [_globalThis, _globalThis];
export const viaSeKey = NU.isFinite(value);
export const viaSeKeySibling = _Math$sumPrecise(values);
const [{
  String: ST
}, {
  Object: OB
}] = [_globalThis, _globalThis];
Object = shim;
export const viaDeoptSibling = _String$raw(parts);
export const viaDeoptedAlias = OB.groupBy(items, tag);

// a shared BOUND proxy alias feeding both elements resolves each slot independently (the walk
// guard is a recursion stack - a completed hop must not poison the sibling's identical init);
// a mutated proxy KEY declines only its own slot, the sibling still narrows
const g = _globalThis;
const RE = _Reflect;
const [{
  Reflect: _unused7
}, {
  JSON: JS
}] = [g, g];
export const viaSharedAliasFirst = _Reflect$ownKeys(target);
export const viaSharedAliasSecond = _JSON$rawJSON(input);
_globalThis.RegExp = fake;
const WM = _WeakMap;
const [{
  RegExp: RX
}, {
  WeakMap: _unused8
}] = [_globalThis, _globalThis];
export const viaMutatedKeySlot = RX.escape(text);
export const viaMutatedKeySibling = new WM(entries);

// a same-name `var` redeclaration MERGES its per-binding entries (last write's hint serves the
// use - runtime last-write-wins); a CONDITIONAL `var` refuses flow-trust and folds through the
// runtime constructor guard instead, keeping the untaken path faithful
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var VB = _Symbol;
var VB = _Promise;
export const viaVarRedecl = _Promise$try(fn);
function condVar(c) {
  if (c) {
    var CB = _Iterator;
  }
  return CB && CB.range(0, c);
}
export const viaCondVar = condVar(cond);
/* eslint-enable no-redeclare, vars-on-top, block-scoped-var -- end of redeclaration shapes */

// a nested wrapper sibling that does NOT bind the name must not abort the positional scan
// (its subtree's "not found" is not a terminal answer) - the later element still resolves;
// a slot that DOES bind the name but cannot pair (spread-shifted inner init) keeps bailing
const XU = _URL;
const [[{
  URL: _unused9
}], {
  Number: NP
}] = [[_globalThis], _globalThis];
export const viaScanPastNestedSibling = _Number$parseFloat(text);
let unp = [{}];
const [[{
  Reflect: XR
}], z0] = [[...unp], 0];
export const viaBoundUnpairable = XR.has(target, propKey);

// a deeper array-wrap layer BESIDE a sibling registers through the same positional recursion
// as the alias judge - the deep alias's static keeps its fold (the one-ObjectPattern-level
// registration walk stranded it raw in babel while unplugin re-derived it)
const [[{
  Number: DN
}], keep2] = [[_globalThis], 1];
export const viaDeepSibling = _Number$parseInt(digits, 10);

// a same-name redeclaration of STATICS-ONLY hints merges last-wins like the ctor form - the
// use folds through the last write's hint (runtime last-write-wins)
var [{
  JSON: VR
}] = [_globalThis];
var [{
  Math: VR
}] = [_globalThis];
export const viaStaticsRedecl = _Math$cbrt(value2);

// DEEP array-wrap layers pair positionally too: the global slot folds even when nested two levels
const D = _Promise;
export const viaDeepGlobal = _Promise$any([]);
// a deep user-object slot stays native at depth (positional protection recurses)
const box = {
  Array: function () {}
};
const [[{
  Array: Q
}]] = [[box]];
export const viaDeepUser = Q.of(1);