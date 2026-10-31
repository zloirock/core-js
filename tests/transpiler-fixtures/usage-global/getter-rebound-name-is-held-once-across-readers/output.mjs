import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a name a GETTER of the same pattern may rebind (`arr = ...` inside the accessor) is not free to read
// again across the pattern's readers: the value is held once, and every reader reads the one the
// source destructured - a declaration, an assignment over a sequence, a nested slot, symbol keys
let arr = [1, 2];
Object.defineProperty(arr, 'at', {
  get() {
    arr = 'xy';
    return () => 'own';
  }
});
Object.defineProperty(arr, 'includes', {
  get() {
    arr = 'xy';
    return () => 'own';
  }
});
Object.defineProperty(arr, 'with', {
  get() {
    arr = 'xy';
    return () => 'own';
  }
});
const {
  at: a1,
  flat: f1
} = arr;
let a2, f2;
({
  includes: a2,
  flatMap: f2
} = (eff(), arr));
const {
  w: {
    with: a3,
    findLast: f3
  }
} = {
  w: arr
};
let list = [1, 2];
Object.defineProperty(list, Symbol.iterator, {
  get() {
    list = 'xy';
    return [][Symbol.iterator];
  }
});
const {
  [Symbol.iterator]: it4,
  [Symbol.asyncIterator]: ait4
} = list;
use(a1, f1, a2, f2, a3, f3, it4, ait4);