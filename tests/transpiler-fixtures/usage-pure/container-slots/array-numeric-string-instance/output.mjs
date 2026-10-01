import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A numeric object-pattern key preserves the string type of its selected array element.
const at = _atMaybeString('abc');
export { at };