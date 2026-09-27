import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// A rest parameter keeps the overload applicable beyond its fixed argument prefix.
declare class C {
  m(x: string, ...ys: number[]): number[],
  m(): string,
}
_atMaybeArray(_ref = new C().m("x", 1)).call(_ref, 0);