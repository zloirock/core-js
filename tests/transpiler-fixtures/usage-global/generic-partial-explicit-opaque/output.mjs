import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
type Opaque = {
  z: 1;
};
function partial<T = number[], U = T>(): U {
  return [] as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
partial<Opaque>().includes(1);