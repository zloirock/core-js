// Getter `get list(): number[]` vs method `next(): number[]` - both declare the
// same return type, but `i.list` is a property access (yielding `number[]`) and
// `i.next()` is a call (also yielding `number[]`). Both `.at(-1)` sites get the
// array-specific polyfill.
interface Iter {
  get list(): number[];
  next(): number[];
}
declare const i: Iter;
i.list.at(-1);
i.next().at(-1);
