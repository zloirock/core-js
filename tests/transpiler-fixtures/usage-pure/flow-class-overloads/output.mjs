import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// @flow
// Bodyless overloads select by call arguments instead of choosing the last declaration.
declare class C {
  m(x: string): string,
  m(x: string, y: number): number[],
}
_atMaybeString(_ref = new C().m("x")).call(_ref, 0);
_includesMaybeArray(_ref2 = new C().m("x", 1)).call(_ref2, 1);