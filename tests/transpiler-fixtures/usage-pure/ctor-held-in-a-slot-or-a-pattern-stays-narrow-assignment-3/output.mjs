import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a write nothing ever reads back is owed by neither flavor - nothing can observe the statics of a
// value stored where the file never looks again
const unread = {
  k: Object
};
unread.k = _WeakMap;