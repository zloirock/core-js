import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The instance getter reads before the following rest binding is initialized.
// The source receiver and later declarator each evaluate once in their own position.
export function read(make) {
  const [{
      at
    }, ...rest] = [make(() => rest), 2, 3],
    after = 4;
  return [at, rest, after];
}
export function readInterleaved(make) {
  const [before, {
    includes
  }, ...rest] = [2, make(() => [before, rest]), 3];
  return [before, includes, rest];
}