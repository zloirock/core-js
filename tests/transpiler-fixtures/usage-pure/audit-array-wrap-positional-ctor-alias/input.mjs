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
export const viaSingleGlobal = S.union(other2);

// DEEP array-wrap layers pair positionally too: the global slot folds even when nested two levels
const [[{ Promise: D }]] = [[globalThis]];
export const viaDeepGlobal = D.any([]);
// a deep user-object slot stays native at depth (positional protection recurses)
const box = { Array: function () {} };
const [[{ Array: Q }]] = [[box]];
export const viaDeepUser = Q.of(1);
