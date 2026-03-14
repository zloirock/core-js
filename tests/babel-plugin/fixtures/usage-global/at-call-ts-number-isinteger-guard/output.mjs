import "core-js/modules/es.array.at";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.at";
function foo(x: number[] | number) {
  if (Number.isInteger(x)) {
    x.at(-1);
  }
}