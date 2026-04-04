import "core-js/modules/es.string.at";
function foo(x: string | number[]) {
  if (typeof x === 'string') {
    x.at(-1);
  }
}