import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Inner-scope ambient overload shadows outer-scope siblings of the same name (TS lexical
// scoping). The two outer `fn` overloads return string; the inner `fn` returns number[].
// ReturnType<typeof fn> inside probe() must resolve against the inner overload, so the
// result is Array and .at(0) emits the Array variant.
declare function fn(x: number): string;
declare function fn(x: string): string;
function probe() {
  // @ts-expect-error a declaration inside a body, which tsc refuses, gives the row a value of a local type
  declare function fn(x: boolean): number[];
  // @ts-expect-error a declaration inside a body, which tsc refuses, gives the row a value of a local type
  declare const r: ReturnType<typeof fn>;
  _atMaybeArray(r).call(r, 0);
}