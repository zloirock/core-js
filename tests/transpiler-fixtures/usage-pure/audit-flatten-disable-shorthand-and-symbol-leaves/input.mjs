// disabled global-shorthand and computed Symbol.iterator leaves of a nested-proxy flatten
// keep their native residual reads; the enabled siblings still extract
const {
  Map: { groupBy },
  // core-js-disable-next-line
  Iterator,
} = globalThis;
const {
  Object: { groupBy: og },
  // core-js-disable-next-line
  [Symbol.iterator]: it,
} = globalThis;
console.log(groupBy, Iterator, og, it);
