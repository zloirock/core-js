import "core-js/modules/es.number.is-finite";
function foo(x: string | number) {
  if (Number.isFinite(x)) {
    // @ts-expect-error the member read is the probe, and the right answer is a type without it
    x.at(-1);
  }
}