import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `for...of` head and an array spread both call the holder's OWN iterator, and an object literal
// cannot spell that key out - so a COMPUTED key, or a SPREAD copying another object's own enumerable
// properties in, means the holder may yield `this` straight into the consumer, where a write reaches
// the very field the narrow was taken from. with neither, nothing can iterate it at all: the loop
// throws before binding and the narrow stands
const yielded = {
  rows: [1, 2],
  [_Symbol$iterator]() {
    return {
      next: () => ({
        done: true
      })
    };
  },
  read() {
    var _ref;
    return _at(_ref = this.rows).call(_ref, 0);
  }
};
for (const el of yielded) sink(el);
const plain = {
  cells: [1, 2],
  read() {
    var _ref2;
    return _atMaybeArray(_ref2 = this.cells).call(_ref2, 0);
  }
};
for (const el of plain) sink(el);
const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    var _ref3;
    return _includes(_ref3 = this.slots).call(_ref3, 1);
  }
};
for (const el of viaSpread) sink(el);