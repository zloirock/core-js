import "core-js/modules/es.number.is-integer";
function foo(x: number[] | number) {
  if (Number.isInteger(x)) {
    x.at(-1);
  }
}