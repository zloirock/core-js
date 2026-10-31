import _globalThis from "@core-js/pure/actual/global-this";
// a destructure reads its keys - and runs its defaults - once the value it destructures has evaluated, so a write
// in that value, or in a default ahead of the key, has landed by the read: the key reads the user's slot, a realm
// hop and a global's static alike
const {
  self: {
    Array: A
  }
} = (_globalThis.self = fake, _globalThis);
const {
  groupBy
} = (_globalThis.Map = MyMap, _globalThis.Map);
const {
  a = _globalThis.Set = MySet,
  Set: S
} = _globalThis;
let B;
({
  self: {
    Array: B
  }
} = (_globalThis.self = other, _globalThis));
export { A, groupBy, a, S, B };