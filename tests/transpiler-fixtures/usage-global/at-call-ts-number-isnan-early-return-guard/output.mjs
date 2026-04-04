import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.string.at";
function foo(x: string | number) {
  if (Number.isNaN(x)) return;
  x.at(-1);
}