import "core-js/modules/es.number.is-safe-integer";
function foo(x: string | number) {
  return Number.isSafeInteger(x) && x.at(-1);
}