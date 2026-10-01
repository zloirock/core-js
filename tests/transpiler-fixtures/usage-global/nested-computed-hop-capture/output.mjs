import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// Capture a nested receiver before evaluating its computed hop, even for one leaf.
// The receiver runs once; instance leaves beside object rest keep their native boundary.
function read(source, key) {
  const {
    [(key(), 'data')]: {
      at
    }
  } = source;
  return at;
}
function readSiblings(source, key) {
  const {
    before,
    [(key(), 'data')]: {
      includes,
      ...rest
    },
    after
  } = source;
  return [before, includes, rest, after];
}