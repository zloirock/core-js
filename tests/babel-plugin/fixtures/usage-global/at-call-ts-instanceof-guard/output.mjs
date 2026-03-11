import "core-js/modules/es.array.at";
function foo(x: string | number[]) {
  if (x instanceof Array) {
    x.at(-1);
  }
}