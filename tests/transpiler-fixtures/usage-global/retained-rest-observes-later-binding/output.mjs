import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// The rest copy runs before the following constructor binding is initialized.
// Its getter observes TDZ even when an earlier static is extracted.
function observe() {
  try {
    note(typeof W);
  } catch (error) {
    note(error.name);
  }
  return 7;
}
Object.defineProperty(Number, 'orderProbe', {
  enumerable: true,
  get: observe
});
const {
  Number: {
    isInteger,
    ...numbers
  },
  WeakMap: W
} = (note('prefix'), globalThis);
use(isInteger, numbers, W);