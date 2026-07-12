import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
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
export const viaSingleGlobal = _Set.union(other2);

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