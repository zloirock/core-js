import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-collections.keys";
// A prior pure import supplies keys on the receiver default. Its native slot read stays live,
// while the escaping parameter's at dispatches on the actual incoming receiver. Supplied undefined
// properties remain undefined; no leaf fallback is introduced.
import Keys from '@core-js/pure/actual/object/keys';
export function read({
  keys,
  at
} = {
  keys: Keys
}) {
  return [keys, at];
}