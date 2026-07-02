import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Const-bound `wrapper = { ns: Object }` plus `AssignmentPattern` default exercises static-object descent.
// Default never fires for known constructors, so flatten must peel it and emit a polyfill alias.
const wrapper = {
  ns: Object
};
const entries = _Object$entries;
const arr = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, ['k', 1]);