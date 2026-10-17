import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a call through an aliased QUALIFIED `typeof NS.fn` arg-discriminates the overload set
// exactly like the bare `typeof fn` form - the segments channel serves both; falling back
// to the type-level rightmost-overload rule ignored the args
declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = _atMaybeArray(_ref = f(5)).call(_ref, 0);