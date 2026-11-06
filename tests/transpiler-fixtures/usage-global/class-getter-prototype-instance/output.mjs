import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// A closed class getter yields a known constructor whose prototype has its instance family.
// The getter remains one live receiver read, including in a nested pattern.
class Box {
  static get C() {
    effect();
    return Array;
  }
}
use(Box.C.prototype.at);
const {
  C: {
    prototype: {
      includes
    }
  }
} = Box;
use(includes);