import "core-js/modules/es.string.at";
function foo(x) {
  (typeof x === 'string' || typeof x === 'number') && x.at(-1);
}