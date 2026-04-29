import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `interface I { m(...args) }` parses as an interface declaration with a method signature
// holding a rest-param. type-only shape has no body slot to retype, so rest gets rewritten
// to a bare identifier preserving its type annotation. Unrelated chain confirms the
// transform reaches usage detection
interface I {
  m(...args: number[]): void;
}
declare const arr: number[];
_includesMaybeArray(arr).call(arr, 1);