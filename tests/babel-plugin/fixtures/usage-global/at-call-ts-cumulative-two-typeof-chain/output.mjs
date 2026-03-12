import "core-js/modules/es.array.at";
function foo(x: string | number | number[]) {
  if (typeof x === 'number') return;
  if (typeof x === 'string') return;
  x.at(-1);
}