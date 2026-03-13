import "core-js/modules/es.array.at";
function foo(x) {
  if (typeof x === 'string') return;
  x.at(-1);
}