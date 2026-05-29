// Inner-scope ambient overload shadows outer-scope siblings of the same name (TS lexical
// scoping). The two outer `fn` overloads return string; the inner `fn` returns number[].
// ReturnType<typeof fn> inside probe() must resolve against the inner overload, so the
// result is Array and .at(0) emits the Array variant.
declare function fn(x: number): string;
declare function fn(x: string): string;
function probe() {
  declare function fn(x: boolean): number[];
  declare const r: ReturnType<typeof fn>;
  r.at(0);
}
