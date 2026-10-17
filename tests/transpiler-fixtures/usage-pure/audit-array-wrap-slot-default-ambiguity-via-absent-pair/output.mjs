import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// absent element with a receiver default: the hole fires the default, which is mirrored whole
const [{
  WeakSet: K
} = {
  WeakSet: _WeakSet
}] = [];
export const viaAbsentPair = new K();