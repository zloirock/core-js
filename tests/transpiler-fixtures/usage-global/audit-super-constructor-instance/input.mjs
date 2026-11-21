// The superclass initializes the WeakMap from the argument evaluated before super returns.
class C extends WeakMap {
  constructor(key) { super(Array.from([[key, 1]])); this.set(key, this.get(key) + 1); }
}
const key = {};
export const result = new C(key).get(key);
