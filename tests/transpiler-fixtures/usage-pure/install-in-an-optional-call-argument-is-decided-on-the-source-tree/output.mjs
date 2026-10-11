import _at from "@core-js/pure/actual/instance/at";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// an install in an argument of an optional instance call is decided on the tree as the source wrote it, before
// pure rebuilds the call around it: it never runs, and the read after it takes the pure import
list == null ? void 0 : _at(list).call(list, false);
export const seen = new _WeakSet();