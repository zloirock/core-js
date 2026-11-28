import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
function second<T>(x: T, y: T): T {
  return y;
}
export const result = _atMaybeString(_ref = second<string | number[]>([7], "abc")).call(_ref, 0);