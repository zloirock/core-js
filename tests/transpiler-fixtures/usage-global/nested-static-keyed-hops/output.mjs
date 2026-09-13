import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Effectful outer keys retain the captured static receiver type.
// Both keys execute before their method binding initializes, and the method is
// polyfilled through either a realm hop or a property of an ordinary literal.
const events = [];
var {
  [(events.push('realm'), 'Array')]: {
    [(events.push(typeof from), 'from')]: from
  }
} = globalThis;
var {
  [(events.push('literal'), 'w')]: {
    [(events.push(typeof of), 'of')]: of
  }
} = {
  w: Array
};
export const result = [from([7])[0], of(8)[0], events];