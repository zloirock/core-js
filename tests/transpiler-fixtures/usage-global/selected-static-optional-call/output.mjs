import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Both the receiver and its method can short-circuit independently.
export function read(choice) {
  const A = choice ? Array : null;
  return A?.from?.([3]);
}