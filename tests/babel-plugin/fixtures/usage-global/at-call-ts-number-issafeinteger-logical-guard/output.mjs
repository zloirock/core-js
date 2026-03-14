import "core-js/modules/es.array.at";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.string.at";
function foo(x: string | number) {
  return Number.isSafeInteger(x) && x.at(-1);
}