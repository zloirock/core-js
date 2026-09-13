import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/web.dom-collections.for-each";
// An inline function receives its argument directly; a tag puts its interpolation
// after the strings array. Both named writes must invalidate the later return type.
// Neither write releases the namespace. Distinct receivers keep both routes observable.
const o = {};
(function (ns) {
  ns.entries = patch;
})(Object);
Object.entries(o).forEach(noop);
function tag(strings, ns) {
  ns.ownKeys = patch;
}
tag`${Reflect}`;
Reflect.ownKeys(o).map(noop);