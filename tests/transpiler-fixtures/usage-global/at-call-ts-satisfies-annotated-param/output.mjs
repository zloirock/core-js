import "core-js/modules/es.array.at";
function foo(x: number[]) {
  (x satisfies readonly number[]).at(-1);
}