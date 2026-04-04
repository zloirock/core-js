import "core-js/modules/es.string.at";
function foo(x) {
  if (typeof x === 'object') return;
  x.at(-1);
}