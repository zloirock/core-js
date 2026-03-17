import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.string.at";
function foo(x: string | number) {
  return Number.isFinite(x) || x.at(-1);
}