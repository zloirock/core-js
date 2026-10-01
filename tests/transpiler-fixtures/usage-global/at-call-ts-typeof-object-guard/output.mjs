import "core-js/modules/es.array.at";
function foo(x: string | number[]) {
  if (typeof x === 'object') {
    x.at(-1);
  }
}