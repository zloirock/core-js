import _Map from "@core-js/pure/actual/map";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// A definite store replaces the existing array slot before its static read.
function swap(box) {
  _Reflect$set(box, 0, _Map);
  return box;
}
use(swap([Object])[0].groupBy([1, 2], x => x % 2));