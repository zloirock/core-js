import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A later numeric key preserves the array type of its own element.
const at = _atMaybeArray([1, 2]);
export { at };