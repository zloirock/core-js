import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: unknown) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  x.at(-1);
}