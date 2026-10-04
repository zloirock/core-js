import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A getter in a folded computed key still runs at its original pattern slot.
// Static declarations, assignments and symbol reads preserve one key read each.
// A quiet data property retains the ordinary key-elision path.
const log = [];
const key = {
  get value() {
    log.push('key');
    return 0;
  }
};
const {
  [(key.value, 'from')]: from
} = Array;
let of;
({
  [(key.value, 'of')]: of
} = Array);
let iterator;
({
  [(key.value, Symbol.iterator)]: iterator
} = [1]);
const quiet = {
  value: 0
};
const {
  [(quiet.value, 'isArray')]: isArray
} = Array;
export { from, of, iterator, isArray, log };