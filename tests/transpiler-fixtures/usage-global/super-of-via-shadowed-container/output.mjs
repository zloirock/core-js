import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
let arraySlot;
switch (c) {
  case 1:
    arraySlot = {
      Base: Boolean
    };
    break;
  default:
    arraySlot = {
      Base: Array
    };
}
class OverArraySlot extends arraySlot.Base {
  static go() {
    const arraySlot = {
      Base: WeakMap
    };
    return [arraySlot, super.of(1)];
  }
}
export { OverArraySlot };