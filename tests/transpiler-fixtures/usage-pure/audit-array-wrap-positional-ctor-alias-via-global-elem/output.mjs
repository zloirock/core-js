import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a multi-element array-wrap binds each ObjectPattern element to the init element at the SAME
// index: `A` reads `userObj.Set` (native, must NOT rewrite), `M` reads `globalThis.Map` (folds).
// resolving position-blindly (any element is a global) wrongly rewrote the user-object alias
const userObj = {
  Set: function () {}
};
const [{
  Set: A
}, {
  Map: M
}] = [userObj, {
  Map: _Map
}];
export const viaGlobalElem = _Map$groupBy([], x => x);