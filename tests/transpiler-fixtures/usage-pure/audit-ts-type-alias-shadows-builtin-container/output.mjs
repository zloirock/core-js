import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A local type alias named String shadows the built-in container type.
// Its Array body selects the Array family for the shared at method.
type String = number[];
declare const source: String;
export function read(_ref = source) {
  let at = _atMaybeArray(_ref);
  return at;
}