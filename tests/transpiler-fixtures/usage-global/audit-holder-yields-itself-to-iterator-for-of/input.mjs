// A `for...of` head calls the holder's OWN iterator, and an object literal cannot spell that key out - so a COMPUTED key, or a
// SPREAD copying another object's own enumerable properties in, can hand the holder itself to the loop, where a write reaches the
// very field the narrow was taken from.
const yielded = {
  items: [1, 2],
  [Symbol.iterator]() {
    return { next: () => ({ done: true }) };
  },
  read() {
    return this.items.find(x => x);
  }
};
for (const el of yielded) sink(el);
