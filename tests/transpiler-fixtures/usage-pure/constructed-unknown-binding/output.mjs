import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Capturing an external constructor's result preserves its unknown family.
const held = new ExternalList();
_findLastMaybeArray(held).call(held, predicate);