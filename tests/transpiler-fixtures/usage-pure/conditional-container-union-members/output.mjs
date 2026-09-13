import _at from "@core-js/pure/actual/instance/at";
// A union cannot inherit the first container's element identity or member proof.
// The conditional admits both string and array results, so both at implementations are needed.
interface A {
  a: string;
}
interface B {
  b: number;
}
type Select<T> = T extends Array<B> ? number[] : string;
declare const v: Array<B> | Array<A>;
declare const result: Select<typeof v>;
_at(result).call(result, -1);