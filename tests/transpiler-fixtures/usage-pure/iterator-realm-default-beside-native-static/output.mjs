// A native constructor iterator default remains observable beside its realm sibling.
const {
  Map: {
    [Symbol.iterator]: iterator = fallback()
  },
  Object: {
    fromEntries
  }
} = globalThis;
export { iterator, fromEntries };