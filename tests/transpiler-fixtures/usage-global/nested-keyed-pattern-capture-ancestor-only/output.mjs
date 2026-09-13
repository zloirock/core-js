import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An effectful outer key still captures the inner receiver when the leaf key is plain.
// The inner pattern keeps its nullish coercion before the method dispatch.
export function ancestor(make, outer) {
  const {
    [(outer(), 'w')]: {
      at: method
    }
  } = make();
  return method;
}