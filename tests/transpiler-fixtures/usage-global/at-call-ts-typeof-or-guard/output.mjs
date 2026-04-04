import "core-js/modules/es.string.at";
function foo(x: string | number[]) {
  if (typeof x === 'string' || typeof x === 'number') {
    x.at(-1);
  }
}