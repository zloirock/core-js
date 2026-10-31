import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Constructor-shaped keys on a user object do not identify a builtin surface.
// The dispatch reads the string receiver held by that object's own navigation.
const source = {
  Array: {
    prototype: 'ab'
  }
};
const at = _atMaybeString(source.Array.prototype);
export { at };