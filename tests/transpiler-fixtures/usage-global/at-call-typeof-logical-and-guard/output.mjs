import "core-js/modules/es.string.at";
function foo(x) {
  return typeof x === 'string' && x.at(-1);
}