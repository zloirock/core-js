import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// disabled global-shorthand and computed Symbol.iterator leaves of a nested-proxy flatten
// keep their native residual reads; the enabled siblings still extract
const groupBy = _Map$groupBy;
const {
  // core-js-disable-next-line
  Iterator
} = _globalThis;
const og = _Object$groupBy;
const {
  // core-js-disable-next-line
  [Symbol.iterator]: it
} = _globalThis;
console.log(groupBy, Iterator, og, it);