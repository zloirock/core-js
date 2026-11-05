import _globalThis from "@core-js/pure/actual/global-this";
// A user object's Set property is not the realm's Set constructor.
// Its union read stays native even beside a separately resolved realm element.
const userObj = {
  Set: function () {}
};
const [{
  Set: A
}, {
  Map: M
}] = [userObj, _globalThis];
export const viaUserElem = A.union(other);