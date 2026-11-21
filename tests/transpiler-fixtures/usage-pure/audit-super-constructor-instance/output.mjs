import _Array$from from "@core-js/pure/actual/array/from";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// The superclass initializes the WeakMap from the argument evaluated before super returns.
class C extends _WeakMap {
  constructor(key) {
    super(_Array$from([[key, 1]]));
    this.set(key, this.get(key) + 1);
  }
}
const key = {};
export const result = new C(key).get(key);