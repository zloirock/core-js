import "core-js/modules/es.array.at";
// overloaded `fn`: TS resolves Parameters<typeof fn> against the LAST overload head, so [0] is
// the number[] param (Array), not the string param of the first head - x.at is es.array.at
declare function fn(a: string): void;
declare function fn(a: number[]): void;
function foo(x: Parameters<typeof fn>[0]) {
  x.at(-1);
}