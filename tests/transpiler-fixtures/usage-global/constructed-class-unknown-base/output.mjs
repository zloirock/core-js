import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An unknown base can return an object without the subclass prototype.
// Its method return need not match the subclass declaration.
class C extends External {
  value() {
    return "ab";
  }
}
new C().value().at(-1);