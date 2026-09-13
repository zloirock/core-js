import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Each computed key runs after coercion of its own receiver, and each hop getter runs once.
// Capturing the outer pattern leaves the innermost method dispatch in that same order.
export function opaque(make, outer, leaf) {
  const {
    [(outer(), 'w')]: {
      [(leaf(), 'at')]: method
    }
  } = make();
  return method;
}