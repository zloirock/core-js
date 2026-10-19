import "core-js/modules/es.number.is-integer";
function foo(x: number[] | number) {
  if (Number.isInteger(x)) {
    // @ts-expect-error the member read is the probe, and the right answer is a type without it
    x.at(-1);
  }
}