import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// An object member preserves its string receiver type for a method shared with arrays.
const host = {
  value: 'abc'
};
const at = _atMaybeString(host.value);
export { at };