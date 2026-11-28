import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const call: typeof NS.q;
_atMaybeArray(_ref = call(1)).call(_ref, 0);