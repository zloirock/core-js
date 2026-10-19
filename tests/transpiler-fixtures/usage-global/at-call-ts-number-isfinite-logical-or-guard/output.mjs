import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.string.at";
// a false `Number.isFinite` leaves `x` a possible number (`NaN`), so the right operand reads the whole
// `string | number`, and `at` injects from the string arm, the only one carrying it
function foo(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return Number.isFinite(x) || x.at(-1);
}