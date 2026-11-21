// An instance super call reads and initializes the inherited WeakMap slot.
class A extends WeakMap {
  read(k) { return super.getOrInsert(k, 1); }
}
const cache = new A();
const key = {};
export const values = [cache.read(key), cache.get(key)];
