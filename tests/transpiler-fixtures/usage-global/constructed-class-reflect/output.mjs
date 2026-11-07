import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A class constructor can return an object outside its declared instance family.
// The field stays unknown; this is a presence control for its instance-method polyfill.
// Reads from that replacement must retain instance polyfills.
class C {
  constructor() {
    return {
      value: [1, 2, 3]
    };
  }
  value = "abc";
}
Reflect.construct(C, []).value.at(-1);