import "core-js/modules/es.string.at";
function foo(x) {
  if (typeof x !== 'string') return;
  x.at(-1);
}