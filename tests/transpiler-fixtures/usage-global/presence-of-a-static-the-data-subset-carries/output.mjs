import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A static counts present by the data subset as a global does: excluding its module (`Array.from`) or its
// constructor's (`Map`, beside the `Map.groupBy` module the build still loads) only stops the build loading it,
// so a `||` over the static or its presence test decides and the dead part loads nothing. A static the subset
// lacks at the mode (`Iterator.range` below `full`) decides nothing: the right keeps its module (`Array.of`).
export const excludedStatic = Array.from || Object.fromEntries(pairs);
export const excludedConstructor = typeof Map.groupBy == 'function' ? 1 : Math.sumPrecise(list);
export const uncarried = Iterator.range || Array.of(item);