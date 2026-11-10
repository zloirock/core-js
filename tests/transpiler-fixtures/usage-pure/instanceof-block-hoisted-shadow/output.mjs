import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// A block-hoisted local constructor is not the same-named global.
export function read(value) {
  {
    var Array = _Map;
  }
  if (value instanceof Array) return _at(value).call(value, 0);
  return null;
}