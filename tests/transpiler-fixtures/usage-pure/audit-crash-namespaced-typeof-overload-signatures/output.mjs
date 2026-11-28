import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Qualified typeof resolves the last ambient overload to its actual declaration.
declare namespace NS {
  function fn(x: number): string;
  function fn(x: string): number[];
}
type T = ReturnType<typeof NS.fn>;
declare const v: T;
_atMaybeArray(v).call(v, 0);
_includesMaybeArray(v).call(v, 2);