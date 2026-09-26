import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A captured array assignment keeps its stores and static rest exclusions.
// A neighbouring binding follows the nested static; a constructor rest uses its pure source.
let keys, realmRest, saved;
[{
  Object: {
    keys
  },
  ...realmRest
}] = [saved = (effect(), globalThis)];
let of, ctorRest, tail;
[{
  of,
  ...ctorRest
}, tail] = [Array, 7];
use(keys, realmRest, saved, of, ctorRest, tail);