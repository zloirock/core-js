import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.push";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.to-fixed";
// a partial number predicate's false answer keeps the number arm inside a span a claim rebuilds as
// well: the argument of an instance dispatch takes its own number member there too
export function viaDispatchArgument(x: string | number, acc: string[]) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  if (!Number.isInteger(x)) acc.push(x.toFixed(1));
}