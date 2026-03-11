import "core-js/modules/es.array.at";
function foo(x: string | number[]) {
  if (Array.isArray(x)) {
    x.at(-1);
  }
}