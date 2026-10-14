import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// A destructure host fills its pattern after its value, and serving a static off the pattern keeps
// that order though the rewrite moves the parts: the value's prefix lands ahead of what is left of
// the host, a computed key moves into the extraction's value. A read in a key sees the prefix's
// write, and a read after the host sees the key's.
let text = [1, 2],
  head,
  from,
  first;
({
  from,
  [(head = text.at(0), 'of')]: first
} = (text = 'ab', Array));
let list;
const {
  entries,
  [(list = 'cd', 'values')]: make
} = (list = [3], Object);
export const tail = list.includes('c');
export const made = [from, first, entries, make, head];