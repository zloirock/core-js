import "core-js/modules/es.number.is-safe-integer";
function foo(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return Number.isSafeInteger(x) && x.at(-1);
}