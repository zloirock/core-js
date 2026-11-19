import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A returned object supplies its own method instead of the constructed prototype method.
class C {
  value() {
    return "ab";
  }
  constructor() {
    return {
      value() {
        return [4, 9];
      }
    };
  }
}
Reflect.construct(C, []).value().at(-1);