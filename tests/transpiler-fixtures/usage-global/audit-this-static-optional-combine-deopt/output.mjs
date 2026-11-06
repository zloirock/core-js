import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// usage-global counterpart of the pure deopt: `this.X?.()` in a static method of a subclass of
// Array is an inherited-static read, so es.array.from injects alongside the trailing instance
// methods' modules; the expression itself stays verbatim (global mode mutates built-ins)
class C extends Array {
  static make() {
    return this.from?.([1, 2]).flat().at(0);
  }
}
export const r = C.make();