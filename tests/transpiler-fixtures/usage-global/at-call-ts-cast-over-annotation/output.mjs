import "core-js/modules/es.array.at";
function foo(x: string) {
  (x as any as number[]).at(-1);
}