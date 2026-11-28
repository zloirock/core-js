import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
type Opaque = {
  z: 1;
};
function widest<T extends unknown[]>(): T {
  return [] as any;
}
// @ts-expect-error an opaque argument the constraint does not admit is the shape under test
widest<Opaque>().includes(1);