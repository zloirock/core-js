import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A canonical string index preserves the array type of its selected element.
const at = _atMaybeArray([1, 2]);
export { at };