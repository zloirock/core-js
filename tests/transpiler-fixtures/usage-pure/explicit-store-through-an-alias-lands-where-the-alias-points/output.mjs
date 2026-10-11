import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Promise from "@core-js/pure/actual/promise";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// an explicit store through an alias lands where the alias points, as a member write through it does: through
// an alias of an object this file does not own it hands the stored constructor out with its statics; through an
// alias of a container's slot it may replace what a read back of the slot finds, which stays native, and takes
// the entry carrying the statics, as any store under a member path does; through an alias of a container
// nothing reads it keeps the constructor's own entry
const lib = window.MyLib;
_Object$assign(lib, {
  Kind: _Promise
});
const shelf = {
  inner: {
    C: Object
  }
};
const into = shelf.inner;
_Object$assign(into, {
  [k]: _Map
});
export const grouped = shelf.inner.C.groupBy([1], x => x);
const quiet = {};
const unread = quiet;
_Object$assign(unread, {
  Pool: _WeakMap
});