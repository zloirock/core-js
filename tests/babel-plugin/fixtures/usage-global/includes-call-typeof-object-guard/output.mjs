import "core-js/modules/es.array.includes";
function foo(x, y) {
  if (typeof x === 'object') {
    x.includes(y);
  }
}