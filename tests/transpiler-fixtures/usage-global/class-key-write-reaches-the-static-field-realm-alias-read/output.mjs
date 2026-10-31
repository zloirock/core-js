import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write in a class key runs before the static field values above it, so a field reading a member off a
// realm alias reads it off what the key stored: usage-global loads the static of the realm's constructor
// and of the one the stored object names
let g = globalThis;
export class Grouped {
  static byParity = g.Map.groupBy(xs, x => x % 2);
  static [(g = {
    Map: Object
  }, 'k')] = 1;
}