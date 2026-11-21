import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// An instance super call reads and initializes the inherited WeakMap slot.
class A extends _WeakMap {
  read(k) {
    return super.getOrInsert(k, 1);
  }
}
const cache = new A();
const key = {};
export const values = [cache.read(key), cache.get(key)];