import "core-js/modules/es.array.at";
import "core-js/modules/es.number.is-finite";
function foo(x: string | number | number[]) {
  if (Number.isFinite(x)) return;
  if (typeof x !== 'object') return;
  x.at(-1);
}