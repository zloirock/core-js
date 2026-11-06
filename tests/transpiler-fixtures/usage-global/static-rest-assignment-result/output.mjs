import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// The consumed assignment keeps its receiver and runs each key before its write.
let of, from, rest;
const held = {
  [(log(typeof of), 'of')]: of,
  from,
  ...rest
} = get();
function get() {
  log('receiver');
  return Array;
}
use(held, of(1), from([2]), rest);