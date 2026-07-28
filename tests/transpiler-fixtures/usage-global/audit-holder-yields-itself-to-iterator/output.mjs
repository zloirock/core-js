import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `for...of` head calls the holder's OWN iterator, and an object literal cannot spell that key out
// - so a COMPUTED key, or a SPREAD copying another object's own enumerable properties in, can hand
// the holder itself to the loop, where a write reaches the very field the narrow was taken from.
// every family that field could then belong to has to be covered. a holder that can carry no
// iterator at all cannot be iterated: the loop throws before binding, so its narrow stays
// single-family. one row per channel, each reading its field with a method carried by a DIFFERENT
// second family - array+iterator, array+string, array+string again for the negative - so the three
// verdicts stay apart in one import set
const yielded = {
  items: [1, 2],
  [Symbol.iterator]() {
    return {
      next: () => ({
        done: true
      })
    };
  },
  read() {
    return this.items.find(x => x);
  }
};
for (const el of yielded) sink(el);
const viaSpread = {
  ...source,
  rows: [1, 2],
  read() {
    return this.rows.at(0);
  }
};
for (const el of viaSpread) sink(el);
const plain = {
  cells: [1, 2],
  read() {
    return this.cells.includes(1);
  }
};
for (const el of plain) sink(el);