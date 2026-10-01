// a `for...of` head and an array spread both call the holder's OWN iterator, and an object literal
// cannot spell that key out - so a COMPUTED key, or a SPREAD copying another object's own enumerable
// properties in, means the holder may yield `this` straight into the consumer, where a write reaches
// the very field the narrow was taken from. with neither, nothing can iterate it at all: the loop
// throws before binding and the narrow stands
const yielded = {
  rows: [1, 2],
  [Symbol.iterator]() {
    return { next: () => ({ done: true }) };
  },
  read() {
    return this.rows.at(0);
  }
};
for (const el of yielded) sink(el);
const plain = {
  cells: [1, 2],
  read() {
    return this.cells.at(0);
  }
};
for (const el of plain) sink(el);
const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    return this.slots.includes(1);
  }
};
for (const el of viaSpread) sink(el);
