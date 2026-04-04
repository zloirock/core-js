import "core-js/modules/es.array.at";
function foo(x) {
  return typeof x === 'object' && x.at(-1);
}