import "core-js/modules/es.array.at";
function foo(x) {
  if (typeof x === 'object') {
    x.at(-1);
  }
}