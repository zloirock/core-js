import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Each element binds the property of its own receiver, including a user object beside the realm.
// The later Map.groupBy call resolves through the second binding only.
const userObj = {
  Set: function () {}
};
const [{
  Set: A
}, {
  Map: M
}] = [userObj, _globalThis];
export const viaGlobalElem = _Map$groupBy([], x => x);