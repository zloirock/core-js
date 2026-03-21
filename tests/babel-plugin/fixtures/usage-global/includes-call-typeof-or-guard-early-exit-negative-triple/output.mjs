import "core-js/modules/es.array.includes";
function foo(x) {
  if (typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') return;
  x.includes(y);
}