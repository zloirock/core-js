import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Map += 1` - arithmetic compound assignment reads LHS before writing. usage-global must
// inject Map polyfill so the LHS read finds the constructor (otherwise ReferenceError on
// engines without native Map). semantics afterward are nonsense (`Map = Map + 1` makes Map
// a number) but the load-time polyfill is what prevents the ReferenceError
Map += 1;