import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
function second<T, U>(a: T, b: U, ...rest: unknown[]): U {
  return b;
}
const xs = ["abc", "def"] as const;
export const result = _atMaybeString(_ref = second(...xs, [7])).call(_ref, 0);