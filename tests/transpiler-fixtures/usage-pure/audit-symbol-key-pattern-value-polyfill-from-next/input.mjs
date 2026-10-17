// Well-known-symbol patterns read the selected iterator method and retain nested defaults.
// Computed sibling keys and effectful receivers keep their order beside static and instance claims.
const obj = {
  Array: { from: Array.from },
  [Symbol.iterator]: Array.prototype[Symbol.iterator],
};
const { Array: { from }, [Symbol.iterator]: { next = [1].at(0) } } = obj;
export { from };
export { next };
