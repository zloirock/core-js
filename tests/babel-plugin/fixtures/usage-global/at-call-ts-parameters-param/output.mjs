import "core-js/modules/es.array.at";
declare function fn(a: number, b: string): void;
function foo(x: Parameters<typeof fn>) {
  x.at(-1);
}