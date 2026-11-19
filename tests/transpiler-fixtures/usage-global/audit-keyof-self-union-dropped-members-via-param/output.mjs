import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// runtime analogue through a constrained type param: the untyped member bails the same way
interface LooseC {
  cs: number[];
  loose;
}
export function viaParam<T extends LooseC>(o: T, k: keyof T) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return o[k].includes(3);
}