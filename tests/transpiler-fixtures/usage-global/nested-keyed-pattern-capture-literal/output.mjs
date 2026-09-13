import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// A literal receiver keeps outer key effects even though its property value can be paired.
// The nested method reads that value only after both computed keys have evaluated.
export function literal(receiver, outer, leaf) {
  const {
    [(outer(), 'w')]: {
      [(leaf(), 'includes')]: method
    }
  } = {
    w: receiver
  };
  return method;
}