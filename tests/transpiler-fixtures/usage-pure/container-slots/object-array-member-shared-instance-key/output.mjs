import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An object member preserves its array receiver type for a method shared with strings.
const host = {
  value: [1, 2]
};
const at = _atMaybeArray(host.value);
export { at };